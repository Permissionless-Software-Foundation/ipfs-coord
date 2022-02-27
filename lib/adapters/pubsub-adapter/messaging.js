/*
  A library for broadcasting messages over pubsub and managing 'lost messages'.
*/

// Global npm libraries
const { v4: uid } = require('uuid')

// Local libraries

// Constants
// const TIME_BETWEEN_RETRIES = 5000; // time in milliseconds
// const RETRY_LIMIT = 3;

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

    // Encapsulate dependencies
    this.uid = uid

    // State
    this.msgQueue = []
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
  async generateAckMsg (receiver, thisNode) {
    try {
      const ackMsg = {
        apiName: 'ACK'
      }

      // Encrypt the string with the peers public key.
      const payload = await this.encryption.encryptMsg(
        receiver,
        JSON.stringify(ackMsg)
      )

      const sender = thisNode.ipfsId

      const inMsgObj = {
        sender,
        receiver,
        payload
      }

      const outMsgObj = this.generateMsgObj(inMsgObj)

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
        `New message published to pubsub channel ${chanName}`
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
      console.log('sendMsg thisNode: ', thisNode)

      // Generate a message object
      const sender = thisNode.ipfsId
      const inMsgObj = {
        sender,
        receiver,
        payload
      }
      const msgObj = this.generateMsgObj(inMsgObj)

      const msgId = msgObj.uuid

      // Send message
      await this.publishToPubsubChannel(receiver, msgObj)

      // Enter retry loop with auto-retry.
      // Will throw an error if ACK is never received.
      await this.waitForAck(msgId)

      return true
    } catch (err) {
      console.error('Error in messaging.js/sendMsg()')
      throw err
    }
  }

  // Publish an ACK (acknowldge) message. Does not wait for any reply. Just fires
  // and returns.
  async sendAck (receiver, thisNode) {
    try {
      const ackMsgObj = await this.generateAckMsg(receiver, thisNode)

      // Send Ack message
      await this.publishToPubsubChannel(receiver, ackMsgObj)

      return true
    } catch (err) {
      console.error('Error in sendAck()')
      throw err
    }
  }

  // Returns a promise that resolves to true when the ACK message is recieved.
  // If ACK message is never received, it throws a message.
  // Messages are automatically rebroadcast periodically, if an ACK message
  // is not received.
  async waitForAck (msgId) {
    try {
      // Initialize variables for tracking the return data.
      // let dataFound = false;
      // let cnt = 0;
      // let data = {
      //   success: false,
      //   message: "request timed out",
      //   data: ""
      // };

      console.log(`waitForAck msgId: ${msgId}`)

      // Loop that waits for a response from the service provider.
      // do {
      //   for (let i = 0; i < this.msgQueue.length; i++) {
      //     const rawData = this.msgQueue[i];
      //     // console.log(`rawData: ${JSON.stringify(rawData, null, 2)}`)
      //
      //     if (rawData.id === rpcId) {
      //       dataFound = true;
      //       // console.log('data was found in the queue')
      //
      //       data = rawData.result.value;
      //
      //       // Remove the data from the queue
      //       this.rpcDataQueue.splice(i, 1);
      //
      //       break;
      //     }
      //   }
      //
      //   // Wait between loops.
      //   // await this.sleep(1000)
      //   await this.ipfsCoordAdapter.bchjs.Util.sleep(2000);
      //
      //   cnt++;
      //
      //   // Exit if data was returned, or the window for a response expires.
      // } while (!dataFound && cnt < 10);
      // // console.log(`dataFound: ${dataFound}, cnt: ${cnt}`)
      //
      // return data;
    } catch (err) {
      console.error('Error in waitForRPCResponse()')
      throw err
    }
  }
}

module.exports = Messaging
