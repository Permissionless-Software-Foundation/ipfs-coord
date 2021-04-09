/*
  An example for listing the tokens and token balances of the wallet. a
*/

const SlpWallet = require('../index')

async function listTokens () {
  try {
    // Replace the values for the constants below to customize for your use.
    const MNEMONIC =
      'essence appear intact casino neck scatter search post cube fit door margin'

    // Instantiate the wallet library.
    const slpWallet = new SlpWallet(MNEMONIC)

    // Wait for the wallet to be created.
    await slpWallet.walletInfoPromise

    // Get the token summary
    const tokenInfo = await slpWallet.listTokens()
    console.log(`tokenInfo: ${JSON.stringify(tokenInfo, null, 2)}`)
  } catch (err) {
    console.error('Error: ', err)
  }
}
listTokens()
