/*
  Unit tests for the OrbitDB.js library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

// local libraries
const OrbitDBAdapter = require('../../../lib/adapters/orbitdb-adapter')
const mockDataLib = require('../../mocks/orbitdb-mock')

describe('#orbitdb-adapter', () => {
  let sandbox
  let uut
  let mockData

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    const orbitdbConfig = {
      ipfs: {},
      encryption: {},
      privateLog: () => {}
    }
    uut = new OrbitDBAdapter(orbitdbConfig)

    mockData = cloneDeep(mockDataLib)
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw error if instance of ipfs is not passed in', () => {
      try {
        uut = new OrbitDBAdapter()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'An instance of IPFS must be passed when instantiating the OrbitDB Adapters library.'
        )
      }
    })

    it('should throw error if instance of encryption adapter is not passed in', () => {
      try {
        uut = new OrbitDBAdapter({ ipfs: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'An instance of the encryption Adapter must be passed when instantiating the OrbitDB Adapter library.'
        )
      }
    })

    it('should throw error if instance of privateLog is not passed in', () => {
      try {
        uut = new OrbitDBAdapter({ ipfs: {}, encryption: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'A private log handler must be passed when instantiating the OrbitDB Adapter library.'
        )
      }
    })
  })

  describe('#createRcvDb', () => {
    it('should create a recieve database', async () => {
      // Mock dependencies.
      sandbox.stub(uut.OrbitDbClass, 'createInstance').resolves({
        // Create a mock of OrbitDB.
        eventlog: () => {
          return {
            load: () => {},
            events: {
              on: () => {}
            },
            id: 'abc'
          }
        }
      })

      const ipfsNode = {
        id: () => {
          return {
            id: 'abc'
          }
        }
      }

      const result = await uut.createRcvDb(ipfsNode)
      // console.log('result: ', result)

      assert.equal(result.id, 'abc')
    })

    it('should catch and throw errors', async () => {
      try {
        await uut.createRcvDb()
        // console.log('result: ', result)
      } catch (err) {
        // console.log('error message:', err)
        assert.include(err.message, 'Cannot read property')
      }
    })
  })

  describe('#handleReplicationEvent', () => {
    it('should decrypt an incoming message an pass it to the private log', async () => {
      // Mock dependencies
      uut.encryption = {
        decryptMsg: () => {}
      }
      sandbox.stub(uut.encryption, 'decryptMsg').resolves('decrypted message')

      // Mock the database.
      uut.db = mockData.mockEventLog
      // console.log('uut.db: ', uut.db)

      await uut.handleReplicationEvent()

      assert.isOk('everything', 'Not throwing an error is a pass')
    })

    it('should catch and report errors', async () => {
      uut.db = mockData.mockEventLog

      // Force an error
      sandbox.stub(uut.db, 'iterator').throws(new Error('test error'))

      await uut.handleReplicationEvent()

      assert.isOk('everything', 'Not throwing an error is a pass')
    })
  })

  describe('#_checkIfAlreadyProcessed', () => {
    it('should return false for a new message', () => {
      const hash = 'abc'

      const result = uut._checkIfAlreadyProcessed(hash)

      assert.equal(result, false)
    })

    it('should return true for duplicate hash', () => {
      const hash = 'abc'

      uut._checkIfAlreadyProcessed(hash)

      const result = uut._checkIfAlreadyProcessed(hash)

      assert.equal(result, true)
    })

    it('should remove old entries as new entries are processed', () => {
      // Force cache to only be 2 elements.
      uut.MSG_CACHE_SIZE = 2

      uut._checkIfAlreadyProcessed('abc')
      uut._checkIfAlreadyProcessed('def')
      uut._checkIfAlreadyProcessed('geh')

      assert.equal(uut.msgCache.includes('abc'), false)
    })
  })

  describe('#_getTimestamp', () => {
    it('should generate a timestamp with a fixed length of characters', () => {
      const result = uut._getTimestamp()
      // console.log('result: ', result)
      // console.log('result length: ', result.length)

      assert.isString(result)
      assert.equal(result.length, 8)
    })
  })

  describe('#connectToPeerDb', () => {
    it('should quietly exit if peerId is not specified', async () => {
      const peerId = undefined
      const orbitdbId = '123'

      await uut.connectToPeerDb({ peerId, orbitdbId })

      assert.isOk('everything is ok', 'Not throwing an error is a pass')
    })

    it('should quietly exit if orbitdbId is not specified', async () => {
      const peerId = 'abc'
      const orbitdbId = undefined

      await uut.connectToPeerDb({ peerId, orbitdbId })

      assert.isOk('everything is ok', 'Not throwing an error is a pass')
    })

    it('should connect to a new peer not seen before', async () => {
      // Mock the orbitdb event log
      uut.orbitdb = mockData.mockCreateInstance

      const thisNode = {
        orbitList: [],
        orbitData: []
      }

      const peerId = 'abc'
      const orbitdbId = '123'

      await uut.connectToPeerDb({ peerId, orbitdbId, thisNode })

      // OrbitbID should be save to the state.
      assert.equal(thisNode.orbitData[0].orbitdbId, '123')
    })

    it('should update information for an already known peer', async () => {
      // Mock the orbitdb event log
      uut.orbitdb = mockData.mockCreateInstance

      const thisNode = {
        orbitList: ['abc'],
        orbitData: [{ ipfsId: 'abc', orbitdbId: '123' }]
      }

      const peerId = 'abc'
      const orbitdbId = '456'

      await uut.connectToPeerDb({ peerId, orbitdbId, thisNode })

      // OrbitbID should be updated.
      // assert.equal(uut.state.peers.abc.orbitdbId, '456')
      assert.equal(thisNode.orbitData[0].orbitdbId, '456')
    })

    it('should catch and throw errors', async () => {
      try {
        // Force an error
        uut.orbitdb = {
          eventlog: () => {
            throw new Error('test error')
          }
        }

        const thisNode = {
          orbitList: [],
          orbitData: []
        }

        const peerId = 'abc'
        const orbitdbId = '123'

        await uut.connectToPeerDb({ peerId, orbitdbId, thisNode })

        assert.fail('Unexpected code path!')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
  })
})
