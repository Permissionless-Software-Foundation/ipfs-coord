/*
  This library contains known circuit relays that new IPFS nodes can use to
  bootstrap themselves into the network and join the pubsub network.
*/
/* eslint camelcase: 0 */

const BOOTSTRAP_BROWSER_CRs = [
  {
    name: 'ipfs-service-provider.fullstackcash.nl',
    multiaddr:
      '/dns4/ipfs-service-provider.fullstackcash.nl/tcp/443/wss/ipfs/QmedLCUDSSvsjfPt9rDm65drNL7Dzu1mk1JCRxu9yuxgLL',
    connected: false,
    ipfsId: 'QmSNwrec3GjpzLA8coJiSzdrGzKMELDBjsnsqwkNXDJWz6',
    isBootstrap: true
  },
  {
    name: 'p2wdb-wss.fullstackcash.nl',
    multiaddr:
      '/dns4/p2wdb-wss.fullstackcash.nl/tcp/443/wss/p2p/QmNV2rCHSjrMR4p8E61b7aTMdkH14Re8L7o7GJ6tyHD6C7',
    connected: false,
    ipfsId: 'QmVzXFKDbcB6eQ3UA7rR86zveWxVrZ2tMMBbsm6o6bgssm',
    isBootstrap: true
  }
]

const BOOTSTRAP_NODE_CRs = [
  {
    name: 'fullstack-p2wdb-cali',
    multiaddr:
      '/ip4/137.184.13.92/tcp/5668/p2p/Qma4iaNqgCAzA3HqNNEkKZzqWhCMnjt19TEHLu8TKhHhRK',
    connected: false,
    ipfsId: 'QmZ2YiP5jgeHAXJkzszCtojUw3P2DdrZK41uzWQVKHd9kQ',
    isBootstrap: true
  },
  {
    name: 'ipfs-service-provider.fullstackcash.nl',
    multiaddr:
      '/ip4/157.90.28.11/tcp/4001/p2p/QmedLCUDSSvsjfPt9rDm65drNL7Dzu1mk1JCRxu9yuxgLL',
    connected: false,
    ipfsId: 'QmSNwrec3GjpzLA8coJiSzdrGzKMELDBjsnsqwkNXDJWz6',
    isBootstrap: true
  }
  // {
  //   name: 'go-ipfs.fullstackcash.nl',
  //   multiaddr:
  //     '/ip4/162.55.59.102/tcp/4001/p2p/12D3KooWBYvNFKtQE3Hapi4NJeM9dLu66iTjyT6HBBmu8rzsiDRE',
  //   connected: false,
  //   ipfsId: '12D3KooWBYvNFKtQE3Hapi4NJeM9dLu66iTjyT6HBBmu8rzsiDRE',
  //   isBootstrap: true
  // }
]

const bootstrapCircuitRelays = {
  browser: BOOTSTRAP_BROWSER_CRs,
  node: BOOTSTRAP_NODE_CRs
}

module.exports = bootstrapCircuitRelays
