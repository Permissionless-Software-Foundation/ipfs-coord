/*
  This adapter is designed to poll the /about JSON RPC endpoint for IPFS Service
  Providers that leverage ipfs-coord. This allows other consumers of the
  ipfs-coord library to measure the latency between themselves and potential
  Circuit Relays.

  Using these metrics, IPFS nodes can prioritize the Circuit Relays with the
  lowest latency. At scale, this allows the entire IPFS subnet to adapt to
  changing network conditions.

  Dev Note:
  Unfortunately, the test in this adapter triggers a message to be sent to the
  private log of nodes consuming the ipfs-coord library. If this causes issues,
  the code in this library could be ported to the orbitdb-adapter.js library,
  which would eliminate the need to use an event emitter and cause the side
  effect.
*/

class AboutAdapter {
  constructor (localConfig = {}) {
    this.eventEmitter = localConfig.eventEmitter
    if (!this.eventEmitter) {
      throw new Error(
        'An instance of Event Emitter must be passed when instantiating the About Adapter libary'
      )
    }
  }

  // Query the /about JSON RPC endpoint for subnet peer.
  // This function will return true on success or false on failure or timeout
  // of 10 seconds.
  // This function is used to measure the time for a response from the peer.
  async queryAbout (ipfsId, thisNode) {
    try {
      // console.log('ipfsId: ', ipfsId)
      // console.log('thisNode: ', thisNode)

      // Generate the JSON RPC command
      const id = Math.floor(Math.random() * 10000).toString()
      // const cmd = this.jsonrpc.request(id, 'about', {})
      // const cmdStr = JSON.stringify(cmd)
      const cmdStr = `{"jsonrpc":"2.0","id":"${id}","method":"about"}`
      // console.log(`cmdStr: ${cmdStr}`)

      // console.log(`Sending JSON RPC /about command to ${ipfsId}`)
      await this.sendRPC(ipfsId, cmdStr, id, thisNode)
      // console.log('result: ', result)

      // const retData = JSON.parse(result)
      // console.log('retData: ', retData)

      // if (result.result.value.status && result.result.value.confirmations) {
      //   console.log('E2E TEST: transaction test passed.')
      //   return true
      // } else {
      //   console.log('E2E TEST: transaction test failed.')
      //   this.failTest()
      // }

      return true
    } catch (err) {
      console.error('Error in queryAbout()')
      // throw err

      // Do not throw an error.
      return false
    }
  }

  // Send the RPC command to the service, wait a period of time for a response.
  // Timeout if a response is not recieved.
  async sendRPC (ipfsId, cmdStr, id, thisNode) {
    try {
      let retData = false

      // This event is triggered when the response comes back.
      this.eventEmitter.on('relayMetrics', inData => {
        // console.log('ping! relayMetrics event triggered.')
        retData = inData
      })

      // Send the RPC command to the server/service.
      // await this.ipfsCoord.ipfs.orbitdb.sendToDb(ipfsId, cmdStr)
      await thisNode.useCases.peer.sendPrivateMessage(ipfsId, cmdStr, thisNode)

      // Used for calculating the timeout.
      const start = new Date()
      let now = start
      let timeDiff = 0

      // let responseRecieved = false

      // Wait for the response from the server. Exit once the response is
      // recieved, or a timeout occurs.
      do {
        await thisNode.useCases.peer.adapters.bch.bchjs.Util.sleep(1000)

        now = new Date()

        timeDiff = now.getTime() - start.getTime()
        // console.log('timeDiff: ', timeDiff)

        // If data came in on the event emitter, analize it.
        if (retData) {
          const jsonData = JSON.parse(retData)
          const respId = jsonData.id

          // If the JSON RPC ID matches, then it's the response thisNode was
          // waiting for.
          if (respId === id) {
            // responseRecieved = true
            return true
          }
        }

        // console.log('retData: ', retData)
      } while (
        // Exit once the RPC data comes back, or if a period of time passes.
        // !responseRecieved && // eslint-disable-line no-unmodified-loop-condition
        timeDiff < 10000
      )

      return false
    } catch (err) {
      console.error('Error in sendRPC')
      throw err
    }
  }
}

module.exports = AboutAdapter
