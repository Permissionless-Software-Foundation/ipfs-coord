/*
  This example shows how to start an IPFS node, using ipfs-coord, with the
  maximum amount of configuration options.
*/

const IPFS = require('ipfs')
const BCHJS = require('@psf/bch-js')
// const IpfsCoord = require('ipfs-coord')
const IpfsCoord = require('../index')

const announceJson = {
  '@context': 'https://schema.org/',
  '@type': 'WebAPI',
  name: 'ipfs-coord-example',
  version: '1.0.0',
  protocol: 'none',
  description: 'This is an example IPFS node using ipfs-coord.',
  documentation:
    'https://github.com/Permissionless-Software-Foundation/ipfs-coord',
  provider: {
    '@type': 'Organization',
    name: 'Permissionless Software Foundation',
    url: 'https://PSFoundation.cash'
  }
}

async function start () {
  // Create an instance of bch-js and IPFS.
  const bchjs = new BCHJS()
  const ipfs = await IPFS.create()

  // Pass bch-js and IPFS to ipfs-coord when instantiating it.
  const ipfsCoord = new IpfsCoord({
    ipfs,
    bchjs,
    type: 'node.js',
    privateLog: console.log, // Replace with your own log.
    isCircuitRelay: false, // Set to true to provide Circuit Relay functionality.
    apiInfo: 'Link to API documentation if applicable',
    announceJsonLd: announceJson,
    debugLevel: 2
  })

  await ipfsCoord.start()
  console.log('IPFS and the coordination library is ready.')
}
start()
