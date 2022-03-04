/*
  Unit tests for the main Controllers index.js file.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

// Local libraries
const TimerControllers = require('../../../lib/controllers/timer-controller')
const AdapterMock = require('../../mocks/adapter-mock')
const adapters = new AdapterMock()
const UseCasesMock = require('../../mocks/use-case-mocks')
const ThisNodeUseCases = require('../../../lib/use-cases/this-node-use-cases')

describe('#timer-Controllers', () => {
  let uut
  let sandbox
  let useCases
  let thisNode

  beforeEach(async () => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    uut = new TimerControllers({
      adapters,
      statusLog: () => {
      }
    })

    const thisNodeUseCases = new ThisNodeUseCases({
      adapters,
      controllers: {},
      statusLog: () => {
      }
    })
    thisNode = await thisNodeUseCases.createSelf({ type: 'node.js' })

    useCases = new UseCasesMock()
  })

  afterEach(() => sandbox.restore())

  after(() => {
    console.log('Stopping all timers')
    uut.stopAllTimers()
  })

  describe('#constructor', () => {
    it('should throw an error if adapters is not included', () => {
      try {
        uut = new TimerControllers()
      } catch (err) {
        assert.include(
          err.message,
          'Instance of adapters required when instantiating Timer Controllers'
        )
      }
    })

    it('should throw an error if status log handler is not included', () => {
      try {
        uut = new TimerControllers({ adapters })
      } catch (err) {
        assert.include(
          err.message,
          'Handler for status logs required when instantiating Timer Controllers'
        )
      }
    })
  })

  describe('#startTimers', () => {
    it('should start the timers', () => {
      const result = uut.startTimers()

      assert.property(result, 'circuitRelayTimerHandle')
      assert.property(result, 'announceTimerHandle')
      assert.property(result, 'peerTimerHandle')

      // Clean up test by stopping the timers.
      clearInterval(result.circuitRelayTimerHandle)
      clearInterval(result.announceTimerHandle)
      clearInterval(result.peerTimerHandle)
    })
  })

  describe('#manageCircuitRelays', () => {
    it('should refresh connections with known circuit relays', async () => {
      await uut.manageCircuitRelays({}, useCases)

      assert.isOk(true, 'Not throwing an error is a pass')
    })

    it('should give status update if debugLevel is true', async () => {
      uut.debugLevel = 1

      await uut.manageCircuitRelays({}, useCases)

      assert.isOk(true, 'Not throwing an error is a pass')
    })

    it('should catch and report an error', async () => {
      // Force an error
      sandbox
        .stub(useCases.relays, 'connectToCRs')
        .rejects(new Error('test error'))

      await uut.manageCircuitRelays(thisNode, useCases)

      assert.isOk(true, 'Not throwing an error is a pass')
    })
  })

  describe('#manageAnnouncement', () => {
    it('should publish an announcement to the general coordination pubsub channel', async () => {
      const result = await uut.manageAnnouncement(thisNode, useCases)

      assert.equal(result, true)
    })

    it('should give status update if debugLevel is true', async () => {
      uut.debugLevel = 1

      const result = await uut.manageAnnouncement(thisNode, useCases)

      assert.equal(result, true)
    })

    it('should catch and report an error', async () => {
      // Force an error
      sandbox
        .stub(thisNode.schema, 'announcement')
        .throws(new Error('test error'))

      await uut.manageAnnouncement(thisNode, useCases)

      assert.isOk(true, 'Not throwing an error is a pass')
    })
  })

  describe('#managePeers', () => {
    it('should refresh connections to peers', async () => {
      const result = await uut.managePeers(thisNode, useCases)

      assert.equal(result, true)
    })

    it('should give status update if debugLevel is true', async () => {
      uut.debugLevel = 1

      const result = await uut.managePeers(thisNode, useCases)

      assert.equal(result, true)
    })

    it('should catch and report an error', async () => {
      // Force an error
      sandbox
        .stub(useCases.thisNode, 'refreshPeerConnections')
        .throws(new Error('test error'))

      await uut.managePeers(thisNode, useCases)

      assert.isOk(true, 'Not throwing an error is a pass')
    })
  })

  describe('#searchForRelays', () => {
    it('should find and relay-potential peers that are not in the relayData array', async () => {
      // Mock test data
      const thisNode = {
        relayData: [{ ipfsId: 'id1' }],
        peerData: [{ from: 'id2', data: { isCircuitRelay: true } }]
      }

      await uut.searchForRelays(thisNode, useCases)

      // Cleanup test by disabling the interval
      clearInterval(uut.relaySearch)

      assert.isOk(true, 'Not throwing an error is a pass')
    })

    it('should report errors but not throw them', async () => {
      await uut.searchForRelays()

      assert.isOk(true, 'Not throwing an error is a pass')
    })
  })

  describe('#blacklist', () => {
    it('should return true after executing the use case', async () => {
      const result = await uut.blacklist(thisNode, useCases)

      assert.equal(result, true)
    })

    it('should return false on error', async () => {
      // Force an error
      // sandbox
      //   .stub(useCases.thisNode, 'enforceBlacklist')
      //   .rejects(new Error('test error'))
      sandbox
        .stub(useCases.thisNode, 'enforceWhitelist')
        .rejects(new Error('test error'))

      const result = await uut.blacklist(thisNode, useCases)

      assert.equal(result, false)
    })
  })
})
