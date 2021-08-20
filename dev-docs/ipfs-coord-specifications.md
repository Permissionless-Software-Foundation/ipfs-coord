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

### thisNode

`thisNode` is the IPFS node consuming the ipfs-coord library. The Entity creates a representation the 'self' and maintains the state of the IPFS node, BCH wallet, peers, relays, and pubsub channels that the node is tracking.

## Use Cases

Use cases are verbs or actions that is done _to_ an Entity or _between_ Entities.

### thisNode

The `this-node-use-cases.js` library contains the following Use Cases:

- `createSelf()` - initializes the `thisNode` Entity. It takes the following actions:

  - It retrieves basic information about the IPFS node like the ID and multiaddresses.
  - It creates a BCH wallet and generates addresses for payments and a public key used for end-to-end encryption (e2ee).
  - It creates an OrbitDB used to receive private e2ee messages.
  - It initializes the Schema library for passing standardized messages.

- `addSubnetPeer()` - This is an event handler that is triggered when an 'announcement object' is recieved on the general coordination pubsub channel. That object is passed to `addSubnetPeer()` to be processed. It will analyze the announcement object and add the peer to the array of peers tracked by the thisNode Entity. If the peer is already known, its data will be updated.

- `refreshPeerConnections()` - is periodically called by the Timer Controller. It checks to see if thisNode is still connected to the all the subnet peers. It will refresh the connection if not. Circuit Relays are used to connect to other subnet peers, and each known circuit relay will be cycled through until a connection can be established between thisNode and the subnet peer.

* Announce Self - Announces itself periodically on the general coordination pubsub channel.
* Announce Service - If the node is a Service Provider, this use-case announces the service on the appropriate service-specific coordination channel.
* Generate BCH ID - Generates a BCH key pair, used for payments and encryption.
* Generate Private Key - Generates the private key from the mnemonic. Used for decrypting messages.

### Relays

The `relay-use-cases.js` library controlls the interactions between thisNode and the Circuit Relays that it knows about.

- `initializeRelays()` - The ipfs-coord library comes with a pre-programmed list of Circuit Relay nodes. This list is stored in `config/bootstrap-circuit-relays.jd`. The `initializeRelays()` method is called once at startup to connect to these relays. This is what 'bootstraps' thisNode to the IPFS network and allows it to find subnetwork peers. After that initial bootstrap connection, thisNode will learn about and connect to other peers and circuit relays.

- `connectToCRs()` - This method is called periodically by the Timer Controller. It checks the connection between thisNode and each Circuit Relay node. If thisNode has lost its connection, the connection is restored.

### Peers

- Create - When a new peer announces itself in the general coordination pubsub channel, it should be added to the state and tracked.
- Update - Update an existing record with newly received data.
- Prune - Remove a peer if it has not been seen after a period of time.
- Connect - Refresh connections to the list of known peers.

### Pubsub Channels

- parseMessage() - Convert an incoming message into a JSON object.
- subscribeToChannel() - Subscribe to a pubsub channel.
- publishToChannel() - Publish a message to a pubsub channel.

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
