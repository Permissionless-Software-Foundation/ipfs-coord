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
const UseCasesMock = require('../../mocks/use-case-mocks')

describe('#thisNode-Use-Cases', () => {
  let uut
  let sandbox

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    uut = new ThisNodeUseCases({
      adapters,
      controllers: {}
    })

    const useCases = new UseCasesMock()
    uut.updateUseCases(useCases)
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

    it('should instantiate the use cases library', () => {
      uut = new ThisNodeUseCases({
        adapters: {},
        controllers: {}
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
      // Mock dependencies
      sandbox.stub(uut, 'isFreshPeer').returns(true)

      const announceObj = {
        from: 'peerId',
        data: {}
      }

      await uut.createSelf({ type: 'node.js' })
      const result = await uut.addSubnetPeer(announceObj)
      // console.log('result: ', result)

      assert.equal(result, true)
    })

    it('should track a new Relay peer', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'isFreshPeer').returns(true)
      sandbox.stub(uut.useCases.relays, 'addRelay').resolves()

      const announceObj = {
        from: 'peerId',
        data: {
          isCircuitRelay: true
        }
      }

      await uut.createSelf({ type: 'node.js' })
      const result = await uut.addSubnetPeer(announceObj)
      // console.log('result: ', result)

      assert.equal(result, true)
    })

    it('should update an existing peer', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'isFreshPeer').returns(true)

      const announceObj = {
        from: 'peerId',
        data: {
          orbitdb: 'orbitdbId'
        }
      }

      await uut.createSelf({ type: 'node.js' })

      // Add the new peer
      await uut.addSubnetPeer(announceObj)

      // Simulate a second announcement object.
      const result = await uut.addSubnetPeer(announceObj)
      // console.log('result: ', result)

      assert.equal(result, true)

      // peerData array should only have one peer.
      assert.equal(uut.thisNode.peerData.length, 1)
    })

    // TODO: Create new test case:
    // it('should not update an existing peer if broadcast message is older the current one')'

    it('should catch and report an error', async () => {
      try {
        const announceObj = {
          from: 'peerId'
        }

        await uut.addSubnetPeer(announceObj)

        assert.isOk(true, 'Not throwing an error is a pass')
      } catch (err) {
        // console.log(err)
        assert.fail('Unexpected code path')
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
      // Add a peer that is already in the list of connected peers.
      uut.thisNode.peerList = ['QmbyYXKbnAmMbMGo8LRBZ58jYs58anqUzY1m4jxDmhDsjd']

      // Add a peer
      await uut.addSubnetPeer(mockData.announceObj2)

      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'getPeers').resolves(mockData.swarmPeers)

      // Connect to that peer.
      const result = await uut.refreshPeerConnections()

      assert.equal(result, true)
    })

    it('should refresh a connection', async () => {
      await uut.createSelf({ type: 'node.js' })
      // Add a peer that is not in the list of connected peers.
      const ipfsId = 'QmbyYXKbnAmMbMGo8LRBZ58jYs58anqUzY1m4jxDmhDsje'
      uut.thisNode.peerList = [ipfsId]
      uut.thisNode.peerData = [{ from: ipfsId }]

      // Add a peer
      await uut.addSubnetPeer(mockData.announceObj)

      // Force circuit relay to be used.
      uut.thisNode.relayData = mockData.mockRelayData

      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'getPeers').resolves(mockData.swarmPeers)
      sandbox.stub(uut.adapters.ipfs, 'connectToPeer').resolves(true)
      sandbox.stub(uut, 'isFreshPeer').returns(true)

      // Connect to that peer.
      const result = await uut.refreshPeerConnections()

      assert.equal(result, true)
    })

    it('should skip if peer is stale', async () => {
      await uut.createSelf({ type: 'node.js' })
      // Add a peer that is not in the list of connected peers.
      const ipfsId = 'QmbyYXKbnAmMbMGo8LRBZ58jYs58anqUzY1m4jxDmhDsje'
      uut.thisNode.peerList = [ipfsId]
      uut.thisNode.peerData = [{ from: ipfsId }]

      // Add a peer
      await uut.addSubnetPeer(mockData.announceObj)

      // Force circuit relay to be used.
      uut.thisNode.relayData = mockData.mockRelayData

      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'getPeers').resolves(mockData.swarmPeers)
      sandbox.stub(uut.adapters.ipfs, 'connectToPeer').resolves(true)
      sandbox.stub(uut, 'isFreshPeer').returns(false)

      // Connect to that peer.
      const result = await uut.refreshPeerConnections()

      assert.equal(result, true)
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

  describe('#isFreshPeer', () => {
    it('should return false if peer data has no broadcastedAt property', () => {
      const announceObj = {
        data: {}
      }

      const result = uut.isFreshPeer(announceObj)

      assert.equal(result, false)
    })

    it('should return false if broadcast is older than 10 minutes', () => {
      const now = new Date()
      const fifteenMinutes = 15 * 60000
      let fifteenMinutesAgo = now.getTime() - fifteenMinutes
      fifteenMinutesAgo = new Date(fifteenMinutesAgo)

      const announceObj = {
        data: {
          broadcastedAt: fifteenMinutesAgo.toISOString()
        }
      }

      const result = uut.isFreshPeer(announceObj)

      assert.equal(result, false)
    })

    it('should return true if broadcast is newer than 10 minutes', () => {
      const now = new Date()
      const fiveMinutes = 5 * 60000
      let fiveMinutesAgo = now.getTime() - fiveMinutes
      fiveMinutesAgo = new Date(fiveMinutesAgo)

      const announceObj = {
        data: {
          broadcastedAt: fiveMinutesAgo.toISOString()
        }
      }

      const result = uut.isFreshPeer(announceObj)

      assert.equal(result, true)
    })
  })

  describe('#enforceBlacklist', () => {
    it('should disconnect from blacklisted peers', async () => {
      await uut.createSelf({ type: 'node.js' })

      // Set up test data
      uut.thisNode.blacklistPeers = ['testId']
      uut.thisNode.blacklistMultiaddrs = ['testId']

      const result = await uut.enforceBlacklist()

      assert.equal(result, true)
    })

    it('catch and throw an error', async () => {
      try {
        await uut.enforceBlacklist()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#enforceWhitelist', () => {
    it('should disconnect from non-ipfs-coord peers', async () => {
      await uut.createSelf({ type: 'node.js' })

      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'getPeers').resolves([{ peer: 'badId' }])
      const spy1 = sandbox
        .stub(uut.adapters.ipfs, 'disconnectFromPeer')
        .resolves()

      const result = await uut.enforceWhitelist()

      // Assert that the method completed.
      assert.equal(result, true)

      // Assert that disconnectFromPeer() was called.
      assert.equal(spy1.called, true)
    })

    it('should skip ipfs-coord peers', async () => {
      await uut.createSelf({ type: 'node.js' })
      uut.thisNode.peerData = [
        {
          from: 'goodId',
          data: {
            jsonLd: {
              name: 'good-name'
            }
          }
        }
      ]

      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'getPeers').resolves([{ peer: 'goodId' }])
      const spy1 = sandbox
        .stub(uut.adapters.ipfs, 'disconnectFromPeer')
        .resolves()

      const result = await uut.enforceWhitelist()

      // Assert that the method completed.
      assert.equal(result, true)

      // Assert that disconnectFromPeer() was not called.
      assert.equal(spy1.called, false)
    })

    it('should catch and throw errors', async () => {
      try {
        await uut.enforceWhitelist()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Cannot read')
      }
    })
  })
})
