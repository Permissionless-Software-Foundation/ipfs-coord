# Pubsub Adapter

The [index.js](./index.js) file contains the primary PubSub adapter, which controls the pubsub channel connections between peers. [messaging.js](./messaging.js) controls the message handling for communicating over pubsub channels.

Because IPFS nodes are constantly changing their network connections, it's frequently observed that pubsub messages between peers get 'lost'. Version 6 and older used [orbit-db](https://www.npmjs.com/package/orbit-db) to prevent these lost messages. However, it turned out to not be a very scalable solution. Orbit-db is way too CPU heavy to work as a speedy form of inter-node communication.

Version 7 introduced the [messaging.js](./messaging.js) library. The primary problem this library solves is the 'lost message' issue. The IPFS pubsub channels handle the bulk of the low-level messaging.

## Messaging Protocol

To handle 'lost messages', two peers engage in a message-acknowledge scheme:

Happy Path:

- Node 1 publishes a message to the pubsub channel for Node 2.
- Node 2 publishes an ACK (acknowledge) message to the pubsub channel for Node 1.
- If both messages are received, the transaction is complete.

Each message is wrapped in a data object with the following properties:

- timestamp
- UUID
- sender (IPFS ID)
- receiver (IPFS ID)
- payload

If Node 1 does not receive an ACK message after 5 seconds, it will publish the message to the pubsub channel again. It will do this every 5 seconds, until either an ACK message is received or a retry threshold is met (3 tries).

Node 2 will attempt to send an ACK message any time it receives a message.

It's important to note that two pubsub channels are used. Node 1 sends data on Node 2's pubsub channel. Node 2 responds by publishing data on Node 1's pubsub channel.

## Libraries

To understand the relationships between the messaing (messaging.js) and pubsub (index.js) libraries, and comparison to the [OSI model](https://www.imperva.com/learn/application-security/osi-model/) can be made. In the OSI model, from top to bottom, there is:

- A presentation layer (6).
- A session layer (5)
- A transport layer (4)

Analogously:
- The pubsub library ([index.js](./index.js)) is like the presentation layer (6).
- The messaging library ([messaging.js](./messaging.js)) is like the session layer (5).
- The IPFS pubsub API is like the transport layer (4).

The point is that there are two different communication protocols happening at the same time:
- The underlying messaging protocol described here *does not* care about the content of the messages. It's just trying to ensure messages are passes reliably.
- The message handling in the pubsub library *does* care about the content of the messages.


## Example

Here is an example of an RPC command wrapped inside of a message envelope. The payload contains the encrypted RPC command. Notice the message itself has a UUID (universally unique identifier).

```javascript
{
  "timestamp": "2022-03-03T18:03:01.217Z",
  "uuid": "e0f08e3f-6e23-43ea-8fa9-39b828fd4fdc",
  "sender": "12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa",
  "receiver": "12D3KooWE6tkdArVpCHG9QN61G1cE7eCq2Q7i4bNx6CJFTDprk9f",
  "payload": "0453769b22a27adbb288bb2a05c19605a1fb033d4aeca92dfbf59f5c61732f89e6668a9a645dea3fe82e1bda20b8b11e713586b2c39d33f00dcf8fddac401263c320f06136a494e965f34193c3c6bb670a146c2ec06cdb5fd564b11a25c8715d574b8e1fd57f90e697c1edf21eb27ec0c431ce83293a4611e9593a53490c220019867208a1e241f23851c91646521b2e47"
}
```

Once the payload is decrypted and parsed, it looks like this. Notice that the RPC command has it's own UUID.

```javascript
{
  jsonrpc: '2.0',
  id: 'bb788af4-b7d1-4650-a7ae-bfd03b7f5140',
  method: 'bch',
  params: {
    endpoint: 'utxos',
    address: 'bitcoincash:qr2u4f2dmva6yvf3npkd5lquryp09qk7gs5vxl423h'
  }
}
```

### Workflow

Using the above RPC command as an example, here is the messaging workflow between Node 1 and Node 2:

- Node 1 sends the RPC command to Node 2
- Node 2 immediately responds with an ACK message
- Node 2 processes the RPC command and sends the response to Node 1
- Node 1 immediately reponds with an ACK message
