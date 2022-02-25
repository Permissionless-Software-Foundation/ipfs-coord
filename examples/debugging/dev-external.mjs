/*
  Forked from start-external.js. This is used with a local copy of ipfs-http-client
  source code that can be hacked.
*/

// const IPFS = require('@chris.troutner/ipfs')
// const IPFS = require('ipfs-http-client')
import { create } from 'ipfs-http-client'
// const IPFS = require('/home/trout/work/personal/js-ipfs/packages/ipfs')
import http from 'http'
import IpfsCoord from '../index.js'
import BCHJS from '@psf/bch-js'

// Configuration for external IPFS node.
const ipfsOptions = {
  protocol: 'http',
  host: 'localhost',
  port: 5001,
  agent: http.Agent({ keepAlive: true, maxSockets: 100 })
}

async function start () {
  // Create an instance of bch-js and IPFS.
  const bchjs = new BCHJS()
  const ipfs = await create(ipfsOptions)

  // Pass bch-js and IPFS to ipfs-coord when instantiating it.
  const ipfsCoord = new IpfsCoord({
    ipfs,
    bchjs,
    type: 'node.js',
    // type: 'browser'
    nodeType: 'external',
    debugLevel: 2
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
