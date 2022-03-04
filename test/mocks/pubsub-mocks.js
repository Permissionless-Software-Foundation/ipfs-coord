const mockData = `${'{"apiName":"ipfs-coord","apiVersion":"1.3.0","apiInfo":"ipfs-hash-to-documentation-to-go-here","ipfsId":"QmRrUu64cAnPntYiUc7xMunLKZgj1XZT5HmqJNtDMqQcD7","type":"node.js","ipfsMultiaddrs":["/ip4/10.0.0.3/tcp/4002/p2p/QmRrUu64cAnPntYiUc7xMunLKZgj1XZT5HmqJNtDMqQcD7","/ip4/127.0.0.1/tcp/4002/p2p/QmRrUu64cAnPntYiUc7xMunLKZgj1XZT5HmqJNtDMqQcD7","/ip4/127.0.0.1/tcp/4003/ws/p2p/QmRrUu64cAnPntYiUc7xMunLKZgj1XZT5HmqJNtDMqQcD7","/ip4/157.90.20.129/tcp/4002/p2p/QmRrUu64cAnPntYiUc7xMunLKZgj1XZT5HmqJNtDMqQcD7"],"circuitRelays":[],"cryptoAddresses":[],"encryptPubKey":""}'}`

const mockMsg = {
  from: 'QmRrUu64cAnPntYiUc7xMunLKZgj1XZT5HmqJNtDMqQcD7',
  data: Buffer.from(JSON.stringify(mockData)),
  seqno: Buffer.from('test'),
  topicIDs: ['psf-ipfs-coordination-001'],
  signature: Buffer.from('test'),
  key: Buffer.from('test'),
  receivedFrom: 'QmRrUu64cAnPntYiUc7xMunLKZgj1XZT5HmqJNtDMqQcD7'
}

const aboutRequest = '{"jsonrpc":"2.0","id":"metrics3796","method":"about"}'

const aboutResponse = '{"jsonrpc": "2.0", "id": "metrics3796", "result": {"method": "about", "receiver": "12D3KooWE6tkdArVpCHG9QN61G1cE7eCq2Q7i4bNx6CJFTDprk9f", "value": {"ipfsId":"12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa","name":"12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa","type":"node.js","ipfsMultiaddrs":["/ip4/127.0.0.1/tcp/4001/p2p/12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa","/ip4/5.161.46.163/tcp/4001/p2p/12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa","/ip6/2a01:4ff:f0:f76::1/tcp/4001/p2p/12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa","/ip6/::1/tcp/4001/p2p/12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa"],"isCircuitRelay":true,"circuitRelayInfo":{"ip4":"5.161.46.163","tcpPort":"4001","crDomain":""},"cashAddress":"bitcoincash:qzerrnr5nfdkr3h62cxf0adn4jykjk53zudz4py26e","slpAddress":"simpleledger:qzerrnr5nfdkr3h62cxf0adn4jykjk53zupe7632y8","publicKey":"02e719acbfd3060fa75503ec7af528f5ba67da8a2b9b8e89dbf9b60676740868a0","orbitdbId":"","apiInfo":"You should put an IPFS hash or web URL here to your documentation.","announceJsonLd":{"@context":"https://schema.org/","@type":"WebAPI","name":"ipfs-bch-service-generic","version":"2.0.0","protocol":"bch-wallet","description":"IPFS service providing BCH blockchain access needed by a wallet.","documentation":"https://ipfs-bch-wallet-service.fullstack.cash/","provider":{"@type":"Organization","name":"Permissionless Software Foundation","url":"https://PSFoundation.cash"},"identifier":"12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa"}}}}'

const badId = '{"jsonrpc":"2.0","id":"bad-id","method":"about"}'

const msgObj = {
  from: '12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa',
  channel: '12D3KooWE6tkdArVpCHG9QN61G1cE7eCq2Q7i4bNx6CJFTDprk9f',
  data: {
    timestamp: '2022-03-04T18:19:18.897Z',
    uuid: '311e15f5-e647-488f-8ff5-8a41b254e7c3',
    sender: '12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa',
    receiver: '12D3KooWE6tkdArVpCHG9QN61G1cE7eCq2Q7i4bNx6CJFTDprk9f',
    payload: '{"jsonrpc": "2.0", "id": "metrics3796", "result": {"method": "about", "receiver": "12D3KooWE6tkdArVpCHG9QN61G1cE7eCq2Q7i4bNx6CJFTDprk9f", "value": {"ipfsId":"12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa","name":"12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa","type":"node.js","ipfsMultiaddrs":["/ip4/127.0.0.1/tcp/4001/p2p/12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa","/ip4/5.161.46.163/tcp/4001/p2p/12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa","/ip6/2a01:4ff:f0:f76::1/tcp/4001/p2p/12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa","/ip6/::1/tcp/4001/p2p/12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa"],"isCircuitRelay":true,"circuitRelayInfo":{"ip4":"5.161.46.163","tcpPort":"4001","crDomain":""},"cashAddress":"bitcoincash:qzerrnr5nfdkr3h62cxf0adn4jykjk53zudz4py26e","slpAddress":"simpleledger:qzerrnr5nfdkr3h62cxf0adn4jykjk53zupe7632y8","publicKey":"02e719acbfd3060fa75503ec7af528f5ba67da8a2b9b8e89dbf9b60676740868a0","orbitdbId":"","apiInfo":"You should put an IPFS hash or web URL here to your documentation.","announceJsonLd":{"@context":"https://schema.org/","@type":"WebAPI","name":"ipfs-bch-service-generic","version":"2.0.0","protocol":"bch-wallet","description":"IPFS service providing BCH blockchain access needed by a wallet.","documentation":"https://ipfs-bch-wallet-service.fullstack.cash/","provider":{"@type":"Organization","name":"Permissionless Software Foundation","url":"https://PSFoundation.cash"},"identifier":"12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa"}}}}'
  }
}

module.exports = {
  mockMsg,
  aboutRequest,
  aboutResponse,
  badId,
  msgObj
}
