/*
  Unit tests for the thisNode Entity
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

// local libraries
const ThisNodeEntity = require('../../../lib/entities/this-node-entity')

describe('#thisNode-Entity', () => {
  let sandbox
  let uut // Unit Under Test

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

  // const bchjs = new BCHJS()
  // uut = new IpfsCoord({ bchjs, ipfs, type: 'node.js' })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if ipfsId is not included', () => {
      try {
        const configObj = {}

        uut = new ThisNodeEntity(configObj)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'ipfsId required when instantiating thisNode Entity'
        )
      }
    })

    it('should throw an error if multiaddrs are not included', () => {
      try {
        const configObj = {
          ipfsId: 'fake-ipfsId'
        }

        uut = new ThisNodeEntity(configObj)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'ipfsMultiaddrs required when instantiating thisNode Entity'
        )
      }
    })

    it('should throw an error if bchAddr is not included', () => {
      try {
        const configObj = {
          ipfsId: 'fake-ipfsId',
          ipfsMultiaddrs: ['fake-addr']
        }

        uut = new ThisNodeEntity(configObj)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'bchAddr required when instantiating thisNode Entity'
        )
      }
    })

    it('should throw an error if slpAddr is not included', () => {
      try {
        const configObj = {
          ipfsId: 'fake-ipfsId',
          ipfsMultiaddrs: ['fake-addr'],
          bchAddr: 'fake-addr'
        }

        uut = new ThisNodeEntity(configObj)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'slpAddr required when instantiating thisNode Entity'
        )
      }
    })

    it('should throw an error if publicKey is not included', () => {
      try {
        const configObj = {
          ipfsId: 'fake-ipfsId',
          ipfsMultiaddrs: ['fake-addr'],
          bchAddr: 'fake-addr',
          slpAddr: 'fake-addr'
        }

        uut = new ThisNodeEntity(configObj)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'publicKey required when instantiating thisNode Entity'
        )
      }
    })

    it('should throw an error if node type is not included', () => {
      try {
        const configObj = {
          ipfsId: 'fake-ipfsId',
          ipfsMultiaddrs: ['fake-addr'],
          bchAddr: 'fake-addr',
          slpAddr: 'fake-addr',
          publicKey: 'fake-key'
        }

        uut = new ThisNodeEntity(configObj)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          "Node type of 'node.js' or 'browser' required when instantiating thisNode Entity"
        )
      }
    })

    it('should create a thisNode Entity', () => {
      const configObj = {
        ipfsId: 'fake-ipfsId',
        ipfsMultiaddrs: ['fake-addr'],
        bchAddr: 'fake-addr',
        slpAddr: 'fake-addr',
        publicKey: 'fake-key',
        type: 'node.js'
      }

      uut = new ThisNodeEntity(configObj)

      assert.property(uut, 'ipfsId')
      assert.property(uut, 'ipfsMultiaddrs')
      assert.property(uut, 'bchAddr')
      assert.property(uut, 'slpAddr')
      assert.property(uut, 'publicKey')
      assert.property(uut, 'type')
    })
  })
})
