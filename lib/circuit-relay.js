/*
  A library for managing connections to a Circuit Relay node.

  TODO: Build these methods:
  - setState() - Set the state of the instance of this Class.
  - getState() - Get the state of the instance of this Class.
  - reconnect() - Reconnect to the known circuit relay nodes.
  - pruneConnections() - Disconnect dead or misbehaving nodes.
  - addRelay() - Add a new relay to the state.
*/

const bootstrapCircuitRelays = require('../config/bootstrap-circuit-relays')

class CircuitRelays {
  constructor (crConfig) {
    if (!crConfig) {
      throw new Error(
        'Must pass a config object when instantiating the CircuitRelays library.'
      )
    }
    if (!crConfig.type) {
      throw new Error('The type of IPFS node must be specified.')
    }
    if (!crConfig.ipfs) {
      throw new Error(
        'Must pass in an instance of IPFS when instantiating the CircuitRelays library.'
      )
    }

    // Default to console.log if a logger is not passed in.
    if (!crConfig.logger) {
      crConfig.logger = console.log
    }

    // Pass-through config settings.
    this.ipfs = crConfig.ipfs
    this.statusLog = crConfig.statusLog

    // Initialize the state.
    this.state = {}

    // Set the initial CR bootstrap nodes based on the type of IPFS node.
    this.state.type = crConfig.type
    if (this.state.type === 'browser') {
      this.state.relays = bootstrapCircuitRelays.browser
    } else {
      this.state.relays = bootstrapCircuitRelays.node
    }
  }

  // Renew the connection to each circuit relay in the state.
  async connectToCRs () {
    for (let i = 0; i < this.state.relays.length; i++) {
      const thisRelay = this.state.relays[i]

      try {
        await this.ipfs.swarm.connect(thisRelay.multiaddr)

        thisRelay.connected = true
      } catch (err) {
        /* exit quietly */
        // console.log(`Error trying to connect to circuit-relay: ${err.message}`)
      }
    }

    const now = new Date()
    this.statusLog(
      `${now.toLocaleString()}: Renewed connections to all known Circuit Relay nodes.`
    )
  }
}

module.exports = CircuitRelays
