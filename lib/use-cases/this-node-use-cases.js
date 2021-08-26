/*
  Use Cases library for the thisNode entity.
*/

const ThisNodeEntity = require('../entities/this-node-entity')
const Schema = require('../adapters/schema')

// A global variable that maintains scope to the instance of this class, when
// the context of 'this' is lost.
let _this

class ThisNodeUseCases {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Must inject instance of adapters when instantiating thisNode Use Cases library.'
      )
    }
    this.controllers = localConfig.controllers
    if (!this.controllers) {
      throw new Error(
        'Must inject instance of controllers when instantiating thisNode Use Cases library.'
      )
    }
    this.statusLog = localConfig.statusLog
    if (!this.statusLog) {
      throw new Error(
        'Must specify a status log handler when instantiating thisNode Use Cases library.'
      )
    }

    // Optional JSON-LD used for announcements. If present, will override
    // default announcement object in Schema library.
    this.announceJsonLd = localConfig.announceJsonLd

    _this = this
  }

  // Create an instance of the 'self' of thisNode. This function aggregates
  // a lot of information pulled from the different adapters.
  async createSelf (initValues = {}) {
    const selfData = {
      type: initValues.type
    }

    // Aggregate data from the IPFS adapter.
    selfData.ipfsId = this.adapters.ipfs.ipfsPeerId
    selfData.ipfsMultiaddrs = this.adapters.ipfs.ipfsMultiaddrs

    // Aggregate data from the BCH adapter.
    const bchData = await this.adapters.bch.generateBchId()
    selfData.bchAddr = bchData.cashAddress
    selfData.slpAddr = bchData.slpAddress
    selfData.publicKey = bchData.publicKey
    // selfData.mnemonic = this.adapters.bch.mnemonic

    // Generate an OrbitDB for other peers to pass messages to this node.
    selfData.orbit = await this.adapters.orbit.createRcvDb(selfData)

    const schemaConfig = {
      ipfsId: selfData.ipfsId,
      type: selfData.type,
      ipfsMultiaddrs: selfData.ipfsMultiaddrs,
      isCircuitRelay: false,
      cashAddress: selfData.bchAddr,
      slpAddress: selfData.slpAddr,
      publicKey: selfData.publicKey,
      orbitdbId: selfData.orbit.id,
      // apiInfo: '',
      announceJsonLd: this.announceJsonLd
    }
    selfData.schema = new Schema(schemaConfig)

    // console.log('selfData: ', selfData)

    const thisNode = new ThisNodeEntity(selfData)
    this.thisNode = thisNode

    return thisNode
  }

  // This is an event handler that is triggered by a new announcement object
  // being recieved on the general coordination pubsub channel.
  // pubsub-use-cases.js/initializePubSub() depends on this function.
  async addSubnetPeer (announceObj) {
    try {
      // console.log('announceObj: ', announceObj)

      const thisPeerId = announceObj.from.toString()
      // console.log(`debug: announcement recieved from ${thisPeerId}`)

      // console.log('_this.thisNode.peerList: ', _this.thisNode.peerList)

      // Add a timestamp.
      const now = new Date()
      announceObj.data.updatedAt = now.toISOString()

      // If the peer is not already in the list of known peers, then add it.
      if (!_this.thisNode.peerList.includes(thisPeerId)) {
        _this.statusLog(`status: New peer found: ${thisPeerId}`)

        // Add this peer to the list of subnet peers tracked by this node.
        _this.thisNode.peerList.push(thisPeerId)

        // Add the announcement data object to the peerData array tracked by This Node.
        _this.thisNode.peerData.push(announceObj)

        // Subscribe to pubsub channel for private messages to peer.
        // Ignore any messages on this channel, since it is only used for
        // broadcasting encrypted messages to the new peer, and they will
        // respond on our own channel.
        await _this.adapters.ipfs.ipfs.pubsub.subscribe(
          thisPeerId,
          async msg => {}
        )
      } else {
        // Peer already exists in the list.

        // Get the data for this peer.
        let thisPeerData = _this.thisNode.peerData.filter(
          x => x.from === thisPeerId
        )
        thisPeerData = thisPeerData[0]
        const dataIndex = _this.thisNode.peerData.indexOf(thisPeerData)
        // console.log(`dataIndex: ${dataIndex}`)

        // Replace the old data with the new data.
        _this.thisNode.peerData[dataIndex] = announceObj
      }

      // Update the connection to the peers OrbitDB, if needed.
      await _this.adapters.orbit.connectToPeerDb({
        peerId: announceObj.from,
        orbitdbId: announceObj.data.orbitdb,
        thisNode: _this.thisNode
      })

      return true
    } catch (err) {
      console.error('Error in this-node-use-cases.js/addSubnetPeer()')
      throw err
    }
  }

  // Called by an Interval, ensures connections are maintained to known pubsub
  // peers. This will heal connections if nodes drop in and out of the network.
  async refreshPeerConnections () {
    try {
      // console.log('this.thisNode: ', this.thisNode)

      // const relays = this.cr.state.relays
      const relays = this.thisNode.relayData
      const peers = this.thisNode.peerList

      // Get connected peers
      // const connectedPeers = await _this.ipfs.swarm.peers()
      const connectedPeers = await this.adapters.ipfs.getPeers()
      // console.log('connectedPeers: ', connectedPeers)

      // Loop through each known peer
      // for (const peer in this.state.peers) {
      for (let i = 0; i < peers.length; i++) {
        // const thisPeer = this.state.peers[peer]
        const thisPeer = peers[i]
        // console.log(`thisPeer: ${JSON.stringify(thisPeer, null, 2)}`)

        // Check if target peer is currently conected to the node.
        const connectedPeer = connectedPeers.filter(
          peerObj => peerObj.peer === thisPeer
        )
        // console.log('connectedPeer: ', connectedPeer)

        // If this node is already connected to the peer, then skip this peers.
        // We do not need to do anything.
        if (connectedPeer.length) {
          console.log(`debug: Skipping. Already connected to peer ${thisPeer}`)
          continue
        }

        // Loop through each known circuit relay and attempt to connect to the
        // peer through a relay.
        for (let i = 0; i < relays.length; i++) {
          const thisRelay = relays[i]
          // console.log(`thisRelay: ${JSON.stringify(thisRelay, null, 2)}`)

          // Generate a multiaddr for connecting to the peer through a circuit relay.
          const multiaddr = `${thisRelay.multiaddr}/p2p-circuit/p2p/${thisPeer}`
          // console.log(`multiaddr: ${multiaddr}`)

          // Skip the relay if this node is not connected to it.
          if (thisRelay.connected) {
            // Attempt to connect to the node through a circuit relay.
            const connected = await this.adapters.ipfs.connectToPeer(multiaddr)

            // If the connection was successful, break out of the relay loop.
            // Otherwise try to connect through the next relay.
            if (connected) {
              // this.statusLog(
              //   'status: Successfully connected to peer through circuit relay.'
              // )

              // Break out of the loop once we've made a successful connection.
              break
            }
          }
        }
      }

      // const now = new Date()
      // this.statusLog(
      //   `status: ${now.toLocaleString()}: Renewed connections to all known peers.`
      // )
    } catch (err) {
      console.error('Error in refreshPeerConnections()')
      throw err
    }
  }
}

module.exports = ThisNodeUseCases
