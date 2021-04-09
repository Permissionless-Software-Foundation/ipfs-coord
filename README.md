# ipfs-coord

This is a JavaScript npm library built on top of [js-ipfs](https://github.com/ipfs/js-ipfs).
This library will help IPFS peers discover a common interest, coordinate around that interest, and then stay connected around that interest. It's main subcomponents are:
- IPFS pubsub channels for communication
- OrbitDB for persistance and prevent 'dropped messages'
- Circuit Relays for censorship resistance
- Bitcoin Cash for end-to-end encryption and payments.

This library will automatically track peers, connect to them through circuit-relays, and end-to-end encrypt all communication with each node.

Here are some use cases where IPFS node coordination is needed:
- e2e encrypted chat
- Circuit-relay as-a-service
- Creating CoinJoin transactions
- Decentralized exchange of currencies
- Compute-as-a-service
- Storage-as-a-service

The ultimate goal for this library to be a building block for building a replacement to the conventional REST API. APIs like REST or gRPC are incredibly valuable, but suffer from the same censorship risks as the rest of the web. An IPFS-based API, in a fully distributed network like IPFS, must have sophisticated coordination in order for it to function properly. This is that coordination library.

Here is some videos and blog posts that preceded this work:
- [Building Uncensorable REST APIs](https://youtu.be/VVc0VbOD4co)
- [IPFS API](https://troutsblog.com/blog/ipfs-api)
- [Introducing chat.fullstack.cash](https://troutsblog.com/blog/chat-fullstack-cash)
- [UncensorablePublishing.com](https://uncensorablepublishing.com)
- [PS004 Collaborative CoinJoin](https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps004-collaborative-coinjoin.md)

A live demo of using this library to build an e2e encrypted chat app can be interacted with here:
- [chat.fullstack.cash](https://chat.fullstack.cash)


## Install
Install the npm library:
`npm install --save ipfs-coord`

Setup a development environment:
```
git clone https://github.com/christroutner/ipfs-coord
cd ipfs-coord
npm install
npm test
```

# Licence
[MIT](LICENSE.md)
