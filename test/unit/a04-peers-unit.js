/*
  Unit tests for the peers library
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

// local libraries
const Peers = require('../../lib/peers')
const CircuitRelay = require('../../lib/circuit-relay')
const OrbitDB = require('../../lib/orbitdb')
const ipfsLib = require('./mocks/ipfs-mock')
const mockData = require('./mocks/peers-mock')

describe('#peers', () => {
  let sandbox
  let uut
  let ipfs

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    ipfs = cloneDeep(ipfsLib)

    const peerConfig = {
      ipfs,
      type: 'node.js',
      statusLog: () => {}
    }
    const cr = new CircuitRelay(peerConfig)
    peerConfig.cr = cr

    const orbitdbConfig = {
      privateLog: () => {}
    }
    peerConfig.orbitdb = new OrbitDB(orbitdbConfig)

    uut = new Peers(peerConfig)
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should instantiate the class', () => {
      const peerConfig = {
        ipfs,
        type: 'node.js',
        statusLog: () => {}
      }
      const cr = new CircuitRelay(peerConfig)

      peerConfig.cr = cr
      uut = new Peers(peerConfig)
      // console.log('uut: ', uut)

      assert.property(uut, 'cr')
      assert.property(uut, 'state')
    })

    it('should throw an error if config object is not specified', () => {
      try {
        uut = new Peers()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Must pass a config object when instantiating the peer library.'
        )
      }
    })

    it('should throw an error if ipfs instance is not passed', () => {
      try {
        uut = new Peers({})

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Must pass in an instance of IPFS when instantiating the peer library.'
        )
      }
    })

    it('should throw an error if circuit relay instance is not passed in', () => {
      try {
        uut = new Peers({ ipfs })

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Must pass in an instance of Circuit Relay library when instantiating the peer library.'
        )
      }
    })
  })

  describe('#addPeer', () => {
    it('should add a new peer', async () => {
      // Mock the response from orbitdb.
      sandbox.stub(uut.orbitdb, 'connectToPeerDb').resolves({})

      await uut.addPeer(mockData.announceObj)

      // console.log(
      //   `uut.state.peers: ${JSON.stringify(uut.state.peers, null, 2)}`
      // )

      // assert.equal(true, true, 'Not throwing an error is a pass')
      assert.property(uut.state.peers, mockData.announceObj.from)
    })

    it('should catch and throw errors', async () => {
      try {
        uut.state = undefined

        await uut.addPeer(mockData.announceObj)

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err: ', err)
        assert.include(err.message, "Cannot read property 'peers' of undefined")
      }
    })
  })

  describe('#refreshPeerConnections', () => {
    it('should refresh peer connections', async () => {
      // Mock the response from orbitdb.
      sandbox.stub(uut.orbitdb, 'connectToPeerDb').resolves({})

      // Add a peer
      await uut.addPeer(mockData.announceObj)

      // Connect to that peer.
      await uut.refreshPeerConnections()
    })

    it('should catch and throw an error', async () => {
      try {
        uut.cr = undefined

        await uut.refreshPeerConnections()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err: ', err)
        assert.include(err.message, "Cannot read property 'state' of undefined")
      }
    })

    it("should exit quietly if peers can't connect", async () => {
      // Mock the response from orbitdb.
      sandbox.stub(uut.orbitdb, 'connectToPeerDb').resolves({})

      // Add a peer
      await uut.addPeer(mockData.announceObj)

      // Force an error
      sandbox.stub(uut.ipfs.swarm, 'connect').rejects(new Error('test error'))

      // Connect to that peer.
      await uut.refreshPeerConnections()

      assert.equal(true, true, 'Not throwing an error is a success')
    })
  })
})
