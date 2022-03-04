/*
  This script is used to analyize OrbitDB data that is detected by running the
  dev-external.mjs script with DEBUG=* LOG=debug

  That will print out OrbitDB hashs that start with the letter 'z'. This script
  can be used to decode the content of those hashes.
*/

// const dbname = "12D3KooWLwTfBrb5hxi6pPWqxFA38Zp1MAzParsvBVLUZLgnSQTN";

// const IPFS = require('@chris.troutner/ipfs')
// const IPFS = require('ipfs-http-client')
import { create } from 'ipfs-http-client'
// const IPFS = require('/home/trout/work/personal/js-ipfs/packages/ipfs')
import http from 'http'
// import IpfsCoord from '../index.js'
// import BCHJS from "@psf/bch-js";
import OrbitDB from 'orbit-db'

const directory =
  './.ipfsdata/orbitdb-ipfs-coord/12D3KooWE6tkdArVpCHG9QN61G1cE7eCq2Q7i4bNx6CJFTDprk9f'
const dbAddr =
  '/orbitdb/zdpuAnxfwpb9FzxV9RrmdxqSCCZwHrJ63Denf7Zn9SRmLZN6d/12D3KooWQx2NBJdnTt1wwhcPu34hHP2uSB1PgxNWCiwvGv7PkC4122022505'
// const entry = "zdpuAz7TEfEqFwNGzMPsBmK2uiz4mE7vqHMuKohqLcQ6Q3q3D";

// Configuration for external IPFS node.
const ipfsOptions = {
  protocol: 'http',
  host: 'localhost',
  port: 5001,
  agent: http.Agent({ keepAlive: true, maxSockets: 100 })
}

async function start () {
  // Create an instance of bch-js and IPFS.
  // const bchjs = new BCHJS();
  const ipfs = await create(ipfsOptions)

  const idData = await ipfs.id()
  const id = idData.id
  console.log(id)

  const orbitdb = await OrbitDB.createInstance(ipfs, { directory })
  console.log('orbitdb: ', orbitdb)

  const db = await orbitdb.eventlog(dbAddr)

  // const db = await orbitdb.eventlog(dbname);
  //
  // await db.load();
  //
  // // console.log(db);
  //
  const all = db
    .iterator({ limit: -1 })
    .collect()
    .map(e => e.payload.value)
  console.log(all)

  const oneEntry = await db.get('')
  console.log('oneEntry: ', oneEntry)
}
start()
