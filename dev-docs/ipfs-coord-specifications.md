# ipfs-coord Specifications

## Overview

ipfs-coord is a shortening of the word 'coordination'. It is a JavaScript npm library that helps applications using [js-ipfs](https://github.com/ipfs/js-ipfs) coordinate with other peers running related applications.

This document contains a high-level, human-readable specification for the four major architectural areas of the ipfs-coord library:

- Entities
- Use Cases
- Controllers (inputs)
- Adapters (outputs)

This reflects the [Clean Architecture](https://troutsblog.com/blog/clean-architecture) design pattern.

## Configuration

When instantiating the ipfs-coord library, the following configuration inputs can be passed to its constructor via an object with the indicated properties:

- `ipfs`: (required) An instance of [js-ipfs](https://www.npmjs.com/package/ipfs). IPFS must be instantiated outside of ipfs-coord and passed into it when instantiating the ipfs-coord library.
- `bchjs`: (required) An instance of [bch-js](https://www.npmjs.com/package/@psf/bch-js). bch-js must be instantiated outside of ipfs-coord and passed into it when instantiating the ipfs-coord library.
- `type`: (required) A string with the value of 'browser' or 'node.js', to indicate what type of app is instantiating the library. This will determine the types of Circuit Relays the library can connect to.
- `statusLog`: A function for handling status output strings on the status of ipfs-coord. This defaults to `console.log` if not specified.
- `privateLog`: A function for handling private messages passed to this node from peer nodes. This defaults to `console.log` if not specified.

## Entities

Entities make up the core business concepts. If these entities change, they fundamentally change the entire app.

### ipfsNode

The `ipfsNode` is the IPFS node consuming the ipfs-coord library.

### Peers

Peers are other IPFS nodes that the application wants to keep track of. These are peers that make up the subnet.

- `peerList` - An array of IPFS IDs (strings), identifying each peer this node knows about.
- `peerData` - An object with root properties that match the peer IPFS ID. Each root property represents a peer and contains the data about that peer.

### Pubsub Channels

[Pubsub Channels](https://blog.ipfs.io/29-js-ipfs-pubsub/) are the way that IPFS nodes form a subnet. The members of the subnet are all subscribed to the same pubsub channel.

### Relays

Some nodes using ipfs-coord can elect to become [Circuit Relays](https://docs.libp2p.io/concepts/circuit-relay/). Circuit Relays are critical for keeping the network censorship resistant. They allow nodes that otherwise would not be able to communicate with one another, do so. They assist in punching through network firewalls that would otherwise block communication. They allow the subnet to route around damage and dynamically adjust as nodes enter and leave the subnet.

ipfs-coord will start by connecting to a small set of pre-configured Relays. As it discovers new peers in the subnetwork that have their `isCircuitRelay` flag set, it will expand its connections to as many Relays as it can find.

- `relayList` - An array of IPFS IDs (strings), identifying each Relay this node knows about.
- `relayData` - An object with root properties that match the relay IPFS ID. Each root property represents a relay and contains the data about that relay.

### Services

Some nodes are 'service providers' while other nodes are 'service consumers'. These [Decentralized Service Providers (Video)](https://youtu.be/m_33rRXEats) can provide traditional 'back end' web services while leveraging the censorship resistance and automatic networking of this library. Apps consuming these services can use this library can track different service providers, to dynamically load the services it needs to function.

- `serviceList` - An array of IPFS IDs (strings), identifying each Service this node knows about.
- `serviceData` - An object with root properties that match the Services IPFS ID. Each root property represents a Service and contains the data about that Service.

Properties maintained for each Service:

- jwtFee - If the Service requires the purchase of a JWT token to access it, this is the cost of purchasing one. This is an array of objects, with each object describing different fee options. For example, there may be one fee for paying in BCH. There may be another for paying in SLP tokens.
- jwtDuration - The duration a JWT token lasts before expiring. A number representing hours.
- `protocol` - The service protocol that this Service offers.
- `version` - The protocol version that this Service offers.
- `description` - A brief description of the Service.
- `documentation` - An optional link to any API documentation needed to consume the Service.

## Use Cases

Use cases are verbs or actions that is done _to_ an Entity or _between_ Entities.

### ipfsNode

- Announce Self - Announces itself periodically on the general coordination pubsub channel.
- Announce Service - If the node is a Service Provider, this use-case announces the service on the appropriate service-specific coordination channel.
- Generate BCH ID - Generates a BCH key pair, used for payments and encryption.
- Generate Private Key - Generates the private key from the mnemonic. Used for decrypting messages.

### Peers

- Create - When a new peer announces itself in the general coordination pubsub channel, it should be added to the state and tracked.
- Update - Update an existing record with newly received data.
- Prune - Remove a peer if it has not been seen after a period of time.
- Connect - Refresh connections to the list of known peers.

### Pubsub Channels

- parseMessage() - Convert an incoming message into a JSON object.
- subscribeToChannel() - Subscribe to a pubsub channel.
- publishToChannel() - Publish a message to a pubsub channel.

### Relays

- Create - Add a new Relay to the list of known Relays.
- Update - Update a Relay entry with newly received data.
- Prune - Remove a Relay from the list of known Relays.
- Connect To Relays - Called periodically to renew connections to all known circuit relays.

### Services

- Create - Add a new Service to the list of known Services.
- Update - Update a Service entry with newly received data.
- Prune - Remove a Service from the list of known Services.

## Adapters

Adapters are the 'outputs' of this library. They are the interfaces that this library manipulates in order to maintain the state of the Entities. Adapters ensure that the business logic doesn't need to know any specific information about the outputs.

### bch-js

bch-js is the Bitcoin Cash (BCH) library used to handle payments and end-to-end encryption in peer communication. When the IPFS node is started, it generates a BCH address to receive payments in BCH, and an SLP address to recieve payments in SLP tokens. The same private key used to generate these addresses is used to decrypt incoming pubsub messages.

### IPFS

This library is designed primarily to control an IPFS node. However, it does not load IPFS directly. It expects the developer to inject an instance of js-ipfs when instantiating this library.

### OrbitDB

[OrbitDB](https://orbitdb.org/) is a database that runs on top of IPFS. It used in this library to prevent 'dropped calls'. As nodes are constantly adjusting their network connections, they can sometimes miss pubsub messages. Other peers in the subnet maintain short-lived logs of the encrypted messages the peers they are connected to. This allows them to pass the message on when the peer reconnects to them, preventing 'dropped calls'. These logs are abandoned after an hour and a new log is created, to prevent them from growing too large.

- Create Receiver Database - Create a new database for receiving private messages.
- Handle Replication Event - Receive and decrypt an incoming message, then route it to the appropriate message handler.
- `sendToDb()` - Send a string of text to another peers personal database.
- `connectToPeerDb()` - Connect to another peers personal OrbitDB.

### Encryption

The encryption adapter is responsible for encryption and decryption of pubsub messages. It uses the same Eliptic Curve cryptography used by the Bitcoin protocol. The same private key that is used to generate the BCH address assigned to the node is the same private key used to decrypt incoming messages.

- encrypt message
- decrypt message
- send message - send an encrypted message to a given peer

### Pubsub

The pubsub adapter can publish a message to a pubsub channel. There are (public) coordination channels that many peers subscribe to, and messages are published unencrypted. There are (private) channels between two peers, where content is encrypted before being broadcast.

### Schema

The schema library contain formatted JSON objects that are used to generate a standardized messages for communication between peers.

- `announcement()` - Generate an announcement message to broadcast to the general coordination channel.
- `chat()` - Generate a chat message.

## Controllers

Controllers are inputs to the system. When a controller is activated, it causes the system to react in some way.

### Pubsub

New messages arriving for a pubsub channel will trigger an event that will cause this library to process and route the message to the appropriate handler. A few classes of message:

- Announcement - Announcement messages from other peers will be routed to the Peer Entity. If its a new peer, it will be added to the list of known peers.

  - Services - A peer advertising specific services will be passed on to the Services Entity.
  - Relays - A peer advertising Circuit Relay capability will be passed on to the Relays Entity.

- Private Messages - Each peer has a pubsub channel that is the same name as its IPFS ID. Messages arriving on this channel are expected to be e2e encrypted with the peers public key. Any unencrypted messages are ignored.

### Timers

The controllers listed in this section are activated periodically by a timer. They do routine maintenance.

- Announce Self - This controller announces the presence of the IPFS node by publishing a message to the general coordination pubsub channel. If it's a service provider, it will also announce itself in the service-specific coordination channel.

- Update Peers - This controller reviews the data about each known peer, and prunes away any peers that have not announced themselves for a period of time. It attempts to renew connections to each peer in the list.

- Update Relays - This controller reviews the data about each known Circuit Relay. It attempts to renew the connection to each known Circuit Relay.

- Update Services - This controller reviews the data about each known Service Provider. It prunes any services that it has not been able to connect to over a period of time.
