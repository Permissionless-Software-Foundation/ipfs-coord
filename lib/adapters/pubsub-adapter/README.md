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
