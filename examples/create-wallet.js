/*
  An example app for creating a wallet using this library.
*/

const BchWallet = require('../index')

async function createWallet () {
  try {
    // Instantiate the wallet library.
    const bchWallet = new BchWallet()

    // Wait for the wallet to be created.
    await bchWallet.walletInfoPromise

    // Print out the wallet information.
    console.log(
      `Wallet information: ${JSON.stringify(bchWallet.walletInfo, null, 2)}`
    )
  } catch (err) {
    console.error('Error: ', err)
  }
}
createWallet()
