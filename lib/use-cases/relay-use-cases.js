/*
  A Use Case library for working with Circuit Relays.

  TODO: Build these methods:
  - pruneConnections() - Disconnect dead or misbehaving nodes.
  - addRelay() - Add a new relay to the state.
*/

const bootstrapCircuitRelays = require('../../config/bootstrap-circuit-relays')
// const RelayEntity = require('../entities/relay-entity')

class RelayUseCases {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Must inject instance of adapters when instantiating Relay Use Cases library.'
      )
    }

    this.controllers = localConfig.controllers
    if (!this.controllers) {
      throw new Error(
        'Must inject instance of controllers when instantiating Relay Use Cases library.'
      )
    }
  }

  async initializeRelays (thisNode) {
    try {
      // Set the initial CR bootstrap nodes based on the type of IPFS node.
      let bootstrapRelays = []
      if (thisNode.type === 'browser') {
        bootstrapRelays = bootstrapCircuitRelays.browser
      } else {
        bootstrapRelays = bootstrapCircuitRelays.node
      }

      // Loop through each bootstrap Relay.
      for (let i = 0; i < bootstrapRelays.length; i++) {
        const thisRelay = bootstrapRelays[i]

        // Attempt to connect to the Circuit Relay peer.
        const connectionStatus = await this.adapters.ipfs.connectToPeer(
          thisRelay.multiaddr
        )

        const now = new Date()

        const newRelayObj = {
          multiaddr: thisRelay.multiaddr,
          connected: connectionStatus,
          updatedAt: now
        }

        // Record relay information in thisNode entity.
        thisNode.relayData.push(newRelayObj)
      }
    } catch (err) {
      console.error('Error in relay-use-case.js/initializeRelays()')
      throw err
    }
  }

  // Renew the connection to each circuit relay in the state.
  async connectToCRs (thisNode) {
    for (let i = 0; i < this.state.relays.length; i++) {
      const thisRelay = this.state.relays[i]

      // Get connected peers
      const connectedPeers = await this.ipfs.swarm.peers()

      // Check if target circuit-relay is currently conected to the node.
      const connectedPeer = connectedPeers.filter(peerObj =>
        thisRelay.multiaddr.match(peerObj.peer)
      )

      // If this node is already connected to the peer, then skip this node.
      // We do not need to do anything.
      if (connectedPeer.length) continue

      try {
        await this.ipfs.swarm.connect(thisRelay.multiaddr)

        thisRelay.connected = true
        console.log(
          `Successfully connected to Circuit Relay node ${thisRelay.multiaddr}`
        )
      } catch (err) {
        /* exit quietly */
        console.warn(
          `Error trying to connect to circuit-relay ${thisRelay.multiaddr}: ${err.message}`
        )
      }
    }

    const now = new Date()
    this.statusLog(
      `${now.toLocaleString()}: Renewed connections to all known Circuit Relay nodes.`
    )
  }
}

module.exports = RelayUseCases
