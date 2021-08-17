/*
  Adapters library for interacting with OrbitDB.

  OrbitDB is used by ipfs-coord to publish messages between peers, as opposed
  to publishing these messages directly to the pubsub channel. Publishing them
  through OrbitDB prevents 'dropped' messages.
*/

const OrbitDbClass = require('orbit-db')

class OrbitDBAdapter {
  constructor (localConfig = {}) {
    // Dependency injection
    this.ipfs = localConfig.ipfs
    if (!this.ipfs) {
      throw new Error(
        'An instance of IPFS must be passed when instantiating the OrbitDB Adapters library.'
      )
    }

    // Encapsulate dependencies
    this.OrbitDbClass = OrbitDbClass

    // Cache to store hashes of processed messages. Used to prevent duplicate
    // processing.
    this.msgCache = []
    this.MSG_CACHE_SIZE = 10
  }

  // Create a receiving database for this peer.
  async createRcvDb (selfData) {
    // eslint-disable-next-line no-useless-catch
    try {
      // validate input
      // if (typeof ipfsNode !== 'object') {
      //   throw new Error('The ipfs node must be an object')
      // }

      // this.ipfs = ipfsNode

      // Get ID information about this IPFS node.
      // const id2 = await this.ipfs.id()
      // this.state.ipfsPeerId = id2.id.toString()
      // console.log(`This IPFS ID: ${this.state.ipfsPeerId}`)

      // creating orbit instance
      console.log('Starting OrbitDB...')
      this.orbitdb = await this.OrbitDbClass.createInstance(this.ipfs.ipfs, {
        directory: `./.ipfsdata/orbitdb-ipfs-coord/${selfData.ipfsId}`
      })

      // Configure this instance of OrbitDB.
      const options = {
        accessController: {
          // Anyone can write to this database.
          write: ['*']
        }
      }

      const timestamp = this._getTimestamp()

      // Create/load orbitDB eventlog
      const dbName = selfData.ipfsId + timestamp
      this.db = await this.orbitdb.eventlog(dbName, options)

      // If the database already exists, load the last 5 entries saved to disk.
      await this.db.load(5)

      // Set up an event handler for when another peer writes to our DB.
      this.db.events.on('replicated', this.handleReplicationEvent)

      console.log('...OrbitDB is ready.')
      // console.log(`db id: ${this.db.id}`)

      // return this.db.id
      return this.db
    } catch (err) {
      console.error('Error in orbitdb.js/startOrbit()')
      throw err
    }
  }

  // Event handler for when a peer publishes a message to this nodes Receive DB.
  async handleReplicationEvent (orbitdbId) {
    try {
      console.log(
        'Debug: ipfs-coord orbitdb.js/handleReplicationEvent() fired.'
      )

      // const newData = _this.db.iterator({ limit: 1 }).collect()
      // // console.log(`newData: ${JSON.stringify(newData, null, 2)}`)
      //
      // const hash = newData[0].hash
      //
      // const alreadyProcessed = _this._checkIfAlreadyProcessed(hash)
      //
      // // Quietly exit if the hash has already been processed. (This eliminates
      // // double processing the same entry).
      // if (!alreadyProcessed) {
      //   // Get the most recent entry.
      //   const result = newData.map(e => e.payload.value)
      //   // console.log('result: ', result)
      //
      //   const decryptedStr = await _this.encrypt.decryptMsg(result[0].data)
      //   // console.log('decryptedStr: ', decryptedStr)
      //
      //   _this.privateLog(decryptedStr, result[0].from)
      // }
    } catch (err) {
      console.error('Error in orbitdb.js/handleReplicationEvent(): ', err)
    }
  }

  // Checks the hash to see if the message has already been processed. Returns
  // true if the hash exists in the list of processed messages.
  _checkIfAlreadyProcessed (hash) {
    // Check if the hash is in the array of already processed message.
    const alreadyProcessed = this.msgCache.includes(hash)

    // Update the msgCache if this is a new message.
    if (!alreadyProcessed) {
      // Add the hash to the array.
      this.msgCache.push(hash)

      // If the array is at its max size, then remove the oldest element.
      if (this.msgCache.length > this.MSG_CACHE_SIZE) {
        this.msgCache.shift()
      }
    }

    return alreadyProcessed
  }

  // Generate a fixed-length timestamp string for the DB name.
  _getTimestamp () {
    const now = new Date()

    let year = '00' + now.getYear()
    year = year.slice(-2)

    let month = '00' + (now.getMonth() + 1)
    month = month.slice(-2)

    let date = '00' + now.getDate()
    date = date.slice(-2)

    let hour = '00' + (now.getHours() + 1)
    hour = hour.slice(-2)

    const timestamp = `${year}${month}${date}${hour}`

    return timestamp
  }

  // Open another subnet peers OrbitDB
  async connectToPeerDb (dbData = {}) {
    try {
      const { peerId, orbitdbId, thisNode } = dbData

      console.log('connectToPeerDb() peerId: ', peerId)
      console.log('connectToPeerDb() orbitdbId: ', orbitdbId)

      // Exit if invalid input is passed in.
      if (!peerId || !orbitdbId) return

      // If this is a new peer that we've never seen before.
      if (!thisNode.orbitList.includes(peerId)) {
        // if (!this.state.peers[peerId]) {
        // Create a new OrbitDB instance for this newly discovered peer.
        // const orbitdb = await this.OrbitDbClass.createInstance(this.ipfs, {
        //   repo: `./orbitdb/${peerId}`
        // })
        const peerDb = await this.orbitdb.eventlog(orbitdbId)

        // Add this new peer to the OrbitDB list.
        thisNode.orbitList.push(peerId)

        // Add this database to the orbitData array.
        const dbData = {
          orbitdbId: orbitdbId,
          db: peerDb,
          ipfsId: peerId
        }
        thisNode.orbitData.push(dbData)
      } else {
        // The peer is already known. Ensure we're still tracking the correct DB.

        // Get the DB data associated with this peer.
        const dbData = thisNode.orbitData.filter(x => x.ipfsId === peerId)

        // Get the index of this dbData within the array.
        const dbIndex = thisNode.orbitData.indexOf(dbData[0])
        console.log('dbIndex: ', dbIndex)

        // If the DB name has changed, abandon the old DB and switch to the new DB.
        if (dbData[0].orbitdbId !== orbitdbId) {
          // OrbitDB for the peer has changed. Switch to the new DB.

          // Create a new OrbitDB instance for this newly discovered peer.
          // const orbitdb = await this.OrbitDbClass.createInstance(this.ipfs, {
          //   repo: `./orbitdb/${peerId}`
          // })
          const peerDb = await this.orbitdb.eventlog(orbitdbId)

          // Update the array entry, to point to the new database for this peer.
          const dbData = {
            orbitdbId: orbitdbId,
            db: peerDb,
            ipfsId: peerId
          }
          thisNode.orbitData[dbIndex] = dbData
        }
      }
    } catch (err) {
      console.error('Error in orbitdb.js/connectToPeerDb()')
      throw err
    }
  }
}

module.exports = OrbitDBAdapter
