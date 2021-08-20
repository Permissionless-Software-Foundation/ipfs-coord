This markdown is for holding temporary piece of text for editing.

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
