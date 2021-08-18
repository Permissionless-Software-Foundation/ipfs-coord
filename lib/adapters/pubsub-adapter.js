/*
  Adapter library for working with pubsub channels and messages
*/

class PubsubAdapter {
  constructor (localConfig = {}) {
    // Dependency Injection
    this.ipfs = localConfig.ipfs
    if (!this.ipfs) {
      throw new Error(
        'Instance of IPFS adapter required when instantiating Pubsub Adapter.'
      )
    }
    this.statusLog = localConfig.statusLog
    if (!this.statusLog) {
      throw new Error(
        'A status log handler function required when instantitating Pubsub Adapter'
      )
    }
  }

  // Subscribe to a pubsub channel. Any data received on that channel is passed
  // to the handler.
  async subscribeToPubsubChannel (chanName, handler, thisNodeId) {
    try {
      // console.log('this.ipfs: ', this.ipfs)
      await this.ipfs.ipfs.pubsub.subscribe(chanName, async msg => {
        await this.parsePubsubMessage(msg, handler, thisNodeId)
      })
      this.statusLog(`Subscribed to pubsub channel: ${chanName}`)
    } catch (err) {
      console.error('Error in subscribeToPubsubChannel()')
      throw err
    }
  }

  // Attempts to parse data coming in from a pubsub channel. It is assumed that
  // the data is a string in JSON format. If it isn't, parsing will throw an
  // error and the message will be ignored.
  async parsePubsubMessage (msg, handler, thisNodeId) {
    try {
      // console.log(msg.data.toString())
      // console.log('msg: ', msg)

      // Get ID information about this IPFS node.
      // const id = await this.ipfs.id()

      // Get data about the message.
      const from = msg.from
      const channel = msg.topicIDs[0]

      // Ignore this message if it originated from this IPFS node.
      if (from === thisNodeId) return

      // Parse the data into a JSON object. It starts as a Buffer that needs
      // to be converted to a string, then parsed to a JSON object.
      // For some reason I have to JSON parse it twice. Not sure why.
      const data = JSON.parse(JSON.parse(msg.data.toString()))
      // console.log('data: ', data)

      const retObj = { from, channel, data }
      // console.log(`new pubsub message received: ${JSON.stringify(retObj, null, 2)}`)

      // Hand retObj to the callback.
      handler(retObj)

      // START ROUTER
      // if (retObj.data.apiName === 'chat') {
      //   console.log(`${from}: ${retObj.data.data.message}`)
      // }
      // if (retObj.data.apiName === 'ipfs-coord') {
      //   this.peers.addPeer(retObj)
      // }
      // END ROUTER
    } catch (err) {
      console.error('Error in parsePubsubMessage(): ', err)
      // Do not throw an error. This is a top-level function.

      console.log('msg: ', msg)
    }
  }
}

module.exports = PubsubAdapter
