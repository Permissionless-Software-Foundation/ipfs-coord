/*
  Unit tests for pubsub-adapter.js library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

// local libraries
const Pubsub = require('../../../lib/adapters/pubsub-adapter')
const ipfsLib = require('../../mocks/ipfs-mock')
const mockDataLib = require('../../mocks/pubsub-mocks')
const IPFSAdapter = require('../../../lib/adapters/ipfs-adapter')
const thisNodeMock = require('../../mocks/thisnode-mocks')

describe('#pubsub-adapter', () => {
  let sandbox
  let uut
  let ipfs
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

    const ipfsAdapter = new IPFSAdapter({ ipfs, log })

    // Instantiate the library under test. Must instantiate dependencies first.
    uut = new Pubsub({ ipfs: ipfsAdapter, log, encryption: {}, privateLog: {}, eventEmitter: {} })
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
        uut = new Pubsub({ ipfs, log, encryption: {} })

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

// describe('#subscribeToPubsubChannel', () => {
//   it('should subscribe to a pubsub channel', async () => {
//     const chanName = 'test'
//     const handler = () => {
//     }
//     const thisNodeId = 'testId'
//
//     await uut.subscribeToPubsubChannel(chanName, handler, thisNodeId)
//
//     assert.equal(true, true, 'Not throwing an error is a pass')
//   })
//
//   it('should catch and throw errors', async () => {
//     try {
//       // Force an error
//       sandbox
//         .stub(uut.ipfs.ipfs.pubsub, 'subscribe')
//         .rejects(new Error('test error'))
//
//       await uut.subscribeToPubsubChannel()
//
//       assert.fail('Unexpected code path')
//     } catch (err) {
//       // console.log('err: ', err)
//       assert.include(err.message, 'Cannot read')
//     }
//   })
// })
})
