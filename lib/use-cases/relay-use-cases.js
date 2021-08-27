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
          ipfsId: thisRelay.ipfsId,
          isBootstrap: true,
          metrics: {
            aboutLatency: []
          }
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

      if (connectedPeer.length) {
        // Already connected.
        thisRelay.connected = true
      } else {
        // If this node is not connected, try to connect again.
        thisRelay.connected = await this.adapters.ipfs.connectToPeer(
          thisRelay.multiaddr
        )

        if (thisRelay.connected) {
          this.adapters.log.statusLog(
            0,
            `Connected to Circuit Relay peer ${thisRelay.ipfsId}`
          )
        }
      }
      // console.log('thisRelay.connected: ', thisRelay.connected)

      // Update the timestamp.
      const now = new Date()
      thisRelay.updatedAt = now

      // Update the state tracked by This Node.
      thisNode.relayData[i] = thisRelay
    }

    // const now = new Date()
    // this.adapters.log.statusLog(
    //   `status: ${now.toLocaleString()}: Renewed connections to all known Circuit Relay nodes.`
    // )
  }

  // If a subnet Peer has the isCircuitRelay flag set, try to connect to them
  // directly. If the connection succeeds, add them to the list of Circuit Relays.
  // Triggered when a new subnet peer is found that has their Relay flag set.
  async addRelay (ipfsId, thisNode) {
    try {
      const now = new Date()
      // console.log(`debug: addRelay() called at ${now.toLocaleString()}`)

      // Check to see if peer is already in the list of Circuit Relays.
      const alreadyInList = thisNode.relayData.filter(x => x.ipfsId === ipfsId)
      // Exit if this peer is already in the list of Relays.
      if (alreadyInList.length) return true

      // Get the peer data.
      let peerData = thisNode.peerData.filter(x => x.data.ipfsId === ipfsId)
      peerData = peerData[0]
      // console.log('peerData: ', peerData)

      let multiaddr = ''
      let connectSuccess = false

      // Try to connect to one of the multiaddrs.
      for (let i = 0; i < peerData.data.ipfsMultiaddrs.length; i++) {
        const thisAddr = peerData.data.ipfsMultiaddrs[i]

        // Try to connect to the IPFS peer.
        connectSuccess = await this.adapters.ipfs.connectToPeer(thisAddr)

        // If connection was successful
        if (connectSuccess) {
          // Get a list of connect peers.
          const peers = await this.adapters.ipfs.getPeers()
          // console.log('addRelay() peers: ', peers)

          // Retrieve the multiaddr that worked for connecting.
          const thisRelay = peers.filter(x => x.peer === ipfsId)
          multiaddr = thisRelay[0].addr.toString()
          // console.log('multiaddr: ', multiAddr)

          break
        } else {
          console.log(
            `debug: Connecting to potential relay did not succeed with multiaddr ${thisAddr}`
          )
        }
      }

      // If we could not successfully connect to the peer with any of the given
      // multiaddrs, then do not add it to the list of Relays.
      if (!connectSuccess) {
        console.log(`debug: Could not add potential Circuit Relay: ${ipfsId}`)
        return false
      }

      // On successful connection, add the Circuit Relay to the list.
      // const now = new Date()
      const newRelayObj = {
        multiaddr,
        connected: true,
        updatedAt: now,
        ipfsId,
        isBootstrap: false,
        metrics: {
          aboutLatency: []
        }
      }
      thisNode.relayData.push(newRelayObj)
      console.log(`New Circuit Relay added: ${multiaddr}`)

      return true
    } catch (err) {
      console.error('Error in addRelay()')
      // throw err
      return false
    }
  }

  // Called when periodically checking the Relay connection. Maintains network
  // metrics about each Relay.
  // Called by the manageCircuitRelays() Timer Controller.
  async measureRelays (thisNode) {
    try {
      // console.log('thisNode: ', thisNode)

      // Loop through each Circuit Relay
      for (let i = 0; i < thisNode.relayData.length; i++) {
        const thisRelay = thisNode.relayData[i]

        // If the relay is from the bootstrap list, skip it.
        if (thisRelay.isBootstrap) continue

        // If this node is not connected to the Relay, give it the worst score.
        if (!thisRelay.connected) {
          thisRelay.metrics.aboutLatency.push(10000)
          continue
        }

        // Poll the /about JSON endpoint, and track the time it takes to recieve
        // a response.
        // TODO: Create an adapter that can make the /about call.
        const startTime = new Date()
        await this.adapters.bch.bchjs.Util.sleep(2000)
        const endTime = new Date()
        const diffTime = endTime.getTime() - startTime.getTime()
        console.log(`Time difference: ${diffTime} mS`)

        // Prune the metrics array if it's too big.
        if (thisRelay.metrics.aboutLatency.length > 9) {
          thisRelay.metrics.aboutLatency.shift()
        }

        // Save the new metric value.
        thisRelay.metrics.aboutLatency.push(diffTime)
      }
    } catch (err) {
      console.error('Error in measureRelays()')
      throw err
    }
  }
}

module.exports = RelayUseCases
