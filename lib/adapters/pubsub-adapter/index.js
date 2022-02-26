/*
  Adapter library for working with pubsub channels and messages
*/

// Local libraries
const Messaging = require("./messaging");

class PubsubAdapter {
  constructor(localConfig = {}) {
    // Dependency Injection
    this.ipfs = localConfig.ipfs;
    if (!this.ipfs) {
      throw new Error(
        "Instance of IPFS adapter required when instantiating Pubsub Adapter."
      );
    }
    this.log = localConfig.log;
    if (!this.log) {
      throw new Error(
        "A status log handler function required when instantitating Pubsub Adapter"
      );
    }

    // Encapsulate dependencies
    this.messaging = new Messaging(localConfig);

    // 'embedded' node type used as default, will use embedded js-ipfs.
    // Alternative is 'external' which will use ipfs-http-client to control an
    // external IPFS node.
    this.nodeType = localConfig.nodeType;
    if (!this.nodeType) {
      // console.log('No node type specified. Assuming embedded js-ipfs.')
      this.nodeType = "embedded";
    }
    console.log(`PubsubAdapter contructor node type: ${this.nodeType}`);
  }

  // Subscribe to a pubsub channel. Any data received on that channel is passed
  // to the handler.
  async subscribeToPubsubChannel(chanName, handler, thisNode) {
    try {
      // console.log('thisNode: ', thisNode)
      const thisNodeId = thisNode.ipfsId;

      // Normal use-case, where the pubsub channel is NOT the receiving channel
      // for this node.
      if (chanName !== thisNodeId) {
        // console.log('this.ipfs: ', this.ipfs)
        await this.ipfs.ipfs.pubsub.subscribe(chanName, async msg => {
          await this.parsePubsubMessage(msg, handler, thisNode);
        });

        //
      } else {
        // Subscribing to our own pubsub channel

        await this.ipfs.ipfs.pubsub.subscribe(chanName, async msg => {
          await this.handleIncomingData(msg, handler, thisNode);
        });
      }

      this.log.statusLog(
        0,
        `status: Subscribed to pubsub channel: ${chanName}`
      );
    } catch (err) {
      console.error("Error in subscribeToPubsubChannel()");
      throw err;
    }
  }

  // Similar to parsePubsubMessage(), but it handles incoming data intended
  // for this node.
  // The main difference between these two functions is that messages intended
  // for this node need to be responded to immediately with an ACK message.
  // Messages coming in on other pubsub channels do not necessarily need an
  // ACK response.
  async handleIncomingData(msg, handler, thisNode) {
    try {
      console.log("handleIncomingData() msg: ", msg);

      const thisNodeId = thisNode.ipfsId;

      // Get data about the message.
      const from = msg.from;
      const channel = msg.topicIDs[0];

      // Used for debugging.
      this.log.statusLog(
        2,
        `New pubsub message recieved from ${from} on channel ${channel}`
      );

      // Ignore this message if it originated from this IPFS node.
      if (from === thisNodeId) return;

      // The data on browsers comes through as a uint8array, and on node.js
      // implementiong it comes through as a string when using js-ipfs. But when
      // using ipfs-http-client with an external go-ipfs node, it comes thorugh
      // as a uint8Array too. Browsers need to
      // convert the message from a uint8array to a string.
      if (thisNode.type === "browser" || this.nodeType === "external") {
        // console.log('Node type is browser')
        msg.data = new TextDecoder("utf-8").decode(msg.data);
      }
      console.log("msg.data: ", msg.data);

      // Parse the data into a JSON object. It starts as a Buffer that needs
      // to be converted to a string, then parsed to a JSON object.
      // For some reason I have to JSON parse it twice. Not sure why.
      const data = JSON.parse(JSON.parse(msg.data.toString()));
      console.log("data: ", data);

      const retObj = { from, channel, data };
      // console.log(`new pubsub message received: ${JSON.stringify(retObj, null, 2)}`)

      // TODO: Send an ACK message

      // Hand retObj to the callback.
      handler(retObj);
    } catch (err) {
      console.error("Error in handleIncomingData(): ", err);
      throw err;
    }
  }

  // Attempts to parse data coming in from a pubsub channel. It is assumed that
  // the data is a string in JSON format. If it isn't, parsing will throw an
  // error and the message will be ignored.
  async parsePubsubMessage(msg, handler, thisNode) {
    try {
      // console.log('message data: ', msg.data)
      // console.log('parsePubsubMessage msg: ', msg)

      const thisNodeId = thisNode.ipfsId;

      // Get data about the message.
      const from = msg.from;
      const channel = msg.topicIDs[0];

      // Used for debugging.
      this.log.statusLog(
        2,
        `New pubsub message recieved from ${from} on channel ${channel}`
      );

      // Ignore this message if it originated from this IPFS node.
      if (from === thisNodeId) return;

      // The data on browsers comes through as a uint8array, and on node.js
      // implementiong it comes through as a string. Browsers need to
      // convert the message from a uint8array to a string.
      if (thisNode.type === "browser" || this.nodeType === "external") {
        // console.log('Node type is browser')
        msg.data = new TextDecoder("utf-8").decode(msg.data);
      }

      // Parse the data into a JSON object. It starts as a Buffer that needs
      // to be converted to a string, then parsed to a JSON object.
      // For some reason I have to JSON parse it twice. Not sure why.
      const data = JSON.parse(JSON.parse(msg.data.toString()));
      // console.log('data: ', data)

      const retObj = { from, channel, data };
      // console.log(`new pubsub message received: ${JSON.stringify(retObj, null, 2)}`)

      // TODO: Send an ACK message

      // Hand retObj to the callback.
      handler(retObj);

      // START ROUTER
      // if (retObj.data.apiName === 'chat') {
      //   console.log(`${from}: ${retObj.data.data.message}`)
      // }
      // if (retObj.data.apiName === 'ipfs-coord') {
      //   this.peers.addPeer(retObj)
      // }
      // END ROUTER
    } catch (err) {
      console.error("Error in parsePubsubMessage(): ", err.message);
      // Do not throw an error. This is a top-level function.

      // console.log('msg that caused error: ', msg)
    }
  }

  // Converts an input string to a Buffer and then broadcasts it to the given
  // pubsub room.
  async publishToPubsubChannel(chanName, msgStr) {
    try {
      const msgBuf = Buffer.from(JSON.stringify(msgStr));

      // Publish the message to the pubsub channel.
      await this.ipfs.ipfs.pubsub.publish(chanName, msgBuf);

      // Used for debugging.
      this.log.statusLog(
        2,
        `New message published to pubsub channel ${chanName}`
      );
    } catch (err) {
      console.error("Error in publishToPubsubChannel()");
      throw err;
    }
  }
}

module.exports = PubsubAdapter;
