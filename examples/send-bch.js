/*
  An example for sending BCH with this library.
*/

const SlpWallet = require('../index')

async function sendBch () {
  try {
    // Replace the values for the constants below to customize for your use.
    const MNEMONIC =
      'essence appear intact casino neck scatter search post cube fit door margin'
    const RECIEVER = ''
    const SATS_TO_SEND = 1000

    // Instantiate the wallet library.
    const slpWallet = new SlpWallet(MNEMONIC)

    // Wait for the wallet to be created.
    await slpWallet.walletInfoPromise

    // Get the balance of the wallet.
    const balance = await slpWallet.getBalance()
    console.log(`balance: ${balance} satoshis`)

    // Exit if the wallet has no balance.
    if (balance === 0) {
      console.log(
        `The balance of your wallet is zero. Send BCH to ${
          slpWallet.walletInfo.address
        } to run this example.`
      )
      return
    }

    // Create the outputs array.
    const outputs = []

    // If reciever is not specified, send the funds back to the wallet.
    if (RECIEVER === '') {
      outputs.push({
        address: slpWallet.walletInfo.address,
        amountSat: SATS_TO_SEND
      })
    //
    // Send the funds to the reciever.
    } else {
      outputs.push({
        address: RECIEVER,
        amountSat: SATS_TO_SEND
      })
    }

    const txid = await slpWallet.send(outputs)

    console.log(`Success! BCH sent with TXID: ${txid}`)
  } catch (err) {
    console.error('Error: ', err)
  }
}
sendBch()
