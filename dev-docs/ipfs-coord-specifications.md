# ipfs-coord Specifications

## Overview

ipfs-coord is a shortening of the word 'coordination'. It is a JavaScript npm library that helps applications using [js-ipfs](https://github.com/ipfs/js-ipfs) coordinate with other peers running related applications.

This document contains a high-level, human-readable specification for the four major architectural areas of the ipfs-coord library:

- Entities
- Use Cases
- Controllers (inputs)
- Adapters (outputs)

This reflects the [Clean Architecture](https://troutsblog.com/blog/clean-architecture) design pattern.

After the ipfs-coord library is instantiated, it will have properties `useCases`, `controllers`, and `adapters` that have methods corresponding to the descriptions in this document. Apps can exercise the features of the ipfs-coord library through this object-oriented structure.

## Configuration

When instantiating the ipfs-coord library, the following configuration inputs can be passed to its constructor via an object with the properties indicated below. Be sure to check out the [examples directory](../examples) for examples on how to instantiate the library with different configurations.

- `ipfs`: (required) An instance of [js-ipfs](https://www.npmjs.com/package/ipfs). IPFS must be instantiated outside of ipfs-coord and passed into it when instantiating the ipfs-coord library.
- `bchjs`: (required) An instance of [bch-js](https://www.npmjs.com/package/@psf/bch-js). bch-js must be instantiated outside of ipfs-coord and passed into it when instantiating the ipfs-coord library.
- `type`: (required) A string with the value of 'browser' or 'node.js', to indicate what type of app is instantiating the library. This will determine the types of Circuit Relays the library can connect to.
- `statusLog`: A function for handling status output strings on the status of ipfs-coord. This defaults to `console.log` if not specified.
- `privateLog`: A function for handling private messages passed to this node from peer nodes. This defaults to `console.log` if not specified.

## Entities

Entities make up the core business concepts. If these entities change, they fundamentally change the entire app.

### thisNode

`thisNode` is the IPFS node consuming the ipfs-coord library. The thisNode Entity creates a representation the 'self' and maintains the state of the IPFS node, BCH wallet, peers, relays, and pubsub channels that the node is tracking.

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

- `refreshPeerConnections()` - is periodically called by the Timer Controller. It checks to see if thisNode is still connected to all the subnet peers. It will refresh the connection if they have been disconnected. Circuit Relays are used to connect to other subnet peers, and each known circuit relay will be cycled through until a connection can be established between thisNode and the subnet peer.

### Relays

The `relay-use-cases.js` library controls the interactions between thisNode and the Circuit Relays that it knows about.

- `initializeRelays()` - The ipfs-coord library comes with a pre-programmed list of Circuit Relay nodes. This list is stored in `config/bootstrap-circuit-relays.js`. The `initializeRelays()` method is called once at startup to connect to these relays. This is what 'bootstraps' thisNode to the IPFS sub-network and allows it to find subnetwork peers. After that initial bootstrap connection, thisNode will automatically learn about and connect to other peers and circuit relays.

- `connectToCRs()` - This method is called periodically by the Timer Controller. It checks the connection between thisNode and each Circuit Relay node. If thisNode has lost its connection, the connection is restored.

### Pubsub

The `pubsub-use-cases.js` has a single method:

- `initializePubsub()` is called at startup to connect the node to the general coordination pubsub channel. This is the channel where other apps running the ipfs-coord library announce themselves to other peers in the subnet.

## Controllers

Controllers are inputs to the system. When a controller is activated, it causes the system to react in some way.

### Timers

The controllers listed in this section are activated periodically by a timer. They do routine maintenance.

- `startTimers()` is called at startup. It initializes the other timer controllers.

- `manageCircuitRelays()` calls the `connectToCRs()` Use Case to refresh connections to other circuit relays.

- `manageAnnouncement()` periodically announces the presence of thisNode Entity on the general coordination pubsub channel. It allows other subnet peers to find the node.

- `managePeers()` checks the list of known subnet peers tracked by thisNode Entity. It will restore the connection to each peer if they get disconnected.

## Adapters

Adapters are the 'outputs' of the system. They are the interfaces that this library manipulates in order to maintain the state of the Entities. Adapters ensure that the business logic doesn't need to know any specific information about the outputs.

### bch-adapter.js

[bch-js](https://github.com/Permissionless-Software-Foundation/bch-js) is the Bitcoin Cash (BCH) library used to handle payments and end-to-end encryption in peer communication. When the IPFS node is started, it generates a BCH address to receive payments in BCH, and an SLP address to receive payments in SLP tokens. The same private key used to generate these addresses is used to decrypt incoming pubsub messages, and the public key is passed on to other peers so that they can encrypt messages they want to send thisNode.

### ipfs-adapter.js

This library is designed primarily to control an IPFS node. However, it does not load IPFS directly. It expects the developer to inject an instance of js-ipfs when instantiating this library.

### orbitdb-adapter.js

[OrbitDB](https://orbitdb.org/) is a database that runs on top of IPFS. It's used in this library to prevent 'dropped calls'. As nodes are constantly adjusting their network connections, they can sometimes miss pubsub messages. Other peers in the subnet maintain short-lived logs of the encrypted messages directed at the peers they are connected to. This allows them to pass the message on when the peer reconnects to them, preventing 'dropped calls'. These logs are abandoned after an hour and a new log is created, to prevent them from growing too large.

### encryption-adapter.js

The encryption adapter is responsible for encryption and decryption of pubsub messages. It uses the same Eliptic Curve cryptography used by the Bitcoin protocol. The same private key that is used to generate the BCH address assigned to thisNode is the same private key used to decrypt incoming messages.

Other subnet peers that thisNode tracks will pass on their public key. All messages sent between nodes is encrypted with the receivers public key. Any unencrypted messages are ignored.

### pubsub-adapter.js

The pubsub adapter can publish a message to a pubsub channel, and route incoming messages to an appropriate handler. There are (public) coordination channels that many peers subscribe to, and messages are published unencrypted.

Private messages between peers are _not_ controlled by this library. Those messages are published to OrbitDB and use pubsub messages indirectly, rather than being directly published to a pubsub channel by this library.

### schema.js

The schema library contain formatted JSON objects that are used to generate a standardized messages for communication between peers. The schema.js library is instantiated at startup and appended to the thisNode Entity.
