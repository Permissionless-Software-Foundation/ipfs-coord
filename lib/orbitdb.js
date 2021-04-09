/*
  A library for handling anything to do with OrbitDB.

  OrbitDB is used to solve a specific problem:
  Communication relies on pubsub channels. Because IPFS is a constantly shifting,
  fully-distributed network, heavily relying on circuit relays, connections
  between peers can often move out from underneith them. The ipfs-lib.js library
  has Intervals that restore these broken connections, but there are frequently
  windows that last a few seconds, where peers will be unable to recieve
  messages published to their pubsub channel.

  OrbitDB solves this issue by persisting messages. When a peer announces itself
  on the coordination pubsub channel, the other peers will subscribe to their
  private pubsub channel for passing e2e encrypted message. Additionally, thanks
  to this OrbitDB library, each peer will have a personal OrbitDB database that
  peers will write messages to. Each peer maintains a copy of all the other
  peers databases. These short-lived databases persist messages, which solves
  the 'dropped call' problem.

  These OrbitDBs are short-lived, and should not grow in size to the point where
  they are prohibitive. Since OrbitDB is an append-only database, entries can't
  be deleted to shrink the size of the database. Instead, the databases need to
  be abandoned and new databases created, in order to prevent the database from
  growing prohibitively large.
*/

const OrbitDbClass = require('orbit-db')

let _this

class OrbitDB {
  constructor (orbitConfig) {
    this.OrbitDbClass = OrbitDbClass

    this.state = {
      peers: {},
      peerList: []
    }

    // Encapsulate dependencies
    this.peers = undefined // placeholder for an instance of the Peers lib.
    this.encrypt = undefined // placeholder for encryption lib

    // Private log handler to send decrypted messages to.
    this.privateLog = orbitConfig.privateLog

    // Cache to store hashes of processed messages. Used to prevent duplicate
    // processing.
    this.msgCache = []
    this.MSG_CACHE_SIZE = 10

    _this = this
  }

  // Adds instances of dependent libraries to this instance.
  addDeps (configObj) {
    try {
      this.peers = configObj.peers
      this.encrypt = configObj.encrypt
    } catch (err) {
      console.error('Error in orbitdb.js/addDeps()')
      throw err
    }
  }

  // Create a receiving database for this peer.
  async createRcvDb (ipfsNode) {
    // eslint-disable-next-line no-useless-catch
    try {
      // validate input
      if (typeof ipfsNode !== 'object') {
        throw new Error('The ipfs node must be an object')
      }

      this.ipfs = ipfsNode

      // Get ID information about this IPFS node.
      const id2 = await this.ipfs.id()
      this.state.ipfsPeerId = id2.id.toString()
      console.log(`This IPFS ID: ${this.state.ipfsPeerId}`)

      // creating orbit instance
      console.log('Starting OrbitDB...!')
      this.orbitdb = await this.OrbitDbClass.createInstance(this.ipfs, {
        repo: `./orbitdb/${this.state.ipfsPeerId}`
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
      const dbName = this.state.ipfsPeerId + timestamp
      this.db = await this.orbitdb.eventlog(dbName, options)

      // If the database already exists, load the last 5 entries saved to disk.
      await this.db.load(5)

      // Set up an event handler for when another peer writes to our DB.
      this.db.events.on('replicated', this.handleReplicationEvent)

      console.log('...OrbitDB is ready.')
      // console.log(`db id: ${this.db.id}`)

      return this.db.id
    } catch (err) {
      console.error('Error in orbitdb.js/startOrbit()')
      throw err
    }
  }

  // Event handler for when a peer publishes a message to this nodes Receive DB.
  async handleReplicationEvent (orbitdbId) {
    try {
      // console.log('Debug: ipfs-coord orbitdb.js/handleReplicationEvent() fired.')

      const newData = _this.db.iterator({ limit: 1 }).collect()
      // console.log(`newData: ${JSON.stringify(newData, null, 2)}`)

      const hash = newData[0].hash

      const alreadyProcessed = _this._checkIfAlreadyProcessed(hash)

      // Quietly exit if the hash has already been processed. (This eliminates
      // double processing the same entry).
      if (!alreadyProcessed) {
        // Get the most recent entry.
        const result = newData.map(e => e.payload.value)
        // console.log('result: ', result)

        // ToDo: Implement a FIFO array of the last 10 hashes. Skip processing if
        // the hash of the incoming message matches (has already been processed).
        // I'm noticing some duplicate entries.

        const decryptedStr = await _this.encrypt.decryptMsg(result[0].data)
        // console.log('decryptedStr: ', decryptedStr)

        _this.privateLog(decryptedStr, result[0].from)
      }
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

  // Publish a string of text to another peers OrbitDB recieve database.
  // orbitdbId input is optional.
  async sendToDb (peerId, str, orbitdbId) {
    try {
      // console.log('sendToDb() peerId: ', peerId)
      // console.log('sendToDb() str: ', str)

      const peer = this.peers.state.peers[peerId]

      // Encrypt the string with the peers public key.
      const encryptedStr = await this.encrypt.encryptMsg(peer, str)

      const now = new Date()

      // Exit quietly if this library has not yet subscribed to the peers orbitdb.
      if (!this.state.peers[peerId]) return

      const db = this.state.peers[peerId].db

      const dbObj = {
        from: this.state.ipfsPeerId,
        data: encryptedStr,
        timestamp: now.toISOString()
      }
      // console.log(`dbObj: ${JSON.stringify(dbObj, null, 2)}`)

      // Add the encrypted message to the peers OrbitDB.
      await db.add(dbObj)
    } catch (err) {
      console.error('Error in orbitdb.js/sendToDb()')
      throw err
    }
  }

  // Open another peers OrbitDB
  async connectToPeerDb (peerId, orbitdbId) {
    try {
      // console.log('connectToPeerDb() peerId: ', peerId)
      // console.log('connectToPeerDb() orbitdbId: ', orbitdbId)

      // Exit if invalid input is passed in.
      if (!peerId || !orbitdbId) return

      // If this is a new peer that we've never seen before.
      if (!this.state.peers[peerId]) {
        // Create a new OrbitDB instance for this newly discovered peer.
        // const orbitdb = await this.OrbitDbClass.createInstance(this.ipfs, {
        //   repo: `./orbitdb/${peerId}`
        // })
        const peerDb = await this.orbitdb.eventlog(orbitdbId)

        // Add this new peer to the state.
        this.state.peerList.push(peerId)
        this.state.peers[peerId] = {
          orbitdbId: orbitdbId,
          db: peerDb
        }
        //
      } else {
        // The peer is already known. Ensure we're still tracking the correct DB.

        if (orbitdbId !== this.state.peers[peerId].orbitdbId) {
          // OrbitDB for the peer has changed. Switch to the new DB.

          // Create a new OrbitDB instance for this newly discovered peer.
          // const orbitdb = await this.OrbitDbClass.createInstance(this.ipfs, {
          //   repo: `./orbitdb/${peerId}`
          // })
          const peerDb = await this.orbitdb.eventlog(orbitdbId)

          // Update the state to point to the new database for this peer.
          this.state.peers[peerId] = {
            orbitdbId: orbitdbId,
            db: peerDb
          }
        }
      }
    } catch (err) {
      console.error('Error in orbitdb.js/connectToPeerDb()')
      throw err
    }
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
}

module.exports = OrbitDB
