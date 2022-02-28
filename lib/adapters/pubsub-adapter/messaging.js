/*
  A library for broadcasting messages over pubsub and managing 'lost messages'.
*/

// Global npm libraries
const { v4: uid } = require('uuid')

// Local libraries

// Constants
const TIME_BETWEEN_RETRIES = 5000 // time in milliseconds
const RETRY_LIMIT = 3

let _this

class Messaging {
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

    // 'embedded' node type used as default, will use embedded js-ipfs.
    // Alternative is 'external' which will use ipfs-http-client to control an
    // external IPFS node.
    this.nodeType = localConfig.nodeType
    if (!this.nodeType) {
      // console.log('No node type specified. Assuming embedded js-ipfs.')
      this.nodeType = 'embedded'
    }

    // Encapsulate dependencies
    this.uid = uid

    // State
    this.msgQueue = []
    // Cache to store UUIDs of processed messages. Used to prevent duplicate
    // processing.
    this.msgCache = []
    this.MSG_CACHE_SIZE = 30

    _this = this
  }

  // Generate a message object with UUID and timestamp.
  generateMsgObj (inMsgObj = {}) {
    try {
      const { sender, receiver, payload } = inMsgObj

      // Input validation
      if (!sender) {
        throw new Error('Sender required when calling generateMsgObj()')
      }
      if (!receiver) {
        throw new Error('Receiver required when calling generateMsgObj()')
      }
      if (!payload) {
        throw new Error('Payload required when calling generateMsgObj()')
      }

      const uuid = this.uid()

      const now = new Date()
      const timestamp = now.toISOString()

      const outMsgObj = {
        timestamp,
        uuid,
        sender,
        receiver,
        payload
      }

      return outMsgObj
    } catch (err) {
      console.log('Error in generateMsgObj()')
      throw err
    }
  }

  // Generate an ACK (acknowledge) message.
  async generateAckMsg (data, thisNode) {
    try {
      // The sender of the original messages is the receiver of the ACK message.
      const receiver = data.sender
      const uuid = data.uuid

      const ackMsg = {
        apiName: 'ACK'
      }

      const peerData = thisNode.peerData.filter(x => x.from === receiver)

      // Encrypt the string with the peers public key.
      const payload = await this.encryption.encryptMsg(
        peerData[0],
        JSON.stringify(ackMsg)
      )

      const sender = thisNode.ipfsId

      const inMsgObj = {
        sender,
        receiver,
        payload
      }

      const outMsgObj = this.generateMsgObj(inMsgObj)

      // Replace the message UUID with the UUID from the original message.
      outMsgObj.uuid = uuid

      return outMsgObj
    } catch (err) {
      console.error('Error in generateAckMsg()')
      throw err
    }
  }

  // Converts an input string to a Buffer and then broadcasts it to the given
  // pubsub room.
  async publishToPubsubChannel (chanName, msgObj) {
    try {
      const msgBuf = Buffer.from(JSON.stringify(msgObj))

      // Publish the message to the pubsub channel.
      await this.ipfs.ipfs.pubsub.publish(chanName, msgBuf)

      // Used for debugging.
      this.log.statusLog(
        2,
        `New message published to pubsub channel ${chanName} with ID ${msgObj.uuid}`
      )
    } catch (err) {
      console.error('Error in publishToPubsubChannel()')
      throw err
    }
  }

  // Send a message to a peer, and wait for an ACK message. Automatically
  // re-sends the message periodically until an ACK message is received, or
  // the attempts time out.
  async sendMsg (receiver, payload, thisNode) {
    try {
      // console.log(`sendMsg thisNode: `, thisNode)

      // Generate a message object
      const sender = thisNode.ipfsId
      const inMsgObj = {
        sender,
        receiver,
        payload
      }
      const msgObj = this.generateMsgObj(inMsgObj)

      // const msgId = msgObj.uuid

      // Send message
      await this.publishToPubsubChannel(receiver, msgObj)

      // Add the message to the retry queue
      this.addMsgToQueue(msgObj)

      return true
    } catch (err) {
      console.error('Error in messaging.js/sendMsg()')
      throw err
    }
  }

  // Publish an ACK (acknowldge) message. Does not wait for any reply. Just fires
  // and returns.
  async sendAck (data, thisNode) {
    try {
      const ackMsgObj = await this.generateAckMsg(data, thisNode)

      // Send Ack message
      await this.publishToPubsubChannel(data.sender, ackMsgObj)

      return true
    } catch (err) {
      console.error('Error in sendAck()')
      throw err
    }
  }

  // Similar to parsePubsubMessage(), but it handles incoming data intended
  // for this node.
  // The main difference between these two functions is that messages intended
  // for this node need to be responded to immediately with an ACK message.
  // Messages coming in on other pubsub channels do not necessarily need an
  // ACK response.
  async handleIncomingData (msg, thisNode) {
    try {
      // console.log('handleIncomingData() msg: ', msg)

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
      // implementiong it comes through as a string when using js-ipfs. But when
      // using ipfs-http-client with an external go-ipfs node, it comes thorugh
      // as a uint8Array too. Browsers need to
      // convert the message from a uint8array to a string.
      if (thisNode.type === 'browser' || this.nodeType === 'external') {
        // console.log('Node type is browser')
        msg.data = new TextDecoder('utf-8').decode(msg.data)
      }
      // console.log('msg.data: ', msg.data)

      // Parse the data into a JSON object. It starts as a Buffer that needs
      // to be converted to a string, then parsed to a JSON object.
      // For some reason I have to JSON parse it twice. Not sure why.
      const data = JSON.parse(msg.data.toString())
      // console.log("data: ", data)

      // Decrypt the payload
      const decryptedPayload = await this.encryption.decryptMsg(data.payload)
      console.log(`decrypted payload: ${decryptedPayload}`)

      if (decryptedPayload.includes('"apiName":"ACK"')) {
        console.log(`ACK message received for ${data.uuid}`)

        this.delMsgFromQueue(data)

        return false
      }

      // Send an ACK message
      await this.sendAck(data, thisNode)

      // Ignore message if its already been processed.
      const alreadyProcessed = this._checkIfAlreadyProcessed(data.uuid)
      if (alreadyProcessed) {
        console.log(`Message ${data.uuid} already processed`)
        return false
      }

      // Replace the encrypted data with the decrypted data.
      data.payload = decryptedPayload

      const retObj = { from, channel, data }
      console.log(
        `new pubsub message received: ${JSON.stringify(retObj, null, 2)}`
      )

      // Hand retObj to the callback.
      // handler(retObj)
      // console.log(
      //   'Handler would be called at this point in handleIncomingData()'
      // )

      return retObj
    } catch (err) {
      console.error('Error in handleIncomingData(): ', err)
      throw err
    }
  }

  // Checks the UUID to see if the message has already been processed. Returns
  // true if the UUID exists in the list of processed messages.
  _checkIfAlreadyProcessed (uuid) {
    // Check if the hash is in the array of already processed message.
    const alreadyProcessed = this.msgCache.includes(uuid)

    // Update the msgCache if this is a new message.
    if (!alreadyProcessed) {
      // Add the uuid to the array.
      this.msgCache.push(uuid)

      // If the array is at its max size, then remove the oldest element.
      if (this.msgCache.length > this.MSG_CACHE_SIZE) {
        this.msgCache.shift()
      }
    }

    return alreadyProcessed
  }

  // Stops the Interval Timer and deletes a message from the queue when an
  // ACK message is received.
  delMsgFromQueue (msgObj) {
    try {
      console.log(`delMsgFromQueue msgObj: ${JSON.stringify(msgObj, null, 2)}`)
      // console.log(`this.msgQueue: ${JSON.stringify(this.msgQueue, null, 2)}`)
      // console.log('this.msgQueue: ', this.msgQueue)

      // Loop through the message queue
      for (let i = 0; i < this.msgQueue.length; i++) {
        const thisMsg = this.msgQueue[i]

        // Find the matching entry.
        if (msgObj.uuid === thisMsg.uuid) {
          // console.log(`thisMsg: `, thisMsg)

          // Stop the Interval
          try {
            clearInterval(thisMsg.intervalHandle)
          // console.log('Interval stopped')
          } catch (err) { /* exit quietly */ }

          // Delete the entry from the msgQueue array.
          this.msgQueue.splice(i, 1)
          break
        }
      }
    } catch (err) {
      console.error('Error in delMsgFromQueue()')
      throw err
    }
  }

  // Adds a message object to the message queue. Starts an interval timer that
  // will repeat the message periodically until an ACK message is received.
  addMsgToQueue (msgObj) {
    try {
      // Start interval for repeating message
      const intervalHandle = setInterval(function () {
        _this.resendMsg(msgObj)
      }, TIME_BETWEEN_RETRIES)

      // Add interval handle to message object.
      msgObj.intervalHandle = intervalHandle
      msgObj.retryCnt = 1

      // Add message object to the queue.
      this.msgQueue.push(msgObj)
    } catch (err) {
      console.error('Error in addMsgToQueue')
      throw err
    }
  }

  // Called by an Interval Timer. This function re-publishes a message to a
  // pubsub channel.
  async resendMsg (msgObj) {
    try {
      console.log(`resendMsg() msgObj: ${JSON.stringify(msgObj, null, 2)}`)

      const { retryCnt, intervalHandle, receiver } = msgObj

      console.log('resendMsg() retryCnt: ', retryCnt)

      if (retryCnt < RETRY_LIMIT) {
        // Increment the retry
        msgObj.retryCnt++

        // Send message
        await _this.publishToPubsubChannel(receiver, msgObj)
      } else {
        // Retry count exceeded.

        // Disable the interval handler
        clearInterval(intervalHandle)
      }
    } catch (err) {
      console.error('Error in resendMsg(): ', err)
    // Do not throw an error. This is a top-level function called by an Interval.
    }
  }

  // Returns a promise that resolves to true when the ACK message is recieved.
  // If ACK message is never received, it throws a message.
  // Messages are automatically rebroadcast periodically, if an ACK message
  // is not received.

  // Manages the queue of messages:
  // - Removes a message from the queue once an ACK message is received.
  // - Sets up an interval
  async waitForAck (msgObj) {
    try {
      // Initialize variables for tracking the return data.
      // let dataFound = false
      // let cnt = 0
      // let data = {
      //   success: false,
      //   message: "request timed out",
      //   data: ""
      // }

      console.log(`waitForAck msgObj: ${JSON.stringify(msgObj, null, 2)}`)

    // Loop that waits for a response from the service provider.
    // do {
    //   for (let i = 0; i < this.msgQueue.length; i++) {
    //     const rawData = this.msgQueue[i]
    //     // console.log(`rawData: ${JSON.stringify(rawData, null, 2)}`)
    //
    //     if (rawData.id === rpcId) {
    //       dataFound = true
    //       // console.log('data was found in the queue')
    //
    //       data = rawData.result.value
    //
    //       // Remove the data from the queue
    //       this.rpcDataQueue.splice(i, 1)
    //
    //       break
    //     }
    //   }
    //
    //   // Wait between loops.
    //   // await this.sleep(1000)
    //   await this.ipfsCoordAdapter.bchjs.Util.sleep(2000)
    //
    //   cnt++
    //
    //   // Exit if data was returned, or the window for a response expires.
    // } while (!dataFound && cnt < 10)
    // // console.log(`dataFound: ${dataFound}, cnt: ${cnt}`)
    //
    // return data
    } catch (err) {
      console.error('Error in waitForRPCResponse()')
      throw err
    }
  }
}

module.exports = Messaging
