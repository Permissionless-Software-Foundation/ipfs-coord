/*
  This Controller library is concerned with timer-based functions that are
  kicked off periodicially. These functions maintain connections and state
  of the IPFS node.
*/

const DEFAULT_COORDINATION_ROOM = 'psf-ipfs-coordination-002'

let _this

class TimerControllers {
  constructor (localConfig = {}) {
    // Dependency Injection
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters required when instantiating Timer Controllers'
      )
    }
    this.statusLog = localConfig.statusLog
    if (!this.statusLog) {
      throw new Error(
        'Handler for status logs required when instantiating Timer Controllers'
      )
    }

    this.debugLevel = localConfig.debugLevel
    this.config = localConfig

    _this = this
  }

  startTimers (thisNode, useCases) {
    // Periodically maintain the connection to Circuit Relays.
    this.circuitRelayTimerHandle = setInterval(async function () {
      await _this.manageCircuitRelays(thisNode, useCases)
    }, 60000) // One Minute

    // Periodically announce this nodes existance to the network.
    this.announceTimerHandle = setInterval(async function () {
      await _this.manageAnnouncement(thisNode, useCases)
    }, 31000)

    // Periodically maintain the connection to other coordination peers.
    this.peerTimerHandle = setInterval(async function () {
      await _this.managePeers(thisNode, useCases)
    }, 2 * 50000)

    // Periodically try to connect to problematic peers that advertise as
    // potential circuit relays.
    this.relaySearch = setInterval(async function () {
      await _this.searchForRelays(thisNode, useCases)
    }, 3 * 60000)

    // Periodically ensure we are disconnected from blacklisted peers.
    this.checkBlacklist = setInterval(async function () {
      await _this.blacklist(thisNode, useCases)
    }, 30000)

    this.bwTimerHandle = setInterval(async function () {
      // monitorBandwidth() throws an error in browsers.
      // if (_this.config.type !== 'browser') {
      //   await _this.monitorBandwidth(thisNode, useCases)
      // }
      // console.log('_this.adapters.ipfs: ', _this.adapters.ipfs)

      const ipfs = _this.adapters.ipfs.ipfs

      const pubsubChans = await ipfs.pubsub.ls()
      // console.log(`subscribed pubsub channels: ${JSON.stringify(pubsubChans, null, 2)}`)
      _this.adapters.log.statusLog(2, `subscribed pubsub channels: ${JSON.stringify(pubsubChans, null, 2)}`)
    }, 32000)

    // Return handles to the different timers.
    return {
      circuitRelayTimerHandle: this.circuitRelayTimerHandle,
      announceTimerHandle: this.announceTimerHandle,
      peerTimerHandle: this.peerTimerHandle,
      relaySearch: this.relaySearch,
      checkBlacklist: this.checkBlacklist
    }
  }

  // Used mostly for testing. Ensures all timers are stopped.
  async stopAllTimers () {
    clearInterval(this.circuitRelayTimerHandle)
    clearInterval(this.announceTimerHandle)
    clearInterval(this.peerTimerHandle)
    clearInterval(this.relaySearch)
    clearInterval(this.checkBlacklist)
    clearInterval(this.bwTimerHandle)
  }

  // Monitor the bandwidth being consumed by IPFS peers. Disconnect from peers
  // that request too much bandwidth.
  async monitorBandwidth (thisNode, useCases) {
    try {
      const ipfs = this.adapters.ipfs.ipfs

      // const bw = await ipfs.stats.bw()
      // console.log('bw: ', bw)
      for await (const stats of ipfs.stats.bw()) {
      // console.log(stats)
        this.adapters.log.statusLog(2, 'Bandwidth stats: ', stats)
      // this.adapters.log.statusLog(2, `${JSON.stringify(stats, null, 2)}`)
      }

      const bitswap = await ipfs.stats.bitswap()
      this.adapters.log.statusLog(2, 'bitswap stats: ', bitswap)
      // this.adapters.log.statusLog(2, `${JSON.stringify(bitswap, null, 2)}`)

      // Monitor pubsub channels.
      const pubsubs = await ipfs.pubsub.ls()
      // this.adapters.log.statusLog(2, 'pubsubs: ', pubsubs)
      this.adapters.log.statusLog(
        2,
        `pubsubs: ${JSON.stringify(pubsubs, null, 2)}`
      )

      // Shut down node if it runs-away with connections.
      const MAX_PEERS = 50
      if (bitswap.peers.length > MAX_PEERS) {
        console.log(
          `IPFS node is misbehaving, by connecting to more than ${MAX_PEERS} peers. Shutting down for 10 seconds.`
        )
        await ipfs.stop()
        await sleep(10000)
        await ipfs.start()
      }
    } catch (err) {
      console.error('Error in timer-controller.js/monitorBandwidth(): ', err)
      this.adapters.log.statusLog(
        2,
        'Error in timer-controller.jsmonitorBandwidth(): ',
        err
      )
    // Note: Do not throw an error. This is a top-level function.
    }
  }

  // This function is intended to be called periodically by setInterval().
  async manageCircuitRelays (thisNode, useCases) {
    try {
      console.log('Entering manageCircuitRelays() Controller.')

      // Disable the timer while processing is happening.
      clearInterval(this.circuitRelayTimerHandle)

      // Remove any duplicate entries
      useCases.relays.removeDuplicates(thisNode)

      // Maintain connections to Relays.
      await useCases.relays.connectToCRs(thisNode)

      // Update metrics on Relays.
      await useCases.relays.measureRelays(thisNode)

      const now = new Date()
      this.adapters.log.statusLog(
        1,
        `Renewed connections to all circuit relays at ${now.toLocaleString()}`
      )

    // console.log('Exiting manageCircuitRelays() Controller.')
    } catch (err) {
      console.error(
        'Error in timer-controller.js/manageCircuitRelays(): ',
        err
      )
      this.adapters.log.statusLog(
        2,
        'Error in timer-controller.js/manageCircuitRelays(): ',
        err
      )
    // Note: Do not throw an error. This is a top-level function.
    }

    // Periodically maintain the connection to Circuit Relays.
    this.circuitRelayTimerHandle = setInterval(async function () {
      await _this.manageCircuitRelays(thisNode, useCases)
    }, 60000) // One Minute
  }

  // This function is intended to be called periodically by setInterval().
  // Announce the existance of this node to the network.
  async manageAnnouncement (thisNode, useCases) {
    try {
      // console.log('thisNode: ', thisNode)

      // Get the information needed for the announcement.
      const announceObj = {
        ipfsId: thisNode.ipfsId,
        ipfsMultiaddrs: thisNode.ipfsMultiaddrs,
        type: thisNode.type,
        // orbitdbId: thisNode.orbit.id,

        // TODO: Allow node.js apps to pass a config setting to override this.
        isCircuitRelay: false
      }

      // Generate the announcement message.
      const announceMsgObj = thisNode.schema.announcement(announceObj)
      // console.log(`announceMsgObj: ${JSON.stringify(announceMsgObj, null, 2)}`)

      const announceMsgStr = JSON.stringify(announceMsgObj)

      // Publish the announcement to the pubsub channel.
      await this.adapters.pubsub.messaging.publishToPubsubChannel(
        DEFAULT_COORDINATION_ROOM,
        announceMsgStr
      )

      if (this.debugLevel) {
        const now = new Date()
        this.statusLog(
          `status: Announced self on ${DEFAULT_COORDINATION_ROOM} pubsub channel at ${now.toLocaleString()}`
        )
      }

      return true
    } catch (err) {
      console.error('Error in timer-controller.js/manageAnnouncement(): ', err)
      this.adapters.log.statusLog(
        2,
        'Error in timer-controller.js/manageAnnouncement(): ',
        err
      )
    // Note: Do not throw an error. This is a top-level function.
    }
  }

  // This function is intended to be called periodically by setInterval().
  // It refreshes the connection to all subnet peers thisNode is trying to track.
  async managePeers (thisNode, useCases) {
    let success = false

    try {
      // Disable the timer while processing is happening.
      clearInterval(this.peerTimerHandle)

      // this.statusLog('managePeers')
      await useCases.thisNode.refreshPeerConnections()

      // console.error('Error in timer-controller.js/manageAnnouncement(): ', err)
      this.adapters.log.statusLog(
        1,
        'Renewed connections to all subnet peers.'
      )

      success = true
    } catch (err) {
      this.adapters.log.statusLog(
        2,
        'Error in timer-controller.js/managePeers(): ',
        err
      )
      // Note: Do not throw an error. This is a top-level function.

      success = false
    }

    // Reinstate the timer interval
    this.peerTimerHandle = setInterval(async function () {
      await _this.managePeers(thisNode, useCases)
    }, 21000)

    return success
  }

  // Actively disconnect from blacklisted peers.
  async blacklist (thisNode, useCases) {
    let success = false

    try {
      // Disable the timer while processing is happening.
      clearInterval(this.checkBlacklist)

      // this.statusLog('managePeers')
      // await useCases.thisNode.enforceBlacklist()
      await useCases.thisNode.enforceWhitelist()

      this.adapters.log.statusLog(1, 'Finished enforcing whitelist.')

      success = true
    } catch (err) {
      this.adapters.log.statusLog(
        2,
        'Error in timer-controller.js/blacklist(): ',
        err
      )
      // Note: Do not throw an error. This is a top-level function.

      success = false
    }

    // Reinstate the timer interval
    this.checkBlacklist = setInterval(async function () {
      await _this.blacklist(thisNode, useCases)
    }, 30000)

    return success
  }

  // This method looks for subnet peers that have the isCircuitRelay flag set,
  // but are not in the list of known relays. These represent potential relays
  // that thisNode could not connect to, but it might be able to with another
  // try.
  async searchForRelays (thisNode, useCases) {
    try {
      // console.log('Entering searchForRelays() Controller.')

      // Disable the timer while processing is happening.
      clearInterval(this.relaySearch)

      // Get all the known relays.
      const knownRelays = thisNode.relayData.map(x => x.ipfsId)
      // console.log('knownRelays: ', knownRelays)

      // Get all subnet peers that have their circuit relay flag set.
      let relayPeers = thisNode.peerData.filter(x => x.data.isCircuitRelay)
      relayPeers = relayPeers.map(x => x.from)
      // console.log('relayPeers: ', relayPeers)

      // Diff the two arrays to get relays peers that are not in the relay list.
      const diffRelayPeers = relayPeers.filter(x => !knownRelays.includes(x))
      // console.log('diffRelayPeers: ', diffRelayPeers)

      // Try to connect to each potential relay.
      for (let i = 0; i < diffRelayPeers.length; i++) {
        const thisPeer = diffRelayPeers[i]
        await useCases.relays.addRelay(thisPeer, thisNode)
      }

    // console.log('Exiting searchForRelays() Controller.')
    } catch (err) {
      // console.error('Error in timer-controller.js/searchForRelays(): ', err)
      this.adapters.log.statusLog(
        2,
        'Error in timer-controller.js/searchForRelays(): ',
        err
      )
    // Note: Do not throw an error. This is a top-level function.
    }

    // Periodically try to connect to problematic peers that advertise as
    // potential circuit relays.
    this.relaySearch = setInterval(async function () {
      await _this.searchForRelays(thisNode, useCases)
    }, 5 * 60000)
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = TimerControllers
