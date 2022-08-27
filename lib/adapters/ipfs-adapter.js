/*
  Adapter library for IPFS, so the rest of the business logic doesn't need to
  know specifics about the IPFS API.
*/

// The amount of time to wait to connect to a peer, in milliseconds.
// Increasing the time makes the network slower but more resilient to latency.
// Decreasing the time makes the network faster, but more smaller and more fragile.
const CONNECTION_TIMEOUT = 10000

const bootstapNodes = require('../../config/bootstrap-circuit-relays')

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

    // 'embedded' node type used as default, will use embedded js-ipfs.
    // Alternative is 'external' which will use ipfs-http-client to control an
    // external IPFS node.
    this.nodeType = localConfig.nodeType
    if (!this.nodeType) {
      // console.log('No node type specified. Assuming embedded js-ipfs.')
      this.nodeType = 'embedded'
    }

    // Port Settings. Defaults are overwritten if specified in the localConfig.
    this.tcpPort = 4001
    if (localConfig.tcpPort) this.tcpPort = localConfig.tcpPort
    this.wsPort = 4003
    if (localConfig.wsPort) this.wsPort = localConfig.wsPort

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
      await this.ipfs.config.set('Bootstrap', [
        bootstapNodes.node[0].multiaddr,
        bootstapNodes.node[1].multiaddr
      ])

      // Settings specific to embedded js-ipfs.
      if (this.nodeType === 'embedded') {
        // Also remove default Delegates, as they are the same as the default
        // Bootstrap nodes.
        await this.ipfs.config.set('Addresses.Delegates', [])
      }

      // Settings specific to external go-ipfs node.
      if (this.nodeType === 'external') {
        // Enable RelayClient
        // https://github.com/ipfs/go-ipfs/blob/master/docs/config.md#swarmrelayclient
        // https://github.com/ipfs/go-ipfs/releases/tag/v0.11.0
        await this.ipfs.config.set('Swarm.RelayClient.Enabled', true)

        // Enable hole punching for better p2p interaction.
        // https://github.com/ipfs/go-ipfs/blob/master/docs/config.md#swarmenableholepunching
        await this.ipfs.config.set('Swarm.EnableHolePunching', true)

        // Enable websocket connections
        await this.ipfs.config.set('Addresses.Swarm', [
          `/ip4/0.0.0.0/tcp/${this.tcpPort}`,
          `/ip6/::/tcp/${this.tcpPort}`,
          `/ip4/0.0.0.0/udp/${this.tcpPort}/quic`,
          `/ip6/::/udp/${this.tcpPort}/quic`,
          `/ip4/0.0.0.0/tcp/${this.wsPort}`, // Websockets
          `/ip6/::/tcp/${this.wsPort}`
        ])

        // Disable scanning of IP ranges. This is largely driven by Hetzner
        await this.ipfs.config.set('Swarm.AddrFilters', [
          '/ip4/10.0.0.0/ipcidr/8',
          '/ip4/100.0.0.0/ipcidr/8',
          '/ip4/169.254.0.0/ipcidr/16',
          '/ip4/172.16.0.0/ipcidr/12',
          '/ip4/192.0.0.0/ipcidr/24',
          '/ip4/192.0.2.0/ipcidr/24',
          '/ip4/192.168.0.0/ipcidr/16',
          '/ip4/198.18.0.0/ipcidr/15',
          '/ip4/198.51.100.0/ipcidr/24',
          '/ip4/203.0.113.0/ipcidr/24',
          '/ip4/240.0.0.0/ipcidr/4',
          '/ip6/100::/ipcidr/64',
          '/ip6/2001:2::/ipcidr/48',
          '/ip6/2001:db8::/ipcidr/32',
          '/ip6/fc00::/ipcidr/7',
          '/ip6/fe80::/ipcidr/10'
        ])

        // go-ipfs v0.10.0
        // await this.ipfs.config.set('Swarm.EnableRelayHop', true)
        // await this.ipfs.config.set('Swarm.EnableAutoRelay', true)

      // Disable peer discovery
      // await this.ipfs.config.set('Routing.Type', 'none')
      }

      // Disable preloading
      await this.ipfs.config.set('preload.enabled', false)

      // Reduce the default number of peers thisNode connects to at one time.
      await this.ipfs.config.set('Swarm.ConnMgr', {
        LowWater: 10,
        HighWater: 30,
        GracePeriod: '2s'
      })

      // Reduce the storage size, as this node should not be retaining much data.
      await this.ipfs.config.set('Datastore.StorageMax', '2GB')
    } catch (err) {
      console.error('Error in ipfs-adapter.js/start()')
      throw err
    }
  }

  // Attempts to connect to an IPFS peer, given its IPFS multiaddr.
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
      this.log.statusLog(2, `Error trying to connect to peer node ${ipfsAddr}`)
      // console.log(`Error trying to connect to peer node ${ipfsAddr}: `, err)

      // this.log.statusLog(
      //   3,
      //   `Error trying to connect to peer node ${ipfsAddr}: `,
      //   err
      // )

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
