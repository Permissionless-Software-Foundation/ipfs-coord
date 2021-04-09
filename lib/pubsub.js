/*
  A library for managing IPFS pubsub channels.

  TODO: Implement these methods:
  - subscribe to a pubsub channel.
  - unsubscribe from a pubsub channel.
  - publish a message to a pubsub channel.
  - parse pubsub messages into a JSON object.
  - setState() - Set the state of the instance of this Class.
  - getState() - Get the state of the instance of this Class.
  - getPubSubCoordChannels - retrieve updated pubsub coordination channels from
    IPNS or the BCH blockchain.
*/

// Local libraries
// const Peers = require('./peers')

let _this

class PubSub {
  constructor (pubsubConfig) {
    if (!pubsubConfig) {
      throw new Error(
        'Must pass a config object when instantiating the pubsub library.'
      )
    }

    if (!pubsubConfig.ipfs) {
      throw new Error(
        'Must pass in an instance of IPFS when instantiating the pubsub library.'
      )
    }

    if (!pubsubConfig.peers) {
      throw new Error(
        'Must pass in an instance of Peers library when instantiating the pubsub library.'
      )
    }

    // Pass-through config settings
    this.ipfs = pubsubConfig.ipfs
    this.statusLog = pubsubConfig.statusLog
    this.peers = pubsubConfig.peers

    _this = this
  }

  // Attempts to parse data coming in from a pubsub channel. It is assumed that
  // the data is a string in JSON format. If it isn't, parsing will throw an
  // error and the message will be ignored.
  async parsePubsubMessage (msg, handler) {
    try {
      // console.log(msg.data.toString())
      // console.log('msg: ', msg)

      // Get ID information about this IPFS node.
      const id = await this.ipfs.id()

      // Get data about the message.
      const from = msg.from
      const channel = msg.topicIDs[0]

      // Ignore this message if it originated from this IPFS node.
      if (from === id.id) return

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

  // Subscribe to a pubsub channel. Any data received on that channel is passed
  // to the handler.
  async subscribeToPubsubChannel (chanName, handler) {
    try {
      await this.ipfs.pubsub.subscribe(chanName, async msg => {
        await _this.parsePubsubMessage(msg, handler)
      })
      this.statusLog(`Subscribed to pubsub channel: ${chanName}`)
    } catch (err) {
      console.error('Error in subscribeToPubsubChannel()')
      throw err
    }
  }

  // Converts an input string to a Buffer and then broadcasts it to the given
  // pubsub room.
  async publishToPubsubChannel (chanName, msgStr) {
    try {
      const msgBuf = Buffer.from(JSON.stringify(msgStr))

      // Publish the message to the pubsub channel.
      await this.ipfs.pubsub.publish(chanName, msgBuf)
    } catch (err) {
      console.error('Error in publishToPubsubChannel()')
      throw err
    }
  }
}

module.exports = PubSub
