/*
  Unit tests for pubsub-adapter.js library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')
const BCHJS = require('@psf/bch-js')

// local libraries
const Pubsub = require('../../../lib/adapters/pubsub-adapter')
const ipfsLib = require('../../mocks/ipfs-mock')
const mockDataLib = require('../../mocks/pubsub-mocks')
const IPFSAdapter = require('../../../lib/adapters/ipfs-adapter')
const thisNodeMock = require('../../mocks/thisnode-mocks')
const EncryptionAdapter = require('../../../lib/adapters/encryption-adapter')
const BchAdapter = require('../../../lib/adapters/bch-adapter')

describe('#pubsub-adapter', () => {
  let sandbox
  let uut
  let ipfs, encryption
  let thisNode
  let mockData

  const log = {
    statusLog: () => {
    }
  }

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    ipfs = cloneDeep(ipfsLib)
    thisNode = cloneDeep(thisNodeMock)
    mockData = cloneDeep(mockDataLib)

    // Instantiate the IPFS adapter
    const ipfsAdapter = new IPFSAdapter({ ipfs, log })

    // Instantiate the Encryption adapater
    const bchjs = new BCHJS()
    const bch = new BchAdapter({ bchjs })
    encryption = new EncryptionAdapter({ bch })

    // Instantiate the library under test. Must instantiate dependencies first.
    uut = new Pubsub({ ipfs: ipfsAdapter, log, encryption, privateLog: {} })
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

    it('should throw an error if encryption library is not included', () => {
      try {
        uut = new Pubsub({ ipfs, log })

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'An instance of the encryption Adapter must be passed when instantiating the Pubsub Adapter library.'
        )
      }
    })

    it('should throw an error if privateLog is not included', () => {
      try {
        uut = new Pubsub({ ipfs, log, encryption })

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'A private log handler must be passed when instantiating the Pubsub Adapter library.'
        )
      }
    })
  })

  describe('#parsePubsubMessage', () => {
    it('should parse a pubsub message', async () => {
      const handler = () => {
      }

      const result = await uut.parsePubsubMessage(mockData.mockMsg, handler, thisNode)

      // assert.equal(true, true, 'Not throwing an error is a pass')
      assert.equal(result, true)
    })

    it('should quietly exit if message is from thisNode', async () => {
      const handler = () => {
      }

      mockData.mockMsg.from = '12D3KooWE6tkdArVpCHG9QN61G1cE7eCq2Q7i4bNx6CJFTDprk9f'

      const result = await uut.parsePubsubMessage(mockData.mockMsg, handler, thisNode)

      // assert.equal(true, true, 'Not throwing an error is a pass')
      assert.equal(result, true)
    })

    // This is a top-level function. It should not throw errors, but log
    // the error message.
    it('should catch and handle errors', async () => {
      const result = await uut.parsePubsubMessage()

      // assert.isOk(true, 'Not throwing an error is a pass')
      assert.equal(result, false)
    })

    it('should parse a message for an external IPFS node', async () => {
      const handler = () => {
      }

      uut.nodeType = 'external'

      const result = await uut.parsePubsubMessage(mockData.mockMsg, handler, thisNode)

      // assert.equal(true, true, 'Not throwing an error is a pass')
      assert.equal(result, true)
    })
  })

  describe('#captureMetrics', () => {
    it('should capture an about REQUEST', async () => {
      // Mock dependencies
      sandbox.stub(uut.encryption, 'encryptMsg').resolves('encrypted-payload')
      sandbox.stub(uut.messaging, 'sendMsg').resolves()

      const decryptedStr = mockData.aboutRequest
      const from = 'fake-id'

      const result = await uut.captureMetrics(decryptedStr, from, thisNode)
      // console.log(result)

      assert.equal(result, true)
    })

    it('should capture an about RESPONSE', async () => {
      const decryptedStr = mockData.aboutResponse
      const from = 'fake-id'

      const result = await uut.captureMetrics(decryptedStr, from, thisNode)
      // console.log(result)

      // Should return the decrypted response data.
      assert.property(result, 'ipfsId')
    })

    it('should return false for message not an /about request or response', async () => {
      const decryptedStr = mockData.badId
      const from = 'fake-id'

      const result = await uut.captureMetrics(decryptedStr, from, thisNode)
      // console.log(result)

      assert.equal(result, false)
    })

    it('should return false on an error', async () => {
      const result = await uut.captureMetrics()
      // console.log(result)

      assert.equal(result, false)
    })
  })

  describe('#handleNewMessage', () => {
    it('should return false if incoming message is an /about request or response', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'captureMetrics').resolves(true)

      const result = await uut.handleNewMessage(mockData.msgObj, thisNode)
      // console.log(result)

      assert.equal(result, false)
    })

    it('return true if incoming message is NOT an /about request or response', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'captureMetrics').resolves(false)
      uut.privateLog = () => {
      }

      const result = await uut.handleNewMessage(mockData.msgObj, thisNode)
      // console.log(result)

      assert.equal(result, true)
    })

    it('should catch and throw errors', async () => {
      try {
        await uut.handleNewMessage()

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.include(
          err.message,
          'Cannot read'
        )
      }
    })
  })

  describe('#subscribeToPubsubChannel', () => {
    // This tests the ability to subscribe to general broadcast channels like
    // the psf-ipfs-coordination-002 channel.
    it('should subscribe to a broadcast pubsub channel', async () => {
      // Mock dependencies
      sandbox.stub(uut.ipfs.ipfs.pubsub, 'subscribe').resolves()

      const chanName = 'test'
      const handler = () => {
      }

      const result = await uut.subscribeToPubsubChannel(chanName, handler, thisNode)

      // assert.equal(true, true, 'Not throwing an error is a pass')
      assert.equal(result, true)
    })

    // This tests the ability to subscribe to private, encrypted channels, like
    // the one this node uses to receive messages from other nodes.
    it('should subscribe to a private pubsub channel', async () => {
      // Mock dependencies
      sandbox.stub(uut.ipfs.ipfs.pubsub, 'subscribe').resolves()

      const chanName = thisNode.ipfsId
      const handler = () => {
      }

      const result = await uut.subscribeToPubsubChannel(chanName, handler, thisNode)

      // assert.equal(true, true, 'Not throwing an error is a pass')
      assert.equal(result, true)
    })

    it('should catch and throw errors', async () => {
      try {
        await uut.subscribeToPubsubChannel()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err: ', err)
        assert.include(err.message, 'Cannot read')
      }
    })
  })
})
