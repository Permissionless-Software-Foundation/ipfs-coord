/*
  Unit tests for the OrbitDB.js library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

// local libraries
const OrbitDB = require('../../lib/orbitdb')
const mockDataLib = require('./mocks/orbitdb-mock')

describe('#orbitdb', () => {
  let sandbox
  let uut
  let mockData

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    const orbitdbConfig = {
      privateLog: () => {}
    }
    uut = new OrbitDB(orbitdbConfig)

    mockData = cloneDeep(mockDataLib)
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should instantiate the Class', () => {
      const orbitdbConfig = {
        privateLog: () => {}
      }

      uut = new OrbitDB(orbitdbConfig)

      assert.property(uut, 'state')
      assert.property(uut.state, 'peers')
      assert.property(uut.state, 'peerList')
    })
  })

  describe('#addDeps', () => {
    it('should update the encapsulated dependencies', () => {
      const configObj = {
        peers: {},
        encrypt: {}
      }

      uut.addDeps(configObj)

      assert.isObject(uut.peers)
      assert.isObject(uut.encrypt)
    })

    it('should catch and throw errors', () => {
      try {
        uut.addDeps()
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Cannot read property')
      }
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

      assert.equal(result, 'abc')
    })

    it('should throw an error if IPFS node is not provided', async () => {
      try {
        await uut.createRcvDb()
        // console.log('result: ', result)
      } catch (err) {
        // console.log('error message:', err)
        assert.include(err.message, 'The ipfs node must be an object')
      }
    })

    it('should catch and throw errors', async () => {
      try {
        const ipfsNode = {
          id: () => {
            throw new Error('test error')
          }
        }

        await uut.createRcvDb(ipfsNode)

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
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

  describe('#handleReplicationEvent', () => {
    it('should decrypt an incoming message an pass it to the private log', async () => {
      // Mock dependencies
      uut.encrypt = {
        decryptMsg: () => {}
      }
      sandbox.stub(uut.encrypt, 'decryptMsg').resolves('decrypted message')

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

  describe('#sendToDb', () => {
    it('should quietly exit if peer DB is unknown', async () => {
      // Create mock peer
      uut.peers = {
        state: {
          peers: {
            abc: {}
          }
        }
      }
      uut.encrypt = {
        encryptMsg: () => {}
      }

      // Mock dependencies
      sandbox.stub(uut.encrypt, 'encryptMsg').resolves('')

      await uut.sendToDb('abc', 'test message')
    })

    it('should send an encrypted message to a peers DB', async () => {
      // Create mock peer
      uut.peers = {
        state: {
          peers: {
            abc: {}
          }
        }
      }
      uut.encrypt = {
        encryptMsg: () => {}
      }

      uut.state.peers = {
        abc: {
          db: {
            add: () => {}
          }
        }
      }

      // Mock dependencies
      sandbox.stub(uut.encrypt, 'encryptMsg').resolves('')

      await uut.sendToDb('abc', 'test message')
    })

    it('should catch and throw errors', async () => {
      try {
        // Create mock peer
        uut.peers = {
          state: {
            peers: {
              abc: {}
            }
          }
        }
        uut.encrypt = {
          encryptMsg: () => {}
        }

        // Force and error
        sandbox.stub(uut.encrypt, 'encryptMsg').rejects(new Error('test error'))

        await uut.sendToDb('abc', 'test message')

        assert.fail('Unexpected code path!')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#connectToPeerDb', () => {
    it('should quietly exit if peerId is not specified', async () => {
      const peerId = undefined
      const orbitdbId = '123'

      await uut.connectToPeerDb(peerId, orbitdbId)

      assert.isOk('everything is ok', 'Not throwing an error is a pass')
    })

    it('should quietly exit if orbitdbId is not specified', async () => {
      const peerId = 'abc'
      const orbitdbId = undefined

      await uut.connectToPeerDb(peerId, orbitdbId)

      assert.isOk('everything is ok', 'Not throwing an error is a pass')
    })

    it('should connect to a new peer not seen before', async () => {
      // Mock the orbitdb event log
      uut.orbitdb = mockData.mockCreateInstance

      const peerId = 'abc'
      const orbitdbId = '123'

      await uut.connectToPeerDb(peerId, orbitdbId)

      // OrbitbID should be save to the state.
      assert.equal(uut.state.peers.abc.orbitdbId, '123')
    })

    it('should update information for an already known peer', async () => {
      // Mock the orbitdb event log
      uut.orbitdb = mockData.mockCreateInstance

      const peerId = 'abc'
      const orbitdbId = '456'

      // Force a known peer with different orbitdb.
      uut.state.peers = {
        abc: {
          orbitdbId: '123'
        }
      }

      await uut.connectToPeerDb(peerId, orbitdbId)

      // OrbitbID should be updated.
      assert.equal(uut.state.peers.abc.orbitdbId, '456')
    })

    it('should catch and throw errors', async () => {
      try {
        // Force an error
        uut.orbitdb = {
          eventlog: () => {
            throw new Error('test error')
          }
        }

        const peerId = 'abc'
        const orbitdbId = '456'

        await uut.connectToPeerDb(peerId, orbitdbId)

        assert.fail('Unexpected code path!')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
  })
})
