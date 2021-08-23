/*
  Unit tests for the Peer Use Case library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

// Local libraries
const PeerUseCases = require('../../../lib/use-cases/peer-use-cases')
// const RelayUseCases = require('../../../lib/use-cases/relay-use-cases')
const ThisNodeUseCases = require('../../../lib/use-cases/this-node-use-cases')
const AdapterMock = require('../../mocks/adapter-mock')
const adapters = new AdapterMock()
// const mockData = require('../../mocks/peers-mock')

describe('#Peer-Use-Cases', () => {
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
    //
    // uut = new RelayUseCases({
    //   adapters,
    //   controllers: {},
    //   statusLog: () => {}
    // })

    uut = new PeerUseCases({ adapters, controllers: {} })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters is not included', () => {
      try {
        uut = new PeerUseCases()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Must inject instance of adapters when instantiating Peer Use Cases library.'
        )
      }
    })

    it('should throw an error if controllers are not included', () => {
      try {
        uut = new PeerUseCases({ adapters: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Must inject instance of controllers when instantiating Peer Use Cases library.'
        )
      }
    })
  })

  describe('#sendPrivateMessage', () => {
    it('should throw an error if peer data can not be found', async () => {
      try {
        const result = await uut.sendPrivateMessage(
          'fakeId',
          'messageStr',
          thisNode
        )
        console.log('result: ', result)
      } catch (err) {
        assert.include(err.message, 'Data for peer')
      }
    })

    it('should throw an error if OrbitDB for peer can not be found', async () => {
      try {
        thisNode.peerData.push({ from: 'fakeId' })

        const result = await uut.sendPrivateMessage(
          'fakeId',
          'messageStr',
          thisNode
        )
        console.log('result: ', result)
      } catch (err) {
        // console.log('err: ', err)
        assert.include(err.message, 'OrbitDB for peer')
      }
    })

    it('should encrypt a message and add it to the peers OrbitDB', async () => {
      thisNode.peerData.push({ from: 'fakeId' })
      thisNode.orbitData.push({ ipfsId: 'fakeId', db: { add: () => {} } })

      // Mock dependencies
      // sandbox.stub(uut.adapters.encryption, 'encryptMsg')

      const result = await uut.sendPrivateMessage(
        'fakeId',
        'messageStr',
        thisNode
      )
      // console.log('result: ', result)

      assert.equal(result, true)
    })
  })
})
