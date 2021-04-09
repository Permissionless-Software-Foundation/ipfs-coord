/*
  Unit tests for pubsub.js library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

// local libraries
const Peers = require('../../lib/peers')
const CircuitRelay = require('../../lib/circuit-relay')
const Pubsub = require('../../lib/pubsub')
const ipfsLib = require('./mocks/ipfs-mock')
const mockData = require('./mocks/pubsub-mocks')

describe('#pubsub', () => {
  let sandbox
  let uut
  let ipfs

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    ipfs = cloneDeep(ipfsLib)

    // Instantiate the library under test. Must instantiate dependencies first.
    const config = {
      ipfs,
      type: 'node.js',
      statusLog: () => {}
    }
    config.cr = new CircuitRelay(config)
    config.peers = new Peers(config)
    uut = new Pubsub(config)
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if config object is not specified', () => {
      try {
        uut = new Pubsub()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Must pass a config object when instantiating the pubsub library.'
        )
      }
    })

    it('should throw an error if ipfs instance is not passed in', () => {
      try {
        uut = new Pubsub({})
        console.log('uut: ', uut)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Must pass in an instance of IPFS when instantiating the pubsub library.'
        )
      }
    })

    it('should throw an error if peer instance is not passed in', () => {
      try {
        uut = new Pubsub({ ipfs })

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Must pass in an instance of Peers library when instantiating the pubsub library.'
        )
      }
    })
  })

  describe('#subscribeToPubsubChannel', () => {
    it('should subscribe to a pubsub channel', async () => {
      await uut.subscribeToPubsubChannel()

      assert.equal(true, true, 'Not throwing an error is a pass')
    })

    it('should catch and throw errors', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.ipfs.pubsub, 'subscribe')
          .rejects(new Error('test error'))

        await uut.subscribeToPubsubChannel()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err: ', err)
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#parsePubsubMessage', () => {
    it('should parse a pubsub message', async () => {
      const handler = () => {}
      // const handler = data =>
      //   console.log(`data: ${JSON.stringify(data, null, 2)}`)

      // mockData.mockMsg.data = JSON.stringify(mockData.mockMsg.data)

      await uut.parsePubsubMessage(mockData.mockMsg, handler)

      assert.equal(true, true, 'Not throwing an error is a pass')
    })

    // This is a top-level function. It should not throw errors, but log
    // the error message.
    it('should catch and handle errors', async () => {
      // Force an error
      sandbox.stub(uut.ipfs, 'id').throws(new Error('test error'))

      await uut.parsePubsubMessage()
    })
  })

  describe('#publishToPubsubChannel', () => {
    it('should publish a message', async () => {
      const chanName = 'chanName'
      const msgStr = 'test message'

      await uut.publishToPubsubChannel(chanName, msgStr)

      assert.equal(true, true, 'Not throwing an error is a pass')
    })

    it('should catch and throw errors', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.ipfs.pubsub, 'publish')
          .rejects(new Error('test error'))

        await uut.publishToPubsubChannel()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err: ', err)
        assert.include(err.message, 'The first argument')
      }
    })
  })
})
