/*
  This library contains known circuit relays that new IPFS nodes can use to
  bootstrap themselves into the network and join the pubsub network.
*/
/* eslint camelcase: 0 */

const BOOTSTRAP_BROWSER_CRs = [
  {
    name: "psf-bch-wallet-service-eu",
    multiaddr:
      "/dns4/eu-bch-wallet-service-wss.fullstack.cash/tcp/443/wss/p2p/12D3KooWT2tDg2pHwKz84Htzh2KsfSUZbZXmoAUFnaSwUVrDsag3",
    connected: false,
    ipfsId: "12D3KooWT2tDg2pHwKz84Htzh2KsfSUZbZXmoAUFnaSwUVrDsag3",
    isBootstrap: true
  },
  {
    name: "psf-cr-USA-cali",
    multiaddr:
      "/dns4/ipfs-cr.fullstackcash.nl/tcp/443/wss/p2p/12D3KooWPcLSmGFCWDoFA2Xusfoe1mtqECmG9iKwckS7LDuGudZY",
    connected: false,
    ipfsId: "12D3KooWPcLSmGFCWDoFA2Xusfoe1mtqECmG9iKwckS7LDuGudZY",
    isBootstrap: true
  }
];

const BOOTSTRAP_NODE_CRs = [
  {
    name: "psf-bch-wallet-service-eu",
    multiaddr:
      "/ip4/88.99.188.196/tcp/4001/p2p/12D3KooWT2tDg2pHwKz84Htzh2KsfSUZbZXmoAUFnaSwUVrDsag3",
    connected: false,
    ipfsId: "12D3KooWT2tDg2pHwKz84Htzh2KsfSUZbZXmoAUFnaSwUVrDsag3",
    isBootstrap: true
  },
  {
    name: "psf-cr-USA-cali",
    multiaddr:
      "/ip4/137.184.13.92/tcp/4001/p2p/12D3KooWPcLSmGFCWDoFA2Xusfoe1mtqECmG9iKwckS7LDuGudZY",
    connected: false,
    ipfsId: "12D3KooWPcLSmGFCWDoFA2Xusfoe1mtqECmG9iKwckS7LDuGudZY",
    isBootstrap: true
  },
  {
    name: "test-node",
    multiaddr:
      "/ip4/5.161.46.163/tcp/4001/p2p/12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa",
    connected: false,
    ipfsId: "12D3KooWHS5A6Ey4V8fLWD64jpPn2EKi4r4btGN6FfkNgMTnfqVa",
    isBootstrap: false
  }
];

const bootstrapCircuitRelays = {
  browser: BOOTSTRAP_BROWSER_CRs,
  node: BOOTSTRAP_NODE_CRs
};

module.exports = bootstrapCircuitRelays;
