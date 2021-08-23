const announceObj = {
  from: 'QmcReHFvNgxFLnLWtVa5SYmeGbmnzBdphKEqPMKJ6XfBh4',
  channel: 'psf-ipfs-coordination-001',
  data: {
    apiName: 'ipfs-coord-announce',
    apiVersion: '1.3.0',
    apiInfo: 'ipfs-hash-to-documentation-to-go-here',
    ipfsId: 'QmcReHFvNgxFLnLWtVa5SYmeGbmnzBdphKEqPMKJ6XfBh4',
    type: 'browser',
    ipfsMultiaddrs: [],
    circuitRelays: [],
    isCircuitRelay: false,
    cryptoAddresses: [],
    encryptPubKey: ''
  }
}

const announceObj2 = {
  from: 'QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
  channel: 'psf-ipfs-coordination-001',
  data: {
    apiName: 'ipfs-coord-announce',
    apiVersion: '1.3.0',
    apiInfo: 'ipfs-hash-to-documentation-to-go-here',
    ipfsId: 'QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
    type: 'browser',
    ipfsMultiaddrs: [],
    circuitRelays: [],
    isCircuitRelay: false,
    cryptoAddresses: [],
    encryptPubKey: ''
  }
}
const swarmPeers = [
  {
    addr:
      '<Multiaddr 049d5a1c0b060fa2a503221220ca9b6cedac4cf9252543e49e94cec725452b8a588641213c67a2841794545b10 - /ip4/157.90.28.11/tcp/4002/p2p/QmbyYXKbnAmMbMGo8LRBZ58jYs58anqUzY1m4jxDmhDsjd>',
    peer: 'QmbyYXKbnAmMbMGo8LRBZ58jYs58anqUzY1m4jxDmhDsjd'
  },
  {
    addr:
      '<Multiaddr 04934b6409060fa1a503221220c9ab4abc592cae0b1d076c557ce9bc2a9ff5d40a726a683e36fe274afa9122a5 - /ip4/147.75.100.9/tcp/4001/p2p/QmcReHFvNgxFLnLWtVa5SYmeGbmnzBdphKEqPMKJ6XfBh4>',
    peer: 'QmcReHFvNgxFLnLWtVa5SYmeGbmnzBdphKEqPMKJ6XfJh4'
  },
  {
    addr:
      ' <Multiaddr 0468838352060fa1a503221220b04a57d40eca138809f139a76b12044333c3740391c9bf1ce9d8e21a79210bfd - /ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ>',
    peer: 'QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ'
  }
]
// Peers that match with circuit relay address mock id
const swarmPeers2 = [
  {
    addr:
      ' <Multiaddr 0468838352060fa1a503221220b04a57d40eca138809f139a76b12044333c3740391c9bf1ce9d8e21a79210bfd - /ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ>',
    peer: 'QmNZktxkfScScnHCFSGKELH3YRqdxHQ3Le9rAoRLhZ6vgL'
  }
]

const mockRelayData = [
  {
    name: 'ipfs.fullstack.cash',
    multiaddr:
      '/ip4/116.203.193.74/tcp/4001/ipfs/QmNZktxkfScScnHCFSGKELH3YRqdxHQ3Le9rAoRLhZ6vgL',
    connected: true
  }
]

module.exports = {
  announceObj,
  announceObj2,
  swarmPeers,
  swarmPeers2,
  mockRelayData
}
