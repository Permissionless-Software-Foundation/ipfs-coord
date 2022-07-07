/*
  Unit tests for the schema.js library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
// const cloneDeep = require('lodash.clonedeep')

// local libraries
const Gist = require('../../../lib/adapters/gist')

describe('#gist', () => {
  let sandbox
  let uut

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    uut = new Gist()
  })

  afterEach(() => sandbox.restore())

  describe('#getCRList', () => {
    it('should get data from GitHub', async () => {
      // Mock network dependencies
      sandbox.stub(uut.axios, 'get').resolves({
        data: {
          files: {
            'psf-public-circuit-relays.json': {
              content: JSON.stringify({ key: 'value' })
            }
          }
        }
      })

      const result = await uut.getCRList()
      // console.log('result: ', result)

      assert.property(result, 'key')
      assert.equal(result.key, 'value')
    })
  })
})
