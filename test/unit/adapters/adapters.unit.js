/*
  Unit tests for the main adapters/index.js library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const BCHJS = require('@psf/bch-js')

// local libraries
const Adapters = require('../../../lib/adapters')
const ipfs = require('../mocks/ipfs-mock')

describe('#Adapters', () => {
  let sandbox
  let uut // Unit Under Test

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    const bchjs = new BCHJS()
    uut = new Adapters({ bchjs, ipfs })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if ipfs instance is not passed as input', () => {
      try {
        uut = new Adapters({})
      } catch (err) {
        assert.include(
          err.message,
          'An instance of IPFS must be passed when instantiating the Adapters library.'
        )
      }
    })

    it('should throw an error if bch-js instance is not passed in', () => {
      try {
        uut = new Adapters({ ipfs })

        console.log('uut: ', uut)
      } catch (err) {
        assert.include(
          err.message,
          'An instance of @psf/bch-js must be passed when instantiating the Adapters library.'
        )
      }
    })
  })
})
