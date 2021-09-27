/*
  This library contains known circuit relays that new IPFS nodes can use to
  bootstrap themselves into the network and join the pubsub network.
*/
/* eslint camelcase: 0 */

const BOOTSTRAP_BROWSER_CRs = [
  {
    name: 'ipfs-service-provider.fullstackcash.nl',
    multiaddr:
      '/dns4/ipfs-service-provider.fullstackcash.nl/tcp/443/wss/ipfs/QmU6nhzDNipg4kpKjfvpZqdXvfXwoNWSL9jvf29fXj5WKn',
    connected: false,
    ipfsId: 'QmedLCUDSSvsjfPt9rDm65drNL7Dzu1mk1JCRxu9yuxgLL',
    isBootstrap: true
  },
  {
    name: 'psf-cr-US-cali',
    multiaddr:
      '/dns4/ipfs-cr.fullstackcash.nl/tcp/443/wss/p2p/QmXvT9Tn5VbFU4kGobEt8XS2tsyfjohAzYNa4Wmv8P6pzV',
    connected: false,
    ipfsId: 'QmNV2rCHSjrMR4p8E61b7aTMdkH14Re8L7o7GJ6tyHD6C7',
    isBootstrap: true
  }
]

const BOOTSTRAP_NODE_CRs = [
  {
    name: 'ipfs-service-provider.fullstackcash.nl',
    multiaddr:
      '/ip4/162.55.59.102/tcp/5268/p2p/QmU6nhzDNipg4kpKjfvpZqdXvfXwoNWSL9jvf29fXj5WKn',
    connected: false,
    ipfsId: 'QmedLCUDSSvsjfPt9rDm65drNL7Dzu1mk1JCRxu9yuxgLL',
    isBootstrap: true
  },
  {
    name: 'fullstack-p2wdb-cali',
    multiaddr:
      '/ip4/137.184.13.92/tcp/5268/p2p/QmXvT9Tn5VbFU4kGobEt8XS2tsyfjohAzYNa4Wmv8P6pzV',
    connected: false,
    ipfsId: 'Qma4iaNqgCAzA3HqNNEkKZzqWhCMnjt19TEHLu8TKhHhRK',
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
