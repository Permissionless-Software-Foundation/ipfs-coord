/*
  This is a top-level library for the Adapters. This file loads all other
  adapter libraries.
*/

const BchLib = require('./bch-adapter')

class Adapters {
  constructor (localConfig = {}) {
    // Dependency injection
    if (!localConfig.ipfs) {
      throw new Error(
        'An instance of IPFS must be passed when instantiating the Adapters library.'
      )
    }

    if (!localConfig.bchjs) {
      throw new Error(
        'An instance of @psf/bch-js must be passed when instantiating the Adapters library.'
      )
    }

    // Encapsulate dependencies
    this.bch = new BchLib(localConfig)
  }
}

module.exports = Adapters
