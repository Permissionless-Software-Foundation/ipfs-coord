/*
  Unit tests for the main Adapters index.js file.
*/

// npm libraries
const assert = require('chai').assert

// Local libraries
const Adapters = require('../../../lib/adapters')
const BCHJS = require('@psf/bch-js')
const bchjs = new BCHJS()
const ipfs = require('../../mocks/ipfs-mock')

describe('#index.js-Adapters', () => {
  let uut

  describe('#constructor', () => {
    it('should throw an error if ipfs is not included', () => {
      try {
        uut = new Adapters()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'An instance of IPFS must be passed when instantiating the Adapters library.'
        )
      }
    })

    it('should throw an error if bch-js is not included', () => {
      try {
        uut = new Adapters({ ipfs: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'An instance of @psf/bch-js must be passed when instantiating the Adapters library.'
        )
      }
    })

    it('should throw an error if node type is not specified', () => {
      try {
        uut = new Adapters({ ipfs: {}, bchjs: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'The type of IPFS node (browser or node.js) must be specified.'
        )
      }
    })

    it('should instantiate other adapter libraries', () => {
      uut = new Adapters({
        ipfs,
        bchjs,
        type: 'node.js',
        statusLog: () => {},
        privateLog: () => {}
      })

      assert.property(uut, 'encryption')
    })
  })
})
