/*
  'thisNode' is an object that is passed around to a lot of functions. The object
  represents an instance of the IPFS node. This file creates a mock of thisNode
  that can be used for unit tests.
*/

const thisNode = {
  ipfsId: '12D3KooWE6tkdArVpCHG9QN61G1cE7eCq2Q7i4bNx6CJFTDprk9f',
  ipfsMultiaddrs: [
    '/ip4/127.0.0.1/tcp/4001/p2p/12D3KooWE6tkdArVpCHG9QN61G1cE7eCq2Q7i4bNx6CJFTDprk9f',
    '/ip6/::1/tcp/4001/p2p/12D3KooWE6tkdArVpCHG9QN61G1cE7eCq2Q7i4bNx6CJFTDprk9f'
  ],
  bchAddr: 'bitcoincash:qpjecejl9n90u9vv7cg7p9qfjk4zjwqus5hff6sfpm',
  slpAddr: 'simpleledger:qpjecejl9n90u9vv7cg7p9qfjk4zjwqus5mjzp9fl9',
  publicKey: '0232ef60e2c545d49d18c95fa7379164693ff6d201221aefea6bee872e4c03be12',
  type: 'node.js',
  peerList: ['12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa'],
  peerData: [
    {
      from: '12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa',
      channel: 'psf-ipfs-coordination-002',
      data: {
        encryptPubKey: '0232ef60e2c545d49d18c95fa7379164693ff6d201221aefea6bee872e4c03be12'
      }
    }
  ],
  relayData: [
    {
      multiaddr: '/ip4/5.161.43.61/tcp/5268/p2p/QmWPfWgbSjPPFpvmS2QH7NPx14DqxMV8eGAUHLcYfyo1St',
      connected: false,
      updatedAt: '2022-03-03T22:01:05.715Z',
      ipfsId: 'QmWPfWgbSjPPFpvmS2QH7NPx14DqxMV8eGAUHLcYfyo1St',
      isBootstrap: false,
      metrics: {},
      latencyScore: 10000
    },
    {
      multiaddr: '/ip4/88.99.188.196/tcp/5268/p2p/QmXbyd4tWzwhGyyZJ9QJctfJJLq7oAJRs39aqpRXUAbu5j',
      connected: false,
      updatedAt: '2022-03-03T22:01:06.110Z',
      ipfsId: 'QmXbyd4tWzwhGyyZJ9QJctfJJLq7oAJRs39aqpRXUAbu5j',
      isBootstrap: false,
      metrics: {},
      latencyScore: 10000
    }
  ],
  serviceList: [],
  serviceData: [],
  blacklistPeers: [
    'QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
    'Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
    'QmV7gnbW5VTcJ3oyM2Xk1rdFBJ3kTkvxc87UFGsun29STS',
    'QmY7JB6MQXhxHvq7dBDh4HpbH29v4yE9JRadAVpndvzySN',
    'QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
    'QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
    'QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
    'QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
    'QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
    'QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
  ],
  blacklistMultiaddrs: [
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
  ],
  schema: {},
  useCases: {}
}

module.exports = thisNode
