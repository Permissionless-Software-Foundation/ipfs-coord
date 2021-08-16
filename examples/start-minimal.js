/*
  This example shows how to start an IPFS node, using ipfs-coord, with the
  minimum amount of configuration options.
*/

const IPFS = require('ipfs')
const BCHJS = require('@psf/bch-js')
// const IpfsCoord = require('ipfs-coord')
const IpfsCoord = require('../index')

async function start () {
  // Create an instance of bch-js and IPFS.
  const bchjs = new BCHJS()
  const ipfs = await IPFS.create()

  // Pass bch-js and IPFS to ipfs-coord when instantiating it.
  const ipfsCoord = new IpfsCoord({
    ipfs,
    bchjs,
    type: 'node.js'
  })

  await ipfsCoord.start()
  console.log('IPFS and the coordination library is ready.')
}
start()
