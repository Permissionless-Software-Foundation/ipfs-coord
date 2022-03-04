/*
  Unit tests for the about adapter library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const EventEmitter = require('events')

// local libraries
const AboutAdapter = require('../../../lib/adapters/about-adapter')
// const BchAdapter = require('../../../lib/adapters/bch-adapter')

const eventEmitter = {
  emit: () => {
  },
  on: () => {
  },
  removeListener: () => {
  }
}

describe('#About-adapter', () => {
  let uut
  let sandbox

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    // const bchjs = new BCHJS()
    // const bch = new BchAdapter({ bchjs })

    // Instantiate the library under test. Must instantiate dependencies first.
    uut = new AboutAdapter({ eventEmitter })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if eventEmitter is not included', () => {
      try {
        uut = new AboutAdapter()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'An instance of Event Emitter must be passed when instantiating the About Adapter libary'
        )
      }
    })
  })

  describe('#sendRPC', () => {
    it('should return false if response is not recieved in time', async () => {
      // Prep test data.
      uut.waitPeriod = 1
      const ipfsId = 'testId'
      const cmdStr = 'fakeCmd'
      const id = 1
      const thisNode = {
        useCases: {
          peer: {
            sendPrivateMessage: async () => {
            },
            adapters: {
              bch: {
                bchjs: {
                  Util: {
                    sleep: () => {
                    }
                  }
                }
              }
            }
          }
        }
      }

      uut.eventEmitter = new EventEmitter()

      const result = await uut.sendRPC(ipfsId, cmdStr, id, thisNode)
      // console.log('result: ', result)

      assert.equal(result, false)
    })

    it('should return the result of the RPC call', async () => {
      // Prep test data.
      uut.waitPeriod = 2000
      const ipfsId = 'testId'
      const cmdStr = 'fakeCmd'
      const id = 1
      const thisNode = {
        useCases: {
          peer: {
            sendPrivateMessage: async () => {
            },
            adapters: {
              bch: {
                bchjs: {
                  Util: {
                    sleep: () => {
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Force positive code path.
      uut.retDataInitialValue = '{"id": 1}'

      const result = await uut.sendRPC(ipfsId, cmdStr, id, thisNode)
      // console.log('result: ', result)

      assert.equal(result, true)
    })

    it('should catch and throw errors', async () => {
      try {
        await uut.sendRPC()

        assert.fail('Unexpected code path')
      } catch (err) {
        console.log(err)
        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('#queryAbout', () => {
    it('should return true after peer responds to RPC', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'sendRPC').resolves(true)

      const result = await uut.queryAbout()
      assert.equal(result, true)
    })

    it('should return false if peer never responds to RPC', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'sendRPC').resolves(false)

      const result = await uut.queryAbout()
      assert.equal(result, false)
    })

    it('should return false when there is an error', async () => {
      // Mock dependencies
      sandbox.stub(uut, 'sendRPC').rejects(new Error('test error'))

      const result = await uut.queryAbout()
      assert.equal(result, false)
    })
  })
})
