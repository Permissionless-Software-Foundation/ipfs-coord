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

    // Optional JSON-LD used for announcements. If present, will override
    // default announcement object in Schema library.
    this.announceJsonLd = localConfig.announceJsonLd

    // If consuming app wants to configure itself as a Circuit Relay, it can
    // override the default value of false.
    this.isCircuitRelay = localConfig.isCircuitRelay
    if (!this.isCircuitRelay) this.isCircuitRelay = false

    // Additional information for connecting to the circuit relay.
    this.circuitRelayInfo = localConfig.circuitRelayInfo

    _this = this
  }

  // Update this instance with copies of the other Use Case libraries.
  updateUseCases (useCaseParent) {
    this.useCases = {
      relays: useCaseParent.relays,
      pubsub: useCaseParent.pubsub,
      peer: useCaseParent.peer
    }
  }

  // Create an instance of the 'self' of thisNode. This function aggregates
  // a lot of information pulled from the different adapters.
  async createSelf (initValues = {}) {
    const selfData = {
      // The type of IPFS node this is: browser or node.js
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
    // TODO: deprecate
    // selfData.orbit = await this.adapters.orbit.createRcvDb(selfData)

    const schemaConfig = {
      ipfsId: selfData.ipfsId,
      type: selfData.type,
      ipfsMultiaddrs: selfData.ipfsMultiaddrs,
      isCircuitRelay: this.isCircuitRelay,
      circuitRelayInfo: this.circuitRelayInfo,
      cashAddress: selfData.bchAddr,
      slpAddress: selfData.slpAddr,
      publicKey: selfData.publicKey,
      // orbitdbId: selfData.orbit.id,
      // apiInfo: '',
      announceJsonLd: this.announceJsonLd
    }
    selfData.schema = new Schema(schemaConfig)

    // console.log('selfData: ', selfData)

    // Create the thisNode entity
    const thisNode = new ThisNodeEntity(selfData)
    this.thisNode = thisNode

    // Attach ther useCases (which includes adapters and controllers) to the
    // thisNode entity.
    this.thisNode.useCases = this.useCases

    // Subscribe to my own pubsub channel, for receiving info from other peers.
    selfData.pubsub = await this.adapters.pubsub.subscribeToPubsubChannel(
      selfData.ipfsId,
      this.tempHander,
      this.thisNode
    )

    return thisNode
  }

  // This is an event handler that is triggered by a new announcement object
  // being recieved on the general coordination pubsub channel.
  // pubsub-use-cases.js/initializePubSub() depends on this function.
  async addSubnetPeer (announceObj) {
    try {
      // console.log('announceObj: ', announceObj)

      // Exit if the announcement object is stale.
      if (!_this.isFreshPeer(announceObj)) return

      const thisPeerId = announceObj.from.toString()
      _this.adapters.log.statusLog(
        2,
        `announcement recieved from ${thisPeerId}`
      )
      _this.adapters.log.statusLog(
        3,
        `announcement recieved from ${thisPeerId}: `,
        announceObj
      )

      // console.log('_this.thisNode.peerList: ', _this.thisNode.peerList)

      // Add a timestamp.
      const now = new Date()
      announceObj.data.updatedAt = now.toISOString()

      // If the peer is not already in the list of known peers, then add it.
      if (!_this.thisNode.peerList.includes(thisPeerId)) {
        _this.adapters.log.statusLog(0, `New peer found: ${thisPeerId}`)

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
          async msg => {
          }
        )

        // If the new peer has the isCircuitRelay flag set, then try to add it
        // to the list of Circuit Relays.
        if (announceObj.data.isCircuitRelay) {
          // console.log('_this.thisNode: ', _this.thisNode)
          await _this.useCases.relays.addRelay(thisPeerId, _this.thisNode)
        }

      // Subscribe to the private OrbitDB for this peer.
      // await _this.adapters.orbit.connectToPeerDb({
      //   peerId: announceObj.from,
      //   orbitdbId: announceObj.data.orbitdb,
      //   thisNode: _this.thisNode
      // })
      // _this.adapters.log.statusLog(
      //   2,
      //   `Connected to peer private OrbitDB: ${announceObj.data.orbitdb}`
      // )
      } else {
        // Peer already exists in the list.
        // console.log(`debug: Updating existing peer: ${thisPeerId}`)

        // Get the data for this peer.
        let thisPeerData = _this.thisNode.peerData.filter(
          x => x.from === thisPeerId
        )
        thisPeerData = thisPeerData[0]
        const dataIndex = _this.thisNode.peerData.indexOf(thisPeerData)
        // console.log(`dataIndex: ${dataIndex}`)

        // If the new announceObj is older than the last announceObj, then
        // ignore it.
        const oldBroadcastDate = new Date(thisPeerData.data.broadcastedAt)
        const newBroadcastDate = new Date(announceObj.data.broadcastedAt)
        if (newBroadcastDate.getTime() < oldBroadcastDate.getTime()) {
          return true
        }

        // Replace the old data with the new data.
        _this.thisNode.peerData[dataIndex] = announceObj

        // console.log('announceObj.data.orbitdb: ', announceObj.data.orbitdb)
        // console.log('thisPeerData: ', thisPeerData)

      // Update the connection to the peers OrbitDB, if needed.
      // const announceOrbitId = announceObj.data.orbitdb
      // const peerOrbitId = thisPeerData.data.orbitdb
      // if (!announceOrbitId.includes(peerOrbitId)) {
      //   // console.log(`debug: Switching to new OrbitDB for known peer: ${announceOrbitId}`)
      //   _this.adapters.log.statusLog(
      //     0,
      //     `debug: Switching to new OrbitDB for known peer: ${announceOrbitId}`
      //   )
      //   // console.log(
      //   //   `debug: announceObj: ${JSON.stringify(announceObj, null, 2)}`
      //   // )
      //
      //   await _this.adapters.orbit.connectToPeerDb({
      //     peerId: announceObj.from,
      //     orbitdbId: announceObj.data.orbitdb,
      //     thisNode: _this.thisNode
      //   })
      // }
      }

      return true
    } catch (err) {
      console.error('Error in this-node-use-cases.js/addSubnetPeer(): ', err)

      _this.adapters.log.statusLog(
        2,
        'Error in this-node-use-cases.js/addSubnetPeer(): ',
        err
      )

    // Do not throw an error. This is a top-level function called by the
    // pubsub handler for the general coordination channel.
    }
  }

  // Detects if a peer has gone 'stale' (inactive), or is still 'fresh' (active).
  // Stale means it hasn't updated it's
  // broadcastedAt property in more than 10 minutes.
  // Return true if the peer is 'fresh', and false if 'stale'.
  isFreshPeer (announceObj) {
    try {
      // Ignore announcements that do not have a broadcastedAt timestamp.
      if (!announceObj.data.broadcastedAt) return false

      // Ignore items that are older than 10 minutes.
      const now = new Date()
      const broadcastTime = new Date(announceObj.data.broadcastedAt)
      const tenMinutes = 60000 * 10
      const timeDiff = now.getTime() - broadcastTime.getTime()
      if (timeDiff > tenMinutes) return false

      return true
    } catch (err) {
      console.error('Error in stalePeer()')
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
      // console.log('peers: ', peers)

      // Get connected peers
      const connectedPeers = await this.adapters.ipfs.getPeers()
      // console.log('connectedPeers: ', connectedPeers)

      // Loop through each known peer
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
          this.adapters.log.statusLog(
            2,
            `Skipping peer in refreshPeerConnections(). Already connected to peer ${thisPeer}`
          )
          continue
        }

        // Get the peer data for the current peer.
        let peerData = this.thisNode.peerData.filter(x => x.from.includes(thisPeer)
        )
        peerData = peerData[0]
        // console.log('peerData: ', peerData)

        // TODO: if broadcastedAt value is older than 10 minutes, skip connecting
        // to the peer. It may be stale information.
        if (!this.isFreshPeer(peerData)) {
          this.adapters.log.statusLog(
            2,
            `Peer ${peerData.from} is stale. Skipping.`
          )
          continue
        }

        // Sort the Circuit Relays by the average of the aboutLatency
        // array. Connect to peers through the Relays with the lowest latencies
        // first.
        const sortedRelays = this.thisNode.useCases.relays.sortRelays(relays)
        // console.log(`sortedRelays: ${JSON.stringify(sortedRelays, null, 2)}`)

        // Loop through each known circuit relay and attempt to connect to the
        // peer through a relay.
        for (let i = 0; i < sortedRelays.length; i++) {
          const thisRelay = sortedRelays[i]
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
              // this.adapters.log.statusLog(0,
              //   'Successfully connected to peer through circuit relay.'
              // )

              // Break out of the loop once we've made a successful connection.
              break
            }
          }
        }
      }

      const now = new Date()
      this.adapters.log.statusLog(
        2,
        `Renewed connections to all known peers at ${now.toLocaleString()}`
      )

      return true
    } catch (err) {
      console.error('Error in refreshPeerConnections()')
      throw err
    }
  }

  // Enforce the blacklist by actively disconnecting from nodes in the blacklist.
  async enforceBlacklist () {
    try {
      const blacklistPeers = this.thisNode.blacklistPeers
      for (let i = 0; i < blacklistPeers.length; i++) {
        const ipfsId = blacklistPeers[i]

        await this.adapters.ipfs.disconnectFromPeer(ipfsId)
      }

      const blacklistMultiaddrs = this.thisNode.blacklistMultiaddrs
      for (let i = 0; i < blacklistMultiaddrs.length; i++) {
        const multiaddr = blacklistMultiaddrs[i]

        await this.adapters.ipfs.disconnectFromMultiaddr(multiaddr)
      }

      return true
    } catch (err) {
      console.error('Error in enforceBlacklist()')
      throw err
    }
  }

  // An alternative to the blacklist, it's a whitelist, where all nodes are
  // disconnected except ones that have a 'name' property. This ensures that
  // the node only connects to other nodes that are using ipfs-coord.
  async enforceWhitelist () {
    try {
      let showDebugData = false

      // Get all peers.
      const allPeers = await this.adapters.ipfs.getPeers()
      // console.log(`allPeers: ${JSON.stringify(allPeers, null, 2)}`)

      // Get ipfs-coord peers.
      const coordPeers = this.thisNode.peerData
      // console.log(`coordPeers: ${JSON.stringify(coordPeers, null, 2)}`)

      // Try to match each peer up with ipfs-coord info.
      // Add the name from the ipfs-coord info.
      for (let i = 0; i < allPeers.length; i++) {
        const thisPeer = allPeers[i]
        thisPeer.name = ''

        // If IPFS peer exists in the ipfs-coord peer list, then foundPeer
        // will be an array with 1 element.
        const foundPeer = coordPeers.filter(x => x.from.toString().includes(thisPeer.peer.toString())
        )

        // If a connected peer matches an ipfs-coord peer, add the 'name'
        // property to it.
        if (!foundPeer.length) {
          this.adapters.log.statusLog(
            3,
            `Whitelist enforcement disconnecting peer ${thisPeer.peer.toString()}`
          )

          showDebugData = true

          // If a connected peer can not be matched with the list of ipfs-coord
          // peers, then disconnect from it.
          await this.adapters.ipfs.disconnectFromPeer(thisPeer.peer.toString())
        }
      }

      // Show the debugging data once, instead of inside the for-loop, which would
      // show the debugging data each time a peer is disconnected.
      if (showDebugData) {
        // Deep debugging.
        this.adapters.log.statusLog(
          3,
          `allPeers: ${JSON.stringify(allPeers, null, 2)}`
        )
        this.adapters.log.statusLog(
          3,
          `coordPeers: ${JSON.stringify(coordPeers, null, 2)}`
        )
      }

      return true
    } catch (err) {
      console.error('Error in enforceWhitelist()')
      throw err
    }
  }
}

module.exports = ThisNodeUseCases
