/*
  An npm JavaScript library for front end web apps. Implements a minimal
  Bitcoin Cash wallet.
*/

/* eslint-disable no-async-promise-executor */

// 'use strict'

// local libraries
const Ipfs = require('./lib/ipfs-lib')
const BchLib = require('./lib/bch-lib')

let _this // local global for 'this'.

class IpfsCoord {
  constructor (config) {
    _this = this

    if (!config.ipfs) {
      throw new Error(
        'An instance of IPFS must be passed when instantiating the ipfs-coord library.'
      )
    }

    if (!config.bchjs) {
      throw new Error(
        'An instance of @psf/bch-js must be passed when instantiating the ipfs-coord library.'
      )
    }

    // Configuration of an optional 'status' log handler for log reports. If none
    // is specified, default to console.log.
    if (config.statusLog) {
      this.statusLog = config.statusLog
    } else {
      this.statusLog = console.log
    }
    // If the statusLog handler wasn't specified, then define it.
    config.statusLog = this.statusLog

    // Configuration of an optional 'private' log handler for recieving e2e
    // encrypted message. If none is specified, default to console.log.
    if (config.privateLog) {
      this.privateLog = config.privateLog
    } else {
      this.privateLog = console.log
    }
    // If the privateLog handler wasn't specified, then define it.
    config.privateLog = this.privateLog

    // Instatiate and encapsulate support libraries.
    _this.bch = new BchLib(config)
    config.bch = _this.bch
    _this.ipfs = new Ipfs(config)
  }

  // Returns a Promise that resolves to true once the IPFS node has been
  // initialized and has had a chance to connect to circuit relays and
  // coordination pubsub channels.
  async isReady () {
    try {
      do {
        await _this._sleep(1000)

        if (this.ipfs.state.isReady) {
          return true
        }
      } while (1)
    } catch (err) {
      console.error('Error in isReady()')
      throw err
    }
  }

  _sleep (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

module.exports = IpfsCoord
