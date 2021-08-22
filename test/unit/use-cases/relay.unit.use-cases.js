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

describe('#index.js-Use-Cases', () => {
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

    it('should throw an error if statusLog is not included', () => {
      try {
        uut = new RelayUseCases({ adapters: {}, controllers: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Status log handler required when instantiating Relay Use Cases library.'
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

      // uut.state.relays = crMockData.circuitRelays
      await uut.connectToCRs(thisNode)

      assert.equal(true, true, 'Not throwing an error is a success')
    })
  })
})
