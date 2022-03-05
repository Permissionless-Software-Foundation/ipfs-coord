/*
  This adapter is designed to poll the /about JSON RPC endpoint for IPFS Service
  Providers that leverage ipfs-coord. This allows other consumers of the
  ipfs-coord library to measure the latency between themselves and potential
  Circuit Relays.

  Using these metrics, IPFS nodes can prioritize the Circuit Relays with the
  lowest latency. At scale, this allows the entire IPFS subnet to adapt to
  changing network conditions.
*/

class AboutAdapter {
  constructor (localConfig = {}) {
    // Time to wait for a reponse from the RPC.
    this.waitPeriod = 10000

    // Used to pass asynchronous data when pubsub data is received.
    this.incomingData = false
  }

  // Query the /about JSON RPC endpoint for a subnet peer.
  // This function will return true on success or false on failure or timeout
  // of 10 seconds.
  // This function is used to measure the time for a response from the peer.
  async queryAbout (ipfsId, thisNode) {
    try {
      // console.log(`Querying Relay ${ipfsId}`)
      // console.log('thisNode: ', thisNode)

      // Generate the JSON RPC command
      const idNum = Math.floor(Math.random() * 10000).toString()
      const id = `metrics${idNum}`
      const cmdStr = `{"jsonrpc":"2.0","id":"${id}","method":"about"}`
      // console.log(`cmdStr: ${cmdStr}`)

      // console.log(`Sending JSON RPC /about command to ${ipfsId}`)
      const result = await this.sendRPC(ipfsId, cmdStr, id, thisNode)
      // console.log('sendRPC result: ', result)

      return result
    } catch (err) {
      console.error('Error in queryAbout()')

      // Do not throw an error.
      return false
    }
  }

  // This function is called by pubsub.captureMetrics() when a response is
  // recieved to an /about request. The data is used by sendRPC().
  relayMetricsReceived (inData) {
    this.incomingData = inData
  }

  // Send the RPC command to the service, wait a period of time for a response.
  // Timeout if a response is not recieved.
  async sendRPC (ipfsId, cmdStr, id, thisNode) {
    try {
      let retData = this.incomingData

      // Send the RPC command to the server/service.
      await thisNode.useCases.peer.sendPrivateMessage(ipfsId, cmdStr, thisNode)

      // Used for calculating the timeout.
      const start = new Date()
      let now = start
      let timeDiff = 0

      // Wait for the response from the server. Exit once the response is
      // recieved, or a timeout occurs.
      do {
        await thisNode.useCases.peer.adapters.bch.bchjs.Util.sleep(250)

        now = new Date()

        timeDiff = now.getTime() - start.getTime()
        // console.log('timeDiff: ', timeDiff)

        retData = this.incomingData

        // If data came in on the event emitter, analize it.
        if (retData) {
          // console.log('retData: ', retData)

          const jsonData = JSON.parse(retData)
          const respId = jsonData.id

          // If the JSON RPC ID matches, then it's the response thisNode was
          // waiting for.
          if (respId === id) {
            // responseRecieved = true
            // this.eventEmitter.removeListener('relayMetrics', cb)

            retData = false

            return true
          }
        }

      // console.log('retData: ', retData)
      } while (
        // Exit once the RPC data comes back, or if a period of time passes.
        timeDiff < this.waitPeriod
      )

      // this.eventEmitter.removeListener('relayMetrics', cb)
      return false
    } catch (err) {
      console.error('Error in sendRPC')
      // this.eventEmitter.removeListener('relayMetrics', cb)
      throw err
    }
  }
}

module.exports = AboutAdapter
