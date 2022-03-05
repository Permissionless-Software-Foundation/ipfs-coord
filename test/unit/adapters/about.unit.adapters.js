/*
  Unit tests for the about adapter library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

// local libraries
const AboutAdapter = require('../../../lib/adapters/pubsub-adapter/about-adapter')

describe('#About-adapter', () => {
  let uut
  let sandbox

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    // Instantiate the library under test. Must instantiate dependencies first.
    uut = new AboutAdapter()
  })

  afterEach(() => sandbox.restore())

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
      uut.incomingData = '{"id": 1}'

      const result = await uut.sendRPC(ipfsId, cmdStr, id, thisNode)
      // console.log('result: ', result)

      assert.equal(result, true)
    })

    it('should catch and throw errors', async () => {
      try {
        await uut.sendRPC()

        assert.fail('Unexpected code path')
      } catch (err) {
        // console.log(err)
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
