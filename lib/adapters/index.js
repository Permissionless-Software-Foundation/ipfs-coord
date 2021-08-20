/*
  This is a top-level library for the Adapters. This file loads all other
  adapter libraries.
*/

const BchAdapter = require('./bch-adapter')
const IpfsAdapter = require('./ipfs-adapter')
const PubsubAdapter = require('./pubsub-adapter')
const OrbitDBAdapter = require('./orbitdb-adapter')
const EncryptionAdapter = require('./encryption-adapter')

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

    // Input Validation
    if (!localConfig.type) {
      throw new Error(
        'The type of IPFS node (browser or node.js) must be specified.'
      )
    }

    // Encapsulate dependencies
    this.bch = new BchAdapter(localConfig)
    // Some adapter libraries depend on other adapter libraries. Pass them
    // in the localConfig object.
    localConfig.bch = this.bch
    this.ipfs = new IpfsAdapter(localConfig)
    localConfig.ipfs = this.ipfs
    this.pubsub = new PubsubAdapter(localConfig)
    this.encryption = new EncryptionAdapter(localConfig)
    localConfig.encryption = this.encryption
    this.orbit = new OrbitDBAdapter(localConfig)
  }
}

module.exports = Adapters