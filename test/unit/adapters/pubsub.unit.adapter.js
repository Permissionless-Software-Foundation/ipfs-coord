/*
  Unit tests for pubsub.js library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

// local libraries
const Pubsub = require('../../../lib/adapters/pubsub-adapter')
const ipfsLib = require('../../mocks/ipfs-mock')
const mockData = require('../../mocks/pubsub-mocks')
const IPFSAdapter = require('../../../lib/adapters/ipfs-adapter')

describe('#pubsub-adapter', () => {
  let sandbox
  let uut
  let ipfs

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    ipfs = cloneDeep(ipfsLib)
    const statusLog = () => {}

    const ipfsAdapter = new IPFSAdapter({ ipfs, statusLog })

    // Instantiate the library under test. Must instantiate dependencies first.
    uut = new Pubsub({ ipfs: ipfsAdapter, statusLog })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if IPFS adapter not specified', () => {
      try {
        uut = new Pubsub()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of IPFS adapter required when instantiating Pubsub Adapter.'
        )
      }
    })

    it('should throw an error if status log handler not specified', () => {
      try {
        uut = new Pubsub({ ipfs })

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'A status log handler function required when instantitating Pubsub Adapter'
        )
      }
    })
  })

  describe('#subscribeToPubsubChannel', () => {
    it('should subscribe to a pubsub channel', async () => {
      const chanName = 'test'
      const handler = () => {}
      const thisNodeId = 'testId'

      await uut.subscribeToPubsubChannel(chanName, handler, thisNodeId)

      assert.equal(true, true, 'Not throwing an error is a pass')
    })

    it('should catch and throw errors', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.ipfs.ipfs.pubsub, 'subscribe')
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

      await uut.parsePubsubMessage(mockData.mockMsg, handler)

      assert.equal(true, true, 'Not throwing an error is a pass')
    })

    it('should quietly exit if message is from thisNode', async () => {
      const handler = () => {}

      mockData.mockMsg.from = 'thisNodeId'

      await uut.parsePubsubMessage(mockData.mockMsg, handler, 'thisNodeId')

      assert.equal(true, true, 'Not throwing an error is a pass')
    })

    // This is a top-level function. It should not throw errors, but log
    // the error message.
    it('should catch and handle errors', async () => {
      await uut.parsePubsubMessage()

      assert.isOk(true, 'Not throwing an error is a pass')
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
          .stub(uut.ipfs.ipfs.pubsub, 'publish')
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
