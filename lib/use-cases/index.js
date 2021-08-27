/*
  This is a top-level Use Cases library. This library loads all other
  use case libraries, and bundles them into a single object.
*/

// Local libraries
const ThisNodeUseCases = require('./this-node-use-cases.js')
const RelayUseCases = require('./relay-use-cases')
const PubsubUseCases = require('./pubsub-use-cases')
const PeerUseCases = require('./peer-use-cases')

class UseCases {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Must inject instance of adapters when instantiating Use Cases library.'
      )
    }

    this.controllers = localConfig.controllers
    if (!this.controllers) {
      throw new Error(
        'Must inject instance of controllers when instantiating Use Cases library.'
      )
    }

    // Encapsulate dependencies
    this.thisNode = new ThisNodeUseCases(localConfig)
    // Other use-cases depend on the thisNode use case.
    localConfig.thisNodeUseCases = this.thisNode
    this.relays = new RelayUseCases(localConfig)
    this.pubsub = new PubsubUseCases(localConfig)
    this.peer = new PeerUseCases(localConfig)

    // Pass the instances of the other use cases to the ThisNode Use Cases.
    this.thisNode.updateUseCases(this)
  }
}

module.exports = UseCases
