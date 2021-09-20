/** Circuit Relays mock */
const circuitRelays = [
  {
    name: 'ipfs.fullstack.cash',
    multiaddr:
      '/ip4/116.203.193.74/tcp/4001/ipfs/QmNZktxkfScScnHCFSGKELH3YRqdxHQ3Le9rAoRLhZ6vgL',
    connected: true
  }
]

const duplicateRelays = [
  {
    multiaddr:
      '/ip4/139.162.76.54/tcp/5269/ws/p2p/QmaKzQTAtoJWYMiG5ATx41uWsMajr1kSxRdtg919s8fK77',
    connected: true,
    updatedAt: '2021-09-20T15:59:12.961Z',
    ipfsId: 'QmaKzQTAtoJWYMiG5ATx41uWsMajr1kSxRdtg919s8fK77',
    isBootstrap: false,
    metrics: { aboutLatency: [] },
    latencyScore: 10000
  },
  {
    multiaddr:
      '/ip4/157.90.28.11/tcp/4001/p2p/QmedLCUDSSvsjfPt9rDm65drNL7Dzu1mk1JCRxu9yuxgLL',
    connected: false,
    updatedAt: '2021-09-20T15:58:22.480Z',
    ipfsId: 'QmedLCUDSSvsjfPt9rDm65drNL7Dzu1mk1JCRxu9yuxgLL',
    isBootstrap: true,
    metrics: { aboutLatency: [] },
    latencyScore: 10000
  },
  {
    multiaddr:
      '/ip4/157.90.28.11/tcp/4001/p2p/QmedLCUDSSvsjfPt9rDm65drNL7Dzu1mk1JCRxu9yuxgLL',
    connected: false,
    updatedAt: '2021-09-20T15:58:22.480Z',
    ipfsId: 'QmedLCUDSSvsjfPt9rDm65drNL7Dzu1mk1JCRxu9yuxgLL',
    isBootstrap: true,
    metrics: { aboutLatency: [] },
    latencyScore: 10000
  },
  {
    multiaddr:
      '/ip4/157.90.28.11/tcp/4001/p2p/QmedLCUDSSvsjfPt9rDm65drNL7Dzu1mk1JCRxu9yuxgLL',
    connected: false,
    updatedAt: '2021-09-20T15:58:22.480Z',
    ipfsId: 'QmedLCUDSSvsjfPt9rDm65drNL7Dzu1mk1JCRxu9yuxgLL',
    isBootstrap: true,
    metrics: { aboutLatency: [] },
    latencyScore: 10000
  },
  {
    multiaddr:
      '/ip4/137.184.13.92/tcp/5668/p2p/Qma4iaNqgCAzA3HqNNEkKZzqWhCMnjt19TEHLu8TKhHhRK',
    connected: true,
    updatedAt: '2021-09-20T15:58:14.963Z',
    ipfsId: 'Qma4iaNqgCAzA3HqNNEkKZzqWhCMnjt19TEHLu8TKhHhRK',
    isBootstrap: true,
    metrics: { aboutLatency: [] },
    latencyScore: 10000
  }
]

module.exports = {
  circuitRelays,
  duplicateRelays
}
