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
    this.statusLog = localConfig.statusLog
    if (!this.statusLog) {
      throw new Error(
        'Status log handler required when instantiating Relay Use Cases library.'
      )
    }
  }

  // Connect to the pre-programmed circuit relays for the first time at startup.
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
          updatedAt: now,
          ipfsId: thisRelay.ipfsId
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
    const knownRelays = thisNode.relayData

    for (let i = 0; i < knownRelays.length; i++) {
      const thisRelay = knownRelays[i]
      // console.log('thisRelay: ', thisRelay)

      // Get connected peers
      const connectedPeers = await this.adapters.ipfs.getPeers()
      // console.log('connectedPeers: ', connectedPeers)

      // Check if target circuit-relay is currently conected to the node.
      const connectedPeer = connectedPeers.filter(peerObj =>
        thisRelay.multiaddr.match(peerObj.peer)
      )
      // console.log('connectedPeer: ', connectedPeer)

      // Update the connection state.
      // If this node is not connected, try to connect again.
      if (connectedPeer.length) {
        thisRelay.connected = true
      } else {
        thisRelay.connected = await this.adapters.ipfs.connectToPeer(
          thisRelay.multiaddr
        )
      }
      // console.log('thisRelay.connected: ', thisRelay.connected)

      if (thisRelay.connected) {
        this.statusLog(
          `status: Connected to Circuit Relay peer ${thisRelay.ipfsId}`
        )
      }

      // Update the timestamp.
      const now = new Date()
      thisRelay.updatedAt = now

      // Update the state tracked by This Node.
      thisNode.relayData[i] = thisRelay
    }

    // const now = new Date()
    // this.statusLog(
    //   `status: ${now.toLocaleString()}: Renewed connections to all known Circuit Relay nodes.`
    // )
  }
}

module.exports = RelayUseCases
