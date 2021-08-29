/*
  Adapter library for IPFS, so the rest of the business logic doesn't need to
  know specifics about the IPFS API.
*/

// The amount of time to wait to connect to a peer, in milliseconds.
// Increasing the time makes the network slower but more resilient to latency.
// Decreasing the time makes the network faster, but more smaller and more fragile.
const CONNECTION_TIMEOUT = 10000

class IpfsAdapter {
  constructor (localConfig = {}) {
    // Input Validation
    this.ipfs = localConfig.ipfs
    if (!this.ipfs) {
      throw new Error(
        'An instance of IPFS must be passed when instantiating the IPFS adapter library.'
      )
    }
    this.log = localConfig.log
    if (!this.log) {
      throw new Error(
        'A status log handler must be specified when instantiating IPFS adapter library.'
      )
    }

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

      // Remove bootstrap nodes, as we have our own bootstrap nodes, and the
      // the default ones can spam our nodes with a ton of bandwidth.
      await this.ipfs.config.set('Bootstrap', [])

      // Also remove default Delegates, as they are the same as the default
      // Bootstrap nodes.
      await this.ipfs.config.set('Addresses.Delegates', [])
    } catch (err) {
      console.error('Error in ipfs-adapter.js/start()')
      throw err
    }
  }

  // Attempts to connect to an IPFS peer, given its IPFS ID.
  // Returns true if the connection succeeded. Otherwise returns false.
  async connectToPeer (ipfsAddr) {
    try {
      // TODO: Throw error if ipfs ID is passed, instead of a multiaddr.

      await this.ipfs.swarm.connect(ipfsAddr, { timeout: CONNECTION_TIMEOUT })

      // if (this.debugLevel) {
      //   this.statusLog(
      //     `status: Successfully connected to peer node ${ipfsAddr}`
      //   )
      // }
      this.log.statusLog(1, `Successfully connected to peer node ${ipfsAddr}`)

      return true
    } catch (err) {
      /* exit quietly */
      // console.warn(
      //   `Error trying to connect to peer node ${ipfsId}: ${err.message}`
      // )

      // if (this.debugLevel === 1) {
      //   this.statusLog(
      //     `status: Error trying to connect to peer node ${ipfsAddr}`
      //   )
      // } else if (this.debugLevel === 2) {
      //   this.statusLog(
      //     `status: Error trying to connect to peer node ${ipfsAddr}: `,
      //     err
      //   )
      // }
      this.log.statusLog(1, `Error trying to connect to peer node ${ipfsAddr}`)
      this.log.statusLog(
        2,
        `Error trying to connect to peer node ${ipfsAddr}: `,
        err
      )

      return false
    }
  }

  // Disconnect from a peer.
  async disconnectFromPeer (ipfsId) {
    try {
      // TODO: If given a multiaddr, extract the IPFS ID.

      // Get the list of peers that we're connected to.
      const connectedPeers = await this.getPeers()
      // console.log('connectedPeers: ', connectedPeers)

      // See if we're connected to the given IPFS ID
      const connectedPeer = connectedPeers.filter(x => x.peer === ipfsId)

      // If we're not connected, exit.
      if (!connectedPeer.length) {
        // console.log(`debug: Not connected to ${ipfsId}`)
        return true
      }

      // If connected, disconnect from the peer.
      await this.ipfs.swarm.disconnect(connectedPeer[0].addr, {
        timeout: CONNECTION_TIMEOUT
      })

      return true
    } catch (err) {
      // exit quietly
      return false
    }
  }

  async disconnectFromMultiaddr (multiaddr) {
    try {
      await this.ipfs.swarm.disconnect(multiaddr, {
        timeout: CONNECTION_TIMEOUT
      })

      return true
    } catch (err) {
      return false
    }
  }

  // Get a list of all the IPFS peers This Node is connected to.
  async getPeers () {
    try {
      // Get connected peers
      const connectedPeers = await this.ipfs.swarm.peers({
        direction: true,
        streams: true,
        verbose: true,
        latency: true
      })

      return connectedPeers
    } catch (err) {
      console.error('Error in ipfs-adapter.js/getPeers()')
      throw err
    }
  }
}

module.exports = IpfsAdapter
