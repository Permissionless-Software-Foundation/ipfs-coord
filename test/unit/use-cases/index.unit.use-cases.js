/*
  Unit tests for Use Cases index.js file
*/

// npm libraries
const assert = require('chai').assert

// Local libraries
const UseCases = require('../../../lib/use-cases')

describe('#index.js-Use-Cases', () => {
  let uut

  describe('#constructor', () => {
    it('should throw an error if adapters is not included', () => {
      try {
        uut = new UseCases()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Must inject instance of adapters when instantiating Use Cases library.'
        )
      }
    })

    it('should throw an error if controllers are not included', () => {
      try {
        uut = new UseCases({ adapters: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Must inject instance of controllers when instantiating Use Cases library.'
        )
      }
    })

    it('should instantiate the use cases library', () => {
      uut = new UseCases({ adapters: {}, controllers: {}, statusLog: {} })

      assert.property(uut, 'adapters')
    })
  })
})
