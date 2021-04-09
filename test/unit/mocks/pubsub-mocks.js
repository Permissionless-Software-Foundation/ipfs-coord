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

module.exports = {
  mockMsg
}
