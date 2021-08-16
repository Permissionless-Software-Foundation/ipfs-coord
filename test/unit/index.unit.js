/*
  Unit tests for the main index.js file.
*/
// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const BCHJS = require('@psf/bch-js')

// local libraries
const IpfsCoord = require('../../index')
const ipfs = require('../mocks/ipfs-mock')

describe('#ipfs-coord', () => {
  let sandbox
  let uut // Unit Under Test

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    const bchjs = new BCHJS()
    uut = new IpfsCoord({ bchjs, ipfs, type: 'node.js' })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if ipfs instance is not passed as input', () => {
      try {
        uut = new IpfsCoord({})

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'An instance of IPFS must be passed when instantiating the ipfs-coord library.'
        )
      }
    })

    it('should throw an error if bch-js instance is not passed as input', () => {
      try {
        uut = new IpfsCoord({ ipfs })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'An instance of @psf/bch-js must be passed when instantiating the ipfs-coord library.'
        )
      }
    })

    it('should throw an error if node type is not defined', () => {
      try {
        const bchjs = new BCHJS()
        uut = new IpfsCoord({ ipfs, bchjs })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'The type of IPFS node (browser or node.js) must be specified.'
        )
      }
    })

    it('should override default logs', () => {
      const bchjs = new BCHJS()
      uut = new IpfsCoord({
        bchjs,
        ipfs,
        type: 'node.js',
        statusLog: console.log,
        privateLog: console.log
      })
    })
  })

  describe('#start', () => {
    it('should wrap the ipfs start() function', async () => {
      // Mock the dependency.
      sandbox.stub(uut.adapters.ipfs, 'start').resolves({})

      await uut.start()

      assert.isOk(true, 'Not throwing an error is a pass')
    })
  })
})
