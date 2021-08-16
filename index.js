/*
  An npm JavaScript library for front end web apps. Implements a minimal
  Bitcoin Cash wallet.
*/

/* eslint-disable no-async-promise-executor */

// 'use strict'

// local libraries
const Adapters = require('./lib/adapters')
const Controllers = require('./lib/controllers')
const UseCases = require('./lib/use-cases')
// const Ipfs = require('./lib/ipfs-lib')
// const BchLib = require('./lib/bch-lib')

// let _this // local global for 'this'.

class IpfsCoord {
  constructor (localConfig = {}) {
    // Input Validation
    if (!localConfig.ipfs) {
      throw new Error(
        'An instance of IPFS must be passed when instantiating the ipfs-coord library.'
      )
    }
    if (!localConfig.bchjs) {
      throw new Error(
        'An instance of @psf/bch-js must be passed when instantiating the ipfs-coord library.'
      )
    }
    if (!localConfig.type) {
      throw new Error(
        'The type of IPFS node (browser or node.js) must be specified.'
      )
    }

    // localConfiguration of an optional 'status' log handler for log reports. If none
    // is specified, default to console.log.
    if (localConfig.statusLog) {
      this.statusLog = localConfig.statusLog
    } else {
      this.statusLog = console.log
    }
    // If the statusLog handler wasn't specified, then define it.
    localConfig.statusLog = this.statusLog

    // localConfiguration of an optional 'private' log handler for recieving e2e
    // encrypted message. If none is specified, default to console.log.
    if (localConfig.privateLog) {
      this.privateLog = localConfig.privateLog
    } else {
      this.privateLog = console.log
    }
    // If the privateLog handler wasn't specified, then define it.
    localConfig.privateLog = this.privateLog

    // Load the adapter libraries.
    this.adapters = new Adapters(localConfig)
    localConfig.adapters = this.adapters

    // Load the controller libraries
    this.controllers = new Controllers(localConfig)
    localConfig.controllers = this.controllers

    // Load the Use Cases
    this.useCases = new UseCases(localConfig)
  }

  // Returns a Promise that resolves to true once the IPFS node has been
  // initialized and has had a chance to connect to circuit relays and
  // coordination pubsub channels.
  async start () {
    await this.adapters.ipfs.start()
  }
}

module.exports = IpfsCoord
