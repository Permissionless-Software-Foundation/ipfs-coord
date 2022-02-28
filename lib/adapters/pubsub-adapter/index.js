/*
  Adapter library for working with pubsub channels and messages
*/

// Local libraries
const Messaging = require('./messaging')

class PubsubAdapter {
  constructor (localConfig = {}) {
    // Dependency Injection
    this.ipfs = localConfig.ipfs
    if (!this.ipfs) {
      throw new Error(
        'Instance of IPFS adapter required when instantiating Pubsub Adapter.'
      )
    }
    this.log = localConfig.log
    if (!this.log) {
      throw new Error(
        'A status log handler function required when instantitating Pubsub Adapter'
      )
    }
    this.encryption = localConfig.encryption
    if (!this.encryption) {
      throw new Error(
        'An instance of the encryption Adapter must be passed when instantiating the Pubsub Adapter library.'
      )
    }
    this.privateLog = localConfig.privateLog
    if (!this.privateLog) {
      throw new Error(
        'A private log handler must be passed when instantiating the Pubsub Adapter library.'
      )
    }

    // Encapsulate dependencies
    this.messaging = new Messaging(localConfig)

    // 'embedded' node type used as default, will use embedded js-ipfs.
    // Alternative is 'external' which will use ipfs-http-client to control an
    // external IPFS node.
    this.nodeType = localConfig.nodeType
    if (!this.nodeType) {
      // console.log('No node type specified. Assuming embedded js-ipfs.')
      this.nodeType = 'embedded'
    }
    console.log(`PubsubAdapter contructor node type: ${this.nodeType}`)
  }

  // Subscribe to a pubsub channel. Any data received on that channel is passed
  // to the handler.
  async subscribeToPubsubChannel (chanName, handler, thisNode) {
    try {
      // console.log('thisNode: ', thisNode)
      const thisNodeId = thisNode.ipfsId

      // Normal use-case, where the pubsub channel is NOT the receiving channel
      // for this node. This applies to general broadcast channels like
      // the coordination channel that all nodes use to annouce themselves.
      if (chanName !== thisNodeId) {
        // console.log('this.ipfs: ', this.ipfs)
        await this.ipfs.ipfs.pubsub.subscribe(chanName, async (msg) => {
          await this.parsePubsubMessage(msg, handler, thisNode)
        })

      //
      } else {
        // Subscribing to our own pubsub channel. This is the channel other nodes
        // will use to send RPC commands and send private messages.

        await this.ipfs.ipfs.pubsub.subscribe(chanName, async (msg) => {
          const msgObj = await this.messaging.handleIncomingData(msg, thisNode)

          // If msgObj is false, then ignore it. Typically indicates an already
          // processed message.
          if (msgObj) { await this.handleNewMessage(msgObj, handler, thisNode) }
        })
      }

      this.log.statusLog(
        0,
        `status: Subscribed to pubsub channel: ${chanName}`
      )
    } catch (err) {
      console.error('Error in subscribeToPubsubChannel()')
      throw err
    }
  }

  // After the messaging library does the lower-level message handling and
  // decryption, it passes the message on to this function, which does any
  // additional parsing needed and
  // then routes the parsed data on to the user-specified handler.
  async handleNewMessage (msgObj, handler, thisNode) {
    try {
      console.log('handleNewMessage() will forward this data onto the handler: ', msgObj)

      // Check to see if this is metrics data or user-requested data.
      // If it the response to a metrics query, trigger the handler for that.
      // Dev note: This only handles the response. The JSON RPC must pass
      // through this function to the privateLog, to be handled by the service
      // being measured.
      this.captureMetrics(msgObj.data.payload)

      // Pass the JSON RPC data to the private log to be handled by the app
      // consuming this library.
      this.privateLog(msgObj.data.payload, msgObj.from)
    } catch (err) {
      console.error('Error in handleNewMessage()')
      throw err
    }
  }

  // Scans input data. If the data is determined to be an 'about' JSON RPC
  // reponse used for metrics, then the relayMetrics event is triggered and
  // true is returned. Otherwise, false is returned.
  captureMetrics (decryptedStr) {
    try {
      console.log('decryptedStr: ', decryptedStr)
      const data = JSON.parse(decryptedStr)
      console.log('data: ', data)

      if (data.id.includes('metrics')) {
        // console.log('triggering relayMetrics event')

        // Syndicate the data as relayMetrics event, in case this is the result
        // of testing the latency between Circuit Relays.
        // This event is handled by the about-adapter.js
        // console.log("debug: Emitting relayMetrics event.")
        this.eventEmitter.emit('relayMetrics', decryptedStr)

        return true
      }

      return false
    } catch (err) {
      console.error('Error in captureMetrics: ', err)
      return false
    }
  }

  // Attempts to parse data coming in from a pubsub channel. It is assumed that
  // the data is a string in JSON format. If it isn't, parsing will throw an
  // error and the message will be ignored.
  async parsePubsubMessage (msg, handler, thisNode) {
    try {
      // console.log('message data: ', msg.data)
      // console.log('parsePubsubMessage msg: ', msg)

      const thisNodeId = thisNode.ipfsId

      // Get data about the message.
      const from = msg.from
      const channel = msg.topicIDs[0]

      // Used for debugging.
      this.log.statusLog(
        2,
        `New pubsub message recieved from ${from} on channel ${channel}`
      )

      // Ignore this message if it originated from this IPFS node.
      if (from === thisNodeId) return

      // The data on browsers comes through as a uint8array, and on node.js
      // implementiong it comes through as a string. Browsers need to
      // convert the message from a uint8array to a string.
      if (thisNode.type === 'browser' || this.nodeType === 'external') {
        // console.log('Node type is browser')
        msg.data = new TextDecoder('utf-8').decode(msg.data)
      }

      // Parse the data into a JSON object. It starts as a Buffer that needs
      // to be converted to a string, then parsed to a JSON object.
      // For some reason I have to JSON parse it twice. Not sure why.
      const data = JSON.parse(JSON.parse(msg.data.toString()))
      // console.log('data: ', data)

      const retObj = { from, channel, data }
      // console.log(`new pubsub message received: ${JSON.stringify(retObj, null, 2)}`)

      // TODO: Send an ACK message

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
      console.error('Error in parsePubsubMessage(): ', err.message)
      // Do not throw an error. This is a top-level function.

    // console.log('msg that caused error: ', msg)
    }
  }
}

module.exports = PubsubAdapter
