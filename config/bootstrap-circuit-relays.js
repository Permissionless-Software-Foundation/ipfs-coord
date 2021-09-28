/*
  This library contains known circuit relays that new IPFS nodes can use to
  bootstrap themselves into the network and join the pubsub network.
*/
/* eslint camelcase: 0 */

const BOOTSTRAP_BROWSER_CRs = [
  {
    name: 'psf-cr-EU',
    multiaddr:
      '/dns4/ipfs-service-provider.fullstackcash.nl/tcp/443/wss/ipfs/QmU6nhzDNipg4kpKjfvpZqdXvfXwoNWSL9jvf29fXj5WKn',
    connected: false,
    ipfsId: 'QmU6nhzDNipg4kpKjfvpZqdXvfXwoNWSL9jvf29fXj5WKn',
    isBootstrap: true
  },
  {
    name: 'psf-cr-USA-cali',
    multiaddr:
      '/dns4/ipfs-cr.fullstackcash.nl/tcp/443/wss/p2p/QmXvT9Tn5VbFU4kGobEt8XS2tsyfjohAzYNa4Wmv8P6pzV',
    connected: false,
    ipfsId: 'QmXvT9Tn5VbFU4kGobEt8XS2tsyfjohAzYNa4Wmv8P6pzV',
    isBootstrap: true
  }
]

const BOOTSTRAP_NODE_CRs = [
  {
    name: 'psf-cr-EU',
    multiaddr:
      '/ip4/162.55.59.102/tcp/5268/p2p/QmU6nhzDNipg4kpKjfvpZqdXvfXwoNWSL9jvf29fXj5WKn',
    connected: false,
    ipfsId: 'QmU6nhzDNipg4kpKjfvpZqdXvfXwoNWSL9jvf29fXj5WKn',
    isBootstrap: true
  },
  {
    name: 'psf-cr-USA-cali',
    multiaddr:
      '/ip4/137.184.13.92/tcp/5268/p2p/QmXvT9Tn5VbFU4kGobEt8XS2tsyfjohAzYNa4Wmv8P6pzV',
    connected: false,
    ipfsId: 'QmXvT9Tn5VbFU4kGobEt8XS2tsyfjohAzYNa4Wmv8P6pzV',
    isBootstrap: true
  }
]

const bootstrapCircuitRelays = {
  browser: BOOTSTRAP_BROWSER_CRs,
  node: BOOTSTRAP_NODE_CRs
}

module.exports = bootstrapCircuitRelays
