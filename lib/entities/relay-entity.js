/*
  A class library defining a Circuit Relay. Each instance of this class
  represents a new Circuit Relay peer that this node knows about and
  will periodically use to connect to other peers.
*/

class RelayEntity {
  constructor (crConfig = {}) {
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
  }
}

module.exports = RelayEntity
