/*
  This is a top-level library for the Adapters. This file loads all other
  adapter libraries.
*/

// Public npm libraries
// const EventEmitter = require('events')
// EventEmitter.defaultMaxListeners = 200

// Local libraries
const BchAdapter = require('./bch-adapter')
const IpfsAdapter = require('./ipfs-adapter')
const PubsubAdapter = require('./pubsub-adapter')
const EncryptionAdapter = require('./encryption-adapter')
const LogsAdapter = require('./logs-adapter')
const Gist = require('./gist')

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

    // BEGIN: Encapsulate dependencies

    // Create an event emitter for use by adapters.
    // this.eventEmitter = new EventEmitter()
    // this.eventEmitter.setMaxListeners(50)
    // localConfig.eventEmitter = this.eventEmitter

    this.log = new LogsAdapter(localConfig)
    // Pass the log adapter to all other adapters.
    localConfig.log = this.log
    this.bch = new BchAdapter(localConfig)
    // Some adapter libraries depend on other adapter libraries. Pass them
    // in the localConfig object.
    localConfig.bch = this.bch
    this.ipfs = new IpfsAdapter(localConfig)
    localConfig.ipfs = this.ipfs
    this.encryption = new EncryptionAdapter(localConfig)
    // this.about = new AboutAdapter(localConfig)
    localConfig.encryption = this.encryption
    this.pubsub = new PubsubAdapter(localConfig)
    // this.orbit = new OrbitDBAdapter(localConfig)
    this.gist = new Gist(localConfig)

  // END: Encapsulate dependencies
  }
}

module.exports = Adapters
