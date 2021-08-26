/*
  Adapter library for IPFS, so the rest of the business logic doesn't need to
  know specifics about the IPFS API.
*/

class IpfsAdapter {
  constructor (localConfig = {}) {
    // Input Validation
    this.ipfs = localConfig.ipfs
    if (!this.ipfs) {
      throw new Error(
        'An instance of IPFS must be passed when instantiating the IPFS adapter library.'
      )
    }
    this.statusLog = localConfig.statusLog
    if (!this.statusLog) {
      throw new Error(
        'A status log handler must be specified when instantiating IPFS adapter library.'
      )
    }

    this.debugLevel = localConfig.debugLevel

    // Placeholders that will be filled in after the node finishes initializing.
    this.ipfsPeerId = ''
    this.ipfsMultiaddrs = ''
  }

  // Start the IPFS node if it hasn't already been started.
  // Update the state of this adapter with the IPFS node information.
  async start () {
    try {
      // Wait until the IPFS creation Promise has resolved, and the node is
      // fully instantiated.
      this.ipfs = await this.ipfs

      // Get ID information about this IPFS node.
      const id2 = await this.ipfs.id()
      // this.state.ipfsPeerId = id2.id
      this.ipfsPeerId = id2.id

      // Get multiaddrs that can be used to connect to this node.
      const addrs = id2.addresses.map(elem => elem.toString())
      // this.state.ipfsMultiaddrs = addrs
      this.ipfsMultiaddrs = addrs
    } catch (err) {
      console.error('Error in ipfs-adapter.js/start()')
      throw err
    }
  }

  // Attempts to connect to an IPFS peer, given its IPFS ID.
  // Returns true if the connection succeeded. Otherwise returns false.
  async connectToPeer (ipfsId) {
    try {
      await this.ipfs.swarm.connect(ipfsId, { timeout: 5000 })

      if (this.debugLevel) {
        this.statusLog(`status: Successfully connected to peer node ${ipfsId}`)
      }

      return true
    } catch (err) {
      /* exit quietly */
      // console.warn(
      //   `Error trying to connect to peer node ${ipfsId}: ${err.message}`
      // )
      if (this.debugLevel === 1) {
        this.statusLog(`status: Error trying to connect to peer node ${ipfsId}`)
      } else if (this.debugLevel === 2) {
        this.statusLog(
          `status: Error trying to connect to peer node ${ipfsId}: `,
          err
        )
      }

      return false
    }
  }

  // Get a list of all the IPFS peers This Node is connected to.
  async getPeers () {
    try {
      // Get connected peers
      const connectedPeers = await this.ipfs.swarm.peers()

      return connectedPeers
    } catch (err) {
      console.error('Error in ipfs-adapter.js/getPeers()')
      throw err
    }
  }
}

module.exports = IpfsAdapter
