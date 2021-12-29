/*
  This example shows how to start an IPFS node, using ipfs-coord, with the
  minimum amount of configuration options.
*/

// const IPFS = require('@chris.troutner/ipfs')
const IPFS = require('ipfs')
// const IPFS = require('/home/trout/work/personal/js-ipfs/packages/ipfs')
const BCHJS = require('@psf/bch-js')
// const IpfsCoord = require('ipfs-coord')
const IpfsCoord = require('../index')

const ipfsOptions = {
  repo: './.ipfsdata'
}

async function start () {
  // Create an instance of bch-js and IPFS.
  const bchjs = new BCHJS()
  const ipfs = await IPFS.create(ipfsOptions)

  // Pass bch-js and IPFS to ipfs-coord when instantiating it.
  const ipfsCoord = new IpfsCoord({
    ipfs,
    bchjs,
    debugLevel: 1,
    type: 'node.js'
    // type: 'browser'
  })

  await ipfsCoord.start()
  console.log('IPFS and the coordination library is ready.')

  // Used for debugging
  // setTimeout(async function () {
  //   const thisNode = ipfsCoord.thisNode
  //   console.log('\nthisNode: ', thisNode)
  //   // console.log(
  //   //   `thisNode.peerData: ${JSON.stringify(thisNode.peerData, null, 2)}`
  //   // )
  // }, 20000)
}
start()
