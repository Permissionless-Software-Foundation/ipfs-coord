/*
  Use Cases library for the thisNode entity.
*/

class ThisNodeUseCases {
  constructor (localConfig = {}) {
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
  }

  // Create an instance of the 'self' or thisNode.
  createSelf () {
    return {}
  }
}

module.exports = ThisNodeUseCases
