/*
  Unit tests for the main Controllers index.js file.
*/

// npm libraries
const assert = require('chai').assert

// Local libraries
const Controllers = require('../../../lib/controllers')

describe('#index.js-Controllers', () => {
  let uut

  describe('#constructor', () => {
    it('should throw an error if adapters is not included', () => {
      try {
        uut = new Controllers()

        assert.fail('Unexpected code path')

        console.log(uut)
      } catch (err) {
        assert.include(
          err.message,
          'Instance of adapters required when instantiating Controllers'
        )
      }
    })
  })
})
