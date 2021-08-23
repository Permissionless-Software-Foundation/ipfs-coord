/*
  Unit tests for the encryption adapter library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const BCHJS = require('@psf/bch-js')

// local libraries
const EncryptionAdapter = require('../../../lib/adapters/encryption-adapter')
const BchAdapter = require('../../../lib/adapters/bch-adapter')

describe('#Encryption-adapter', () => {
  let uut
  let sandbox

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    const bchjs = new BCHJS()
    const bch = new BchAdapter({ bchjs })

    // Instantiate the library under test. Must instantiate dependencies first.
    uut = new EncryptionAdapter({ bch })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if bch adapter is not included', () => {
      try {
        uut = new EncryptionAdapter()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Must pass in an instance of bch Adapter when instantiating the encryption Adapter library.'
        )
      }
    })
  })

  describe('#decryptMsg', () => {
    it('should decrypt a message', async () => {
      // Mock dependencies
      sandbox
        .stub(uut.bchEncrypt.encryption, 'decryptFile')
        .resolves('decryptedMsg')

      const result = await uut.decryptMsg('F6')
      // console.log('result: ', result)

      assert.isOk(result)
    })

    it('should handle BAD MAC error messages', async () => {
      try {
        // Force a BAD MAC error
        sandbox
          .stub(uut.bchEncrypt.encryption, 'decryptFile')
          .rejects(new Error('Bad MAC'))

        await uut.decryptMsg('F6')

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Bad MAC. Could not decrypt message.')
      }
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.bchEncrypt.encryption, 'decryptFile')
          .rejects(new Error('test error'))

        await uut.decryptMsg('F6')

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#encryptMsg', () => {
    it('should catch and throw errors', async () => {
      try {
        const peer = {
          data: {
            encryptionKey: 'abc123'
          }
        }

        await uut.encryptMsg(peer, 'testMsg')
        // console.log('result: ', result)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'pubkey must be a hex string')
      }
    })

    it('should encrypt a string', async () => {
      // Mock dependencies
      sandbox
        .stub(uut.bchEncrypt.encryption, 'encryptFile')
        .resolves('encryptedMsg')

      const peer = {
        data: {
          encryptionKey: 'abc123'
        }
      }

      const result = await uut.encryptMsg(peer, 'testMsg')
      // console.log('result: ', result)

      assert.equal(result, 'encryptedMsg')
    })
  })
})
