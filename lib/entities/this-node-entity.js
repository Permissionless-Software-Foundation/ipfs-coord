/*
  This is an Entity library for creating a representation the 'self' or
  the current IPFS node with the adding information of a BCH wallet and
  any future features added to ipfs-coord.

  There is only one instance of this class library, as there is only one
  IPFS node that is the 'self'.
*/

class ThisNodeEntity {
  // The constructor checks the input data and throws an error if any of the
  // required data is missing.
  constructor (localConfig = {}) {
    this.ipfsId = localConfig.ipfsId
    if (!this.ipfsId) {
      throw new Error('ipfsId required when instantiating thisNode Entity')
    }

    this.ipfsMultiaddrs = localConfig.ipfsMultiaddrs
    if (!this.ipfsMultiaddrs) {
      throw new Error(
        'ipfsMultiaddrs required when instantiating thisNode Entity'
      )
    }

    this.bchAddr = localConfig.bchAddr
    if (!this.bchAddr) {
      throw new Error('bchAddr required when instantiating thisNode Entity')
    }

    this.slpAddr = localConfig.slpAddr
    if (!this.slpAddr) {
      throw new Error('slpAddr required when instantiating thisNode Entity')
    }

    this.publicKey = localConfig.publicKey
    if (!this.publicKey) {
      throw new Error('publicKey required when instantiating thisNode Entity')
    }

    this.type = localConfig.type
    if (!this.type) {
      throw new Error(
        "Node type of 'node.js' or 'browser' required when instantiating thisNode Entity"
      )
    }

    this.schema = localConfig.schema

    // This Node will keep track of peers, relays, and services.
    // The 'List' array tracks the IPFS ID for that peer.
    // The 'Data' array holds instances of the other Entities.
    this.peerList = []
    this.peerData = []
    this.relayData = []
    this.serviceList = []
    this.serviceData = []

    // Create a blacklist of nodes that can burden other nodes with excessive bandwidth.
    this.blacklistPeers = [
      // '/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
      'QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
      // '/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
      'Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
      // '/dns4/node2.preload.ipfs.io/tcp/443/wss/p2p/QmV7gnbW5VTcJ3oyM2Xk1rdFBJ3kTkvxc87UFGsun29STS',
      'QmV7gnbW5VTcJ3oyM2Xk1rdFBJ3kTkvxc87UFGsun29STS',
      // '/dns4/node3.preload.ipfs.io/tcp/443/wss/p2p/QmY7JB6MQXhxHvq7dBDh4HpbH29v4yE9JRadAVpndvzySN'
      'QmY7JB6MQXhxHvq7dBDh4HpbH29v4yE9JRadAVpndvzySN',
      // '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
      'QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
      // '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
      'QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
      // '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
      'QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
      // '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
      'QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
      // '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
      'QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
      // '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
      'QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
    ]
    this.blacklistMultiaddrs = [
      '/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
      '/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
      '/dns4/node2.preload.ipfs.io/tcp/443/wss/p2p/QmV7gnbW5VTcJ3oyM2Xk1rdFBJ3kTkvxc87UFGsun29STS',
      '/dns4/node3.preload.ipfs.io/tcp/443/wss/p2p/QmY7JB6MQXhxHvq7dBDh4HpbH29v4yE9JRadAVpndvzySN',
      '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
      '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
      '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
      '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
      '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
      '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
      '/dns4/node0.delegate.ipfs.io/tcp/443/https',
      '/dns4/node1.delegate.ipfs.io/tcp/443/https',
      '/dns4/node2.delegate.ipfs.io/tcp/443/https',
      '/dns4/node3.delegate.ipfs.io/tcp/443/https'
    ]
  }
}

module.exports = ThisNodeEntity
