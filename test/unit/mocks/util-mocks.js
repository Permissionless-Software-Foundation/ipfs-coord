/*
  A mocking library for util.js unit tests.
  A mocking library contains data to use in place of the data that would come
  from an external dependency.
*/

'use strict'

const mockBalance = {
  success: true,
  balance: {
    confirmed: 1000,
    unconfirmed: 0
  }
}

const mockUtxos = {
  success: true,
  utxos: [
    {
      height: 601861,
      tx_hash: '6181c669614fa18039a19b23eb06806bfece1f7514ab457c3bb82a40fe171a6d',
      tx_pos: 0,
      value: 1000
    }
  ]
}

module.exports = {
  mockBalance,
  mockUtxos
}
