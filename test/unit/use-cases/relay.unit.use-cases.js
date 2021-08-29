/*
  Unit tests for the Circuit Relays use case.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

// Local libraries
const RelayUseCases = require('../../../lib/use-cases/relay-use-cases')
const ThisNodeUseCases = require('../../../lib/use-cases/this-node-use-cases')
const AdapterMock = require('../../mocks/adapter-mock')
const adapters = new AdapterMock()
const mockData = require('../../mocks/peers-mock')

describe('#relay-Use-Cases', () => {
  let uut
  let sandbox
  let thisNode

  beforeEach(async () => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    const thisNodeUseCases = new ThisNodeUseCases({
      adapters,
      controllers: {},
      statusLog: () => {}
    })
    thisNode = await thisNodeUseCases.createSelf({ type: 'node.js' })

    uut = new RelayUseCases({
      adapters,
      controllers: {},
      statusLog: () => {}
    })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters is not included', () => {
      try {
        uut = new RelayUseCases()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Must inject instance of adapters when instantiating Relay Use Cases library.'
        )
      }
    })

    it('should throw an error if controllers are not included', () => {
      try {
        uut = new RelayUseCases({ adapters: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Must inject instance of controllers when instantiating Relay Use Cases library.'
        )
      }
    })
  })

  describe('#initializeRelays', () => {
    it('should initialize the node.js circuit relays', async () => {
      await uut.initializeRelays(thisNode)

      assert.isOk(true, 'Not throwing an error is a pass')
    })

    it('should initialize the browser circuit relays', async () => {
      thisNode.type = 'browser'

      await uut.initializeRelays(thisNode)

      assert.isOk(true, 'Not throwing an error is a pass')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.adapters.ipfs, 'connectToPeer')
          .rejects(new Error('test error'))

        await uut.initializeRelays(thisNode)

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#connectToCRs', () => {
    it('should connect to array of circuit relays', async () => {
      await uut.connectToCRs(thisNode)

      assert.equal(true, true, 'Not throwing an error is a success')
    })

    it('Should try to connect to circuit relays', async () => {
      // Force circuit relay to be used.
      thisNode.relayData = mockData.mockRelayData

      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'getPeers').resolves(mockData.swarmPeers)
      sandbox.stub(uut, 'sortRelays').returns(thisNode.relayData)

      // uut.state.relays = crMockData.circuitRelays
      await uut.connectToCRs(thisNode)

      assert.equal(true, true, 'Not throwing an error is a success')
    })

    it('Should skip relays that are already connected', async () => {
      // Force circuit relay to be used.
      thisNode.relayData = mockData.mockRelayData

      // Force mock ciruit relay to appear as being already connected.
      thisNode.relayData[0].multiaddr = mockData.swarmPeers[0].peer

      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'getPeers').resolves(mockData.swarmPeers)
      sandbox.stub(uut, 'sortRelays').returns(thisNode.relayData)

      // uut.state.relays = crMockData.circuitRelays
      await uut.connectToCRs(thisNode)

      assert.equal(true, true, 'Not throwing an error is a success')
    })

    it('Should try to connect to circuit relays', async () => {
      // Force circuit relay to be used.
      thisNode.relayData = mockData.mockRelayData

      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'getPeers').resolves(mockData.swarmPeers2)
      sandbox.stub(uut.adapters.ipfs, 'connectToPeer').resolves(true)
      sandbox.stub(uut, 'sortRelays').returns(thisNode.relayData)

      // uut.state.relays = crMockData.circuitRelays
      await uut.connectToCRs(thisNode)

      assert.equal(true, true, 'Not throwing an error is a success')
    })
  })

  describe('#addRelay', () => {
    it('should return true if peer is already in relayData array', async () => {
      // Mock test data
      const ipfsId = 'testId'
      const thisNode = {
        relayData: [{ ipfsId }]
      }

      const result = await uut.addRelay(ipfsId, thisNode)

      assert.equal(result, true)
    })

    it('should connect to a peers multiaddr', async () => {
      // Mock test data
      const ipfsId = 'testId'
      const thisNode = {
        relayData: [],
        peerData: [
          {
            data: {
              ipfsId,
              ipfsMultiaddrs: ['/ip4/addr1']
            }
          }
        ]
      }

      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'connectToPeer').resolves(true)
      sandbox
        .stub(uut.adapters.ipfs, 'getPeers')
        .resolves([{ peer: ipfsId, addr: '/ip4/addr1' }])

      const result = await uut.addRelay(ipfsId, thisNode)

      // console.log('thisNode: ', thisNode)

      // Function should return true.
      assert.equal(result, true)

      // relayData array should be updated
      assert.isArray(thisNode.relayData) // Its an array.
      assert.equal(thisNode.relayData.length, 1) //  Should be one element

      // Assert expected properties of the object.
      assert.property(thisNode.relayData[0], 'multiaddr')
      assert.property(thisNode.relayData[0], 'connected')
      assert.property(thisNode.relayData[0], 'updatedAt')
      assert.property(thisNode.relayData[0], 'ipfsId')
      assert.property(thisNode.relayData[0], 'isBootstrap')
      assert.property(thisNode.relayData[0], 'metrics')

      // Assert expected values.
      assert.equal(thisNode.relayData[0].multiaddr, '/ip4/addr1')
      assert.equal(thisNode.relayData[0].connected, true)
      assert.equal(thisNode.relayData[0].ipfsId, 'testId')
      assert.equal(thisNode.relayData[0].isBootstrap, false)
      assert.isArray(thisNode.relayData[0].metrics.aboutLatency)
    })

    it('should return false if thisNode can not connect to peer', async () => {
      // Mock test data
      const ipfsId = 'testId'
      const thisNode = {
        relayData: [],
        peerData: [
          {
            data: {
              ipfsId,
              ipfsMultiaddrs: ['addr1']
            }
          }
        ]
      }

      // Mock dependencies
      sandbox.stub(uut.adapters.ipfs, 'connectToPeer').resolves(false)

      const result = await uut.addRelay(ipfsId, thisNode)

      assert.equal(result, false)
    })

    it('should return false on error', async () => {
      const result = await uut.addRelay()

      assert.equal(result, false)
    })
  })

  describe('#measureRelays', () => {
    it('should catch and throw errors', async () => {
      try {
        await uut.measureRelays()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'Cannot read property')
      }
    })

    it('should skip bootstrap relays', async () => {
      // Mock test data
      const thisNode = {
        relayData: [
          {
            isBootstrap: true,
            metrics: {
              aboutLatency: []
            }
          }
        ]
      }

      await uut.measureRelays(thisNode)
      // console.log('thisNode: ', thisNode)

      // Assert that the latecy metrics are unchanged.
      assert.equal(thisNode.relayData[0].metrics.aboutLatency.length, 0)
    })

    it('should give disconnected relays the worst latency score', async () => {
      // Mock test data
      const thisNode = {
        relayData: [
          {
            isBootstrap: false,
            connected: false,
            metrics: {
              aboutLatency: []
            }
          }
        ]
      }

      await uut.measureRelays(thisNode)
      // console.log('thisNode: ', thisNode)

      assert.equal(thisNode.relayData[0].metrics.aboutLatency[0], 10000)
    })

    it('should score the latency of a relay peer', async () => {
      // Mock test data
      const thisNode = {
        relayData: [
          {
            isBootstrap: false,
            connected: true,
            metrics: {
              aboutLatency: []
            }
          }
        ]
      }

      // Mock dependencies
      sandbox.stub(uut.adapters.bch.bchjs.Util, 'sleep').resolves()

      await uut.measureRelays(thisNode)
      // console.log(
      //   'thisNode.relayData[0].metrics.aboutLatency: ',
      //   thisNode.relayData[0].metrics.aboutLatency
      // )

      assert.isNumber(thisNode.relayData[0].metrics.aboutLatency[0])
    })

    it('should replace oldest data with new data', async () => {
      // Mock test data
      const thisNode = {
        relayData: [
          {
            isBootstrap: false,
            connected: true,
            metrics: {
              aboutLatency: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            }
          }
        ]
      }

      // Mock dependencies
      sandbox.stub(uut.adapters.bch.bchjs.Util, 'sleep').resolves()

      await uut.measureRelays(thisNode)
      // console.log(
      //   'thisNode.relayData[0].metrics.aboutLatency: ',
      //   thisNode.relayData[0].metrics.aboutLatency
      // )

      // First element of '1' should have been shifted out and replaced by '2'
      assert.equal(thisNode.relayData[0].metrics.aboutLatency[0], 2)
    })
  })
})
