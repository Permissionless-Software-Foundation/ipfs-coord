/*
  Unit tests for the schema.js library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')

// local libraries
const CircuitRelay = require('../../lib/circuit-relay')
const ipfsLib = require('./mocks/ipfs-mock')
const bootstrapCircuitRelays = require('../../config/bootstrap-circuit-relays')
const peerMockData = require('./mocks/peers-mock')
const crMockData = require('./mocks/circuit-relay-mocks')

describe('#circuit-relay', () => {
  let sandbox
  let uut
  let ipfs

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    ipfs = cloneDeep(ipfsLib)

    const crConfig = {
      ipfs,
      type: 'node.js',
      statusLog: () => {}
    }

    uut = new CircuitRelay(crConfig)
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should instantiate the class', () => {
      const crConfig = {
        ipfs,
        type: 'node.js',
        statusLog: () => {}
      }

      uut = new CircuitRelay(crConfig)

      assert.property(uut, 'state')
      assert.property(uut, 'ipfs')
      assert.property(uut, 'statusLog')
    })

    it('should throw an error if config object is not specified', () => {
      try {
        uut = new CircuitRelay()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Must pass a config object when instantiating the CircuitRelays library.'
        )
      }
    })

    it('should throw an error if type is not specified', () => {
      try {
        uut = new CircuitRelay({})

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'The type of IPFS node must be specified.')
      }
    })

    it('should throw an error if ipfs instance is not passed', () => {
      try {
        uut = new CircuitRelay({ type: 'node.js' })

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(
          err.message,
          'Must pass in an instance of IPFS when instantiating the CircuitRelays library.'
        )
      }
    })

    it('should default to a node.js IPFS node', () => {
      const crConfig = {
        ipfs,
        type: 'poor-spelling',
        logger: () => {}
      }

      uut = new CircuitRelay(crConfig)
      // console.log('uut: ', uut)

      assert.property(uut, 'state')
      assert.property(uut.state, 'type')
      assert.equal(uut.state.relays, bootstrapCircuitRelays.node)
    })

    it('should instantiate for a browser IPFS node', () => {
      const crConfig = {
        ipfs,
        type: 'browser',
        logger: () => {}
      }

      uut = new CircuitRelay(crConfig)
      // console.log('uut: ', uut)

      assert.property(uut, 'state')
      assert.property(uut.state, 'type')
      assert.equal(uut.state.type, 'browser')
      assert.equal(uut.state.relays, bootstrapCircuitRelays.browser)
    })
  })

  describe('#connectToCRs', () => {
    it('should connect to array of circuit relays', async () => {
      await uut.connectToCRs()

      assert.equal(true, true, 'Not throwing an error is a success')
    })

    it('Should not connect the circuit relays that are in the swarm list', async () => {
      // Mock the response from orbitdb.
      sandbox.stub(uut.ipfs.swarm, 'peers').resolves(peerMockData.swarmPeers2)
      // https://sinonjs.org/releases/v10.0.1/spies/
      sandbox.spy(uut.ipfs.swarm, 'connect')

      uut.state.relays = crMockData.circuitRelays
      await uut.connectToCRs()

      assert.isTrue(
        uut.ipfs.swarm.connect.notCalled,
        'Expects not to be called'
      )
      assert.equal(true, true, 'Not throwing an error is a success')
    })

    it('should connect the circuit relays that are not in the swarm list', async () => {
      // Mock the response from orbitdb.
      sandbox.stub(uut.ipfs.swarm, 'peers').resolves(peerMockData.swarmPeers)
      // https://sinonjs.org/releases/v10.0.1/spies/
      sandbox.spy(uut.ipfs.swarm, 'connect')

      uut.state.relays = crMockData.circuitRelays
      await uut.connectToCRs()

      assert.isTrue(
        uut.ipfs.swarm.connect.calledOnce,
        'Expected to be called once'
      )
      assert.equal(true, true, 'Not throwing an error is a success')
    })

    it('should operate in the face of network issues', async () => {
      // Force an error.
      sandbox.stub(uut.ipfs.swarm, 'connect').rejects(new Error('test error'))

      await uut.connectToCRs()

      assert.equal(true, true, 'Not throwing an error is a success')
    })
  })
})
