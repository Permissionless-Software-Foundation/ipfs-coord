/*
  This library contains known circuit relays that new IPFS nodes can use to
  bootstrap themselves into the network and join the pubsub network.
*/
/* eslint camelcase: 0 */

const BOOTSTRAP_BROWSER_CRs = [
  {
    // Based in USA, east coast.
    name: 'bchd.nl',
    multiaddr: '/dns4/bchd.nl/tcp/443/wss/p2p/12D3KooWRBhwfeP2Y9CDkFRBAZ1pmxUadH36TKuk3KtKm5XXP8mA',
    connected: false,
    ipfsId: '12D3KooWRBhwfeP2Y9CDkFRBAZ1pmxUadH36TKuk3KtKm5XXP8mA',
    isBootstrap: true
  }
  // {
  //   name: 'psf-cr-USA-cali',
  //   multiaddr: '/dns4/ipfs-cr.fullstackcash.nl/tcp/443/wss/p2p/12D3KooWPcLSmGFCWDoFA2Xusfoe1mtqECmG9iKwckS7LDuGudZY',
  //   connected: false,
  //   ipfsId: '12D3KooWPcLSmGFCWDoFA2Xusfoe1mtqECmG9iKwckS7LDuGudZY',
  //   isBootstrap: true
  // }
]

const BOOTSTRAP_NODE_CRs = [
  {
    name: 'bchd.nl',
    multiaddr: '/ip4/5.161.95.233/tcp/4001/p2p/12D3KooWRBhwfeP2Y9CDkFRBAZ1pmxUadH36TKuk3KtKm5XXP8mA',
    connected: false,
    ipfsId: '12D3KooWRBhwfeP2Y9CDkFRBAZ1pmxUadH36TKuk3KtKm5XXP8mA',
    isBootstrap: true
  }
  // {
  //   name: 'psf-cr-USA-cali',
  //   multiaddr: '/ip4/137.184.13.92/tcp/4001/p2p/12D3KooWPcLSmGFCWDoFA2Xusfoe1mtqECmG9iKwckS7LDuGudZY',
  //   connected: false,
  //   ipfsId: '12D3KooWPcLSmGFCWDoFA2Xusfoe1mtqECmG9iKwckS7LDuGudZY',
  //   isBootstrap: true
  // }
]

const bootstrapCircuitRelays = {
  browser: BOOTSTRAP_BROWSER_CRs,
  node: BOOTSTRAP_NODE_CRs
}

module.exports = bootstrapCircuitRelays
