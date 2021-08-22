/*
  Unit tests for the this-node use case.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

// Local libraries
const ThisNodeUseCases = require('../../../lib/use-cases/this-node-use-cases')
const AdapterMock = require('../../mocks/adapter-mock')
const adapters = new AdapterMock()
const mockData = require('../../mocks/peers-mock')

describe('#index.js-Use-Cases', () => {
  let uut
  let sandbox

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    uut = new ThisNodeUseCases({
      adapters,
      controllers: {},
      statusLog: () => {}
    })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters is not included', () => {
      try {
        uut = new ThisNodeUseCases()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Must inject instance of adapters when instantiating thisNode Use Cases library.'
        )
      }
    })

    it('should throw an error if controllers are not included', () => {
      try {
        uut = new ThisNodeUseCases({ adapters: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Must inject instance of controllers when instantiating thisNode Use Cases library.'
        )
      }
    })

    it('should throw an error if statusLog is not included', () => {
      try {
        uut = new ThisNodeUseCases({ adapters: {}, controllers: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Must specify a status log handler when instantiating thisNode Use Cases library.'
        )
      }
    })

    it('should instantiate the use cases library', () => {
      uut = new ThisNodeUseCases({
        adapters: {},
        controllers: {},
        statusLog: {}
      })

      assert.property(uut, 'adapters')
    })
  })

  describe('#createSelf', () => {
    it('should create a thisNode entity', async () => {
      uut = new ThisNodeUseCases({ adapters, controllers: {}, statusLog: {} })

      const result = await uut.createSelf({ type: 'node.js' })
      // console.log('result: ', result)

      assert.property(result, 'ipfsId')
      assert.property(result, 'type')
    })
  })

  describe('#addSubnetPeer', () => {
    it('should track a new peer', async () => {
      const announceObj = {
        from: 'peerId',
        data: {}
      }

      await uut.createSelf({ type: 'node.js' })
      const result = await uut.addSubnetPeer(announceObj)
      // console.log('result: ', result)

      assert.equal(result, true)
    })

    it('should catch and throw an error', async () => {
      try {
        const announceObj = {
          from: 'peerId'
        }

        await uut.addSubnetPeer(announceObj)

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Cannot read property')
      }
    })
  })

  describe('#refreshPeerConnections', () => {
    it('should execute with no connected peers', async () => {
      await uut.createSelf({ type: 'node.js' })

      // Add a peer
      await uut.addSubnetPeer(mockData.announceObj)

      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'getPeers').resolves(mockData.swarmPeers)

      // Connect to that peer.
      await uut.refreshPeerConnections()
    })

    it('should skip if peer is already connected', async () => {
      await uut.createSelf({ type: 'node.js' })

      // Add a peer
      await uut.addSubnetPeer(mockData.announceObj2)

      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'getPeers').resolves(mockData.swarmPeers)

      // Connect to that peer.
      await uut.refreshPeerConnections()
    })

    it('should refresh a connection', async () => {
      await uut.createSelf({ type: 'node.js' })

      // Add a peer
      await uut.addSubnetPeer(mockData.announceObj)

      // Force circuit relay to be used.
      uut.thisNode.relayData = mockData.mockRelayData

      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'getPeers').resolves(mockData.swarmPeers)
      sandbox.stub(uut.adapters.ipfs, 'connectToPeer').resolves(true)

      // Connect to that peer.
      await uut.refreshPeerConnections()
    })

    it('should catch and throw an error', async () => {
      try {
        await uut.createSelf({ type: 'node.js' })

        // Add a peer
        await uut.addSubnetPeer(mockData.announceObj)

        // Force error
        sandbox
          .stub(uut.adapters.ipfs, 'getPeers')
          .rejects(new Error('test error'))

        // Connect to that peer.
        await uut.refreshPeerConnections()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log('err: ', err)
        assert.include(err.message, 'test error')
      }
    })
  })
})
