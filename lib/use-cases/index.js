/*
  This is a top-level Use Cases library. This library loads all other
  use case libraries.
*/

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
  }
}

module.exports = UseCases
