/*
  This is a top-level Use Cases library. This library loads all other
  use case libraries.
*/

// Local libraries
const ThisNodeUseCases = require('./this-node-use-cases.js')
const RelayUseCases = require('./relay-use-cases')

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
    this.relays = new RelayUseCases(localConfig)
  }
}

module.exports = UseCases
