/*
  Unit tests for the bch-lib library.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const BCHJS = require('@psf/bch-js')

// local libraries
const BchLib = require('../../lib/bch-lib')

describe('#bch-lib', () => {
  let sandbox
  let uut
  let bchjs

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    bchjs = new BCHJS()
    uut = new BchLib({ bchjs })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if bch-js instance is not passed in', () => {
      try {
        uut = new BchLib({})
      } catch (err) {
        assert.include(
          err.message,
          'An instance of bchjs must be passed when instantiating the ipfs-lib library.'
        )
      }
    })
  })

  describe('#generateBchId', () => {
    it('should generate a new BCH ID if mnemonic is not given', async () => {
      const result = await uut.generateBchId()
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.property(result, 'cashAddress')
      assert.property(result, 'slpAddress')
      assert.property(result, 'publicKey')
    })

    it('should generate same address if mnemonic is given', async () => {
      const mnemonic =
        'feature cart obtain exist impulse slab frog run smile elder crucial fatigue'

      uut = new BchLib({ bchjs, mnemonic })
      const result = await uut.generateBchId()
      // console.log(`result: ${JSON.stringify(result, null, 2)}`)

      assert.equal(
        result.cashAddress,
        'bitcoincash:qpagvxxj29p24nkyheezrfky93jxf6h20uul3ldg73'
      )
      assert.equal(
        result.slpAddress,
        'simpleledger:qpagvxxj29p24nkyheezrfky93jxf6h20usy6ycgq0'
      )
      assert.equal(
        result.publicKey,
        '02995864fdcf5769b14b16e7cfb86f643a567470a2f557983a4284a8c6f17dc767'
      )
    })

    it('should catch and throw an error', async () => {
      try {
        sandbox
          .stub(uut.bchjs.Mnemonic, 'generate')
          .throws(new Error('test error'))

        await uut.generateBchId()

        assert.fail('Unexpected code path. Error was expected to be thrown.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#generatePrivateKey', () => {
    it('should generate a private key', async () => {
      const result = await uut.generatePrivateKey()
      console.log('result: ', result)

      // The private key shoul be a string.
      assert.isString(result)

      // It shoul be a WIF that starts with a K or L
      // assert.equal(result[0], 'K' || 'L')
    })

    it('should catch and throw an error', async () => {
      try {
        sandbox
          .stub(uut.bchjs.Mnemonic, 'generate')
          .throws(new Error('test error'))

        await uut.generatePrivateKey()

        assert.fail('Unexpected code path. Error was expected to be thrown.')
      } catch (err) {
        // console.log(err)
        assert.include(err.message, 'test error')
      }
    })
  })
})
