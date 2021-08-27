/*
  This library contains known circuit relays that new IPFS nodes can use to
  bootstrap themselves into the network and join the pubsub network.
*/
/* eslint camelcase: 0 */

const BOOTSTRAP_BROWSER_CRs = [
  {
    name: 'ipfs-service-provider.fullstackcash.nl',
    multiaddr:
      '/dns4/ipfs-service-provider.fullstackcash.nl/tcp/443/wss/ipfs/QmSNwrec3GjpzLA8coJiSzdrGzKMELDBjsnsqwkNXDJWz6',
    connected: false,
    ipfsId: 'QmbyYXKbnAmMbMGo8LRBZ58jYs58anqUzY1m4jxDmhDsjd'
  },
  {
    name: 'go-ipfs-wss.fullstackcash.nl',
    multiaddr:
      '/dns4/go-ipfs-wss.fullstackcash.nl/tcp/443/wss/ipfs/12D3KooWBYvNFKtQE3Hapi4NJeM9dLu66iTjyT6HBBmu8rzsiDRE',
    connected: false,
    ipfsId: 'QmTtXA18C6sg3ji9zem4wpNyoz9m4UZT85mA2D2jx2gzEk'
  }
]

const BOOTSTRAP_NODE_CRs = [
  {
    name: 'ipfs.fullstack.cash',
    multiaddr:
      '/ip4/116.203.193.74/tcp/4001/ipfs/QmNZktxkfScScnHCFSGKELH3YRqdxHQ3Le9rAoRLhZ6vgL',
    connected: false,
    ipfsId: 'QmNZktxkfScScnHCFSGKELH3YRqdxHQ3Le9rAoRLhZ6vgL'
  },
  {
    name: 'ipfs-service-provider.fullstackcash.nl',
    multiaddr:
      '/ip4/157.90.28.11/tcp/4001/p2p/QmSNwrec3GjpzLA8coJiSzdrGzKMELDBjsnsqwkNXDJWz6',
    connected: false,
    ipfsId: 'QmbyYXKbnAmMbMGo8LRBZ58jYs58anqUzY1m4jxDmhDsjd'
  },
  {
    name: 'go-ipfs.fullstackcash.nl',
    multiaddr:
      '/ip4/162.55.59.102/tcp/4001/p2p/12D3KooWBYvNFKtQE3Hapi4NJeM9dLu66iTjyT6HBBmu8rzsiDRE',
    connected: false,
    ipfsId: 'QmTtXA18C6sg3ji9zem4wpNyoz9m4UZT85mA2D2jx2gzEk'
  }
]

// {
//   name: 'test',
//   multiaddr:
//     '/ip4/165.227.82.120/tcp/5401/p2p/QmbR6fos5MPVqZ2UbF4Li3rsmTEN9a6PgvdXqHij8ePEja',
//   connected: false,
//   ipfsId: 'QmbR6fos5MPVqZ2UbF4Li3rsmTEN9a6PgvdXqHij8ePEja'
// }

const bootstrapCircuitRelays = {
  browser: BOOTSTRAP_BROWSER_CRs,
  node: BOOTSTRAP_NODE_CRs
}

module.exports = bootstrapCircuitRelays
