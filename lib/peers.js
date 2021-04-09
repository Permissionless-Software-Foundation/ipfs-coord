/*
A library for managing connections to IPFS peers.

TODO: Build these methods:
- setState() - Set the state of the instance of this Class.
- getState() - Get the state of the instance of this Class.
- reconnect() - Reconnect to the known peers.
- pruneConnections() - Disconnect dead or misbehaving nodes.
- addPeer() - Add a new peer to the state, based on a recieved announcement message.
- announce() - Announce this node on the coordination channel
- Add event hooks?
*/

let _this

class Peer {
  constructor (peerConfig) {
    if (!peerConfig) {
      throw new Error(
        'Must pass a config object when instantiating the peer library.'
      )
    }

    if (!peerConfig.ipfs) {
      throw new Error(
        'Must pass in an instance of IPFS when instantiating the peer library.'
      )
    }

    if (!peerConfig.cr) {
      throw new Error(
        'Must pass in an instance of Circuit Relay library when instantiating the peer library.'
      )
    }

    // Pass-through config settings
    this.ipfs = peerConfig.ipfs
    this.cr = peerConfig.cr
    this.statusLog = peerConfig.statusLog
    this.orbitdb = peerConfig.orbitdb

    this.state = {
      peers: {}, // Each peer is an object, identified by their IPFS ID.
      peerList: [] // Each element is the IPFS ID for a peer.
    }

    _this = this
  }

  // Add a peer to the state of this instance. If peer is already in the state,
  // it's entry will be updated.
  async addPeer (announceObj) {
    try {
      // console.log('announceObj: ', announceObj)

      if (!_this.state.peers[announceObj.from]) {
        console.log(`New peer found: ${announceObj.from}`)
        _this.statusLog(`New peer found: ${announceObj.from}`)

        _this.state.peerList.push(announceObj.from.toString())

        // Subscribe to pubsub channel for private messages to peer.
        // Ignore any messages on this channel, since it is only used for
        // broadcasting encrypted messages to the new peer, and they will
        // respond on our own channel.
        await _this.ipfs.pubsub.subscribe(
          announceObj.from.toString(),
          async msg => {}
        )
      }

      // Add a timestamp.
      const now = new Date()
      announceObj.data.updatedAt = now.toISOString()

      _this.state.peers[announceObj.from] = announceObj.data
      // console.log(`Peer ${announceObj.from} updated peer state.`)

      // console.log(
      //   `addPeer() this.state.peers: ${JSON.stringify(this.state.peers, null, 2)}`
      // )

      // Update the connection to the peers OrbitDB, if needed.
      await _this.orbitdb.connectToPeerDb(announceObj.from, announceObj.data.orbitdb)
    } catch (err) {
      console.error('Error in addPeer()')
      throw err
    }
  }

  // Called by an Interval, ensures connections are maintained to known pubsub
  // peers. This will heal connections if nodes drop in and out of the network.
  async refreshPeerConnections () {
    try {
      // console.log(
      //   `refreshPeerConnections() this.state.peers: ${JSON.stringify(
      //     this.state.peers,
      //     null,
      //     2
      //   )}`
      // )

      const relays = this.cr.state.relays

      // Loop through each known peer
      for (const peer in this.state.peers) {
        const thisPeer = this.state.peers[peer]
        // console.log(`thisPeer: ${JSON.stringify(thisPeer, null, 2)}`)

        // Loop through each known circuit relay
        for (let i = 0; i < relays.length; i++) {
          const thisRelay = relays[i]
          // console.log(`thisRelay: ${JSON.stringify(thisRelay, null, 2)}`)

          try {
            // Generate a multiaddr for connecting to the peer through a circuit relay.
            const multiaddr = `${thisRelay.multiaddr}/p2p-circuit/p2p/${
              thisPeer.ipfsId
            }`
            // console.log(`multiaddr: ${multiaddr}`)

            // Attempt to connect to the node through a circuit relay.
            await this.ipfs.swarm.connect(multiaddr)

            // console.log(
            //   `Successfully connected to peer through circuit relay:\n ${multiaddr}`
            // )
          } catch (err) {
            /* exit quietly */
            // console.log('Error trying to connect to swarm peer: ', err)
            // console.log(`Error trying to connect to swarm peer: ${err.message}`)
            // console.log(
            //   `Error trying to connect to swarm peer ${thisPeer.ipfsId}`
            // )
          }
        }
      }

      const now = new Date()
      this.statusLog(
        `${now.toLocaleString()}: Renewed connections to all known peers.`
      )
    } catch (err) {
      console.error('Error in refreshPeerConnections()')
      throw err
    }
  }
}

module.exports = Peer
