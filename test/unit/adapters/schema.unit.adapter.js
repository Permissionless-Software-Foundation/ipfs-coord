/*
  Unit tests for the schema.js library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
// const cloneDeep = require('lodash.clonedeep')

// local libraries
const Schema = require('../../../lib/adapters/schema')

describe('#schema', () => {
  let sandbox
  let uut

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    const schemaConfig = {
      ipfsId: 'myIpfsId',
      type: 'node.js',
      ipfsMultiaddrs: ['addr1', 'addr2']
    }
    uut = new Schema(schemaConfig)
  })

  afterEach(() => sandbox.restore())

  describe('#announcement', () => {
    it('should return an announcement object', () => {
      const result = uut.announcement()
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      // Assert that expected properties exist.
      assert.property(result, 'apiName')
      assert.property(result, 'apiVersion')
      assert.property(result, 'apiInfo')
      assert.property(result, 'ipfsId')
      assert.property(result, 'type')
      assert.property(result, 'ipfsMultiaddrs')
      assert.property(result, 'circuitRelays')
      assert.property(result, 'isCircuitRelay')
      assert.property(result, 'cryptoAddresses')
      assert.property(result, 'encryptPubKey')
      assert.property(result, 'orbitdb')

      // Assert that properties have the expected type.
      assert.isArray(result.ipfsMultiaddrs)
      assert.isArray(result.circuitRelays)
      assert.isArray(result.cryptoAddresses)

      // Assert expected values.
      assert.equal(result.isCircuitRelay, false)
      assert.equal(result.apiName, 'ipfs-coord-announce')
      assert.equal(result.type, 'node.js')
    })

    it('should update orbitdbId in state when different', () => {
      const announceObj = {
        orbitdbId: '567'
      }

      const result = uut.announcement(announceObj)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.property(result, 'orbitdb')
      assert.equal(result.orbitdb, '567')
    })
  })

  describe('#chat', () => {
    it('should return a chat object', () => {
      const msgObj = {
        message: 'Some arbitrary text.',
        handle: 'Testy Tester'
      }

      const result = uut.chat(msgObj)
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      // Assert that expected properties exist.
      assert.property(result, 'apiName')
      assert.property(result, 'apiVersion')
      assert.property(result, 'apiInfo')
      assert.property(result, 'cryptoAddresses')
      assert.property(result, 'encryptPubKey')
      assert.property(result, 'data')
      assert.property(result.data, 'message')
      assert.property(result.data, 'handle')
      assert.property(result, 'ipfsId')

      // Assert that properties have the expected type.
      assert.isArray(result.cryptoAddresses)

      // Assert expected values.
      assert.equal(result.apiName, 'chat')
      assert.equal(result.type, 'node.js')
    })
  })
})
