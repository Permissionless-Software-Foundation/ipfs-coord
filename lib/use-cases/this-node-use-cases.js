/*
  Use Cases library for the thisNode entity.
*/

const ThisNodeEntity = require('../entities/this-node-entity')

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

    _this = this
  }

  // Create an instance of the 'self' of thisNode. This function aggregates
  // a lot of information pulled from the different adapters.
  async createSelf (initValues = {}) {
    const selfData = {
      type: initValues.type
    }

    // Aggregate data from the IPFS adapter.
    selfData.ipfsId = this.adapters.ipfs.state.ipfsPeerId
    selfData.ipfsMultiaddrs = this.adapters.ipfs.state.ipfsMultiaddrs

    // Aggregate data from the BCH adapter.
    const bchData = await this.adapters.bch.generateBchId()
    selfData.bchAddr = bchData.cashAddress
    selfData.slpAddr = bchData.slpAddress
    selfData.publicKey = bchData.publicKey
    // selfData.mnemonic = this.adapters.bch.mnemonic

    // Generate an OrbitDB for other peers to pass messages to this node.
    selfData.orbit = await this.adapters.orbit.createRcvDb(selfData)

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

      // If the peer is not already in the list of known peers, then add it.
      if (!_this.thisNode.peerList.includes(thisPeerId)) {
        console.log(`New peer found: ${thisPeerId}`)
        _this.statusLog(`status: New peer found: ${thisPeerId}`)

        // Add this peer to the list of subnet peers tracked by this node.
        _this.thisNode.peerList.push(thisPeerId)

        // Subscribe to pubsub channel for private messages to peer.
        // Ignore any messages on this channel, since it is only used for
        // broadcasting encrypted messages to the new peer, and they will
        // respond on our own channel.
        await _this.adapters.ipfs.ipfs.pubsub.subscribe(
          thisPeerId,
          async msg => {}
        )
      }

      // Add a timestamp.
      const now = new Date()
      announceObj.data.updatedAt = now.toISOString()

      // Add the announcement data object to the peerData array tracked by This Node.
      _this.thisNode.peerData.push(announceObj)

      // Update the connection to the peers OrbitDB, if needed.
      await _this.adapters.orbit.connectToPeerDb({
        peerId: announceObj.from,
        orbitdbId: announceObj.data.orbitdb,
        thisNode: _this.thisNode
      })
    } catch (err) {
      console.error('Error in this-node-use-cases.js/addSubnetPeer()')
      throw err
    }
  }
}

module.exports = ThisNodeUseCases
