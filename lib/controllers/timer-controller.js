/*
  This Controller library is concerned with timer-based functions that are
  kicked off periodicially. These functions maintain connections and state
  of the IPFS node.
*/

// const Schema = require('../adapters/schema')

const DEFAULT_COORDINATION_ROOM = 'psf-ipfs-coordination-001'

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
    }, 30000)

    // Periodically maintain the connection to other coordination peers.
    this.peerTimerHandle = setInterval(async function () {
      await _this.managePeers(thisNode, useCases)
    }, 2 * 50000)

    // Periodically try to connect to problematic peers that advertise as
    // potential circuit relays.
    this.relaySearch = setInterval(async function () {
      await _this.searchForRelays(thisNode, useCases)
    }, 5 * 60000)

    // Periodically ensure we are disconnected from blacklisted peers.
    this.checkBlacklist = setInterval(async function () {
      await _this.blacklist(thisNode, useCases)
    }, 30000)

    // Return handles to the different timers.
    return {
      circuitRelayTimerHandle: this.circuitRelayTimerHandle,
      announceTimerHandle: this.announceTimerHandle,
      peerTimerHandle: this.peerTimerHandle,
      relaySearch: this.relaySearch,
      checkBlacklist: this.checkBlacklist
    }
  }

  // This function is intended to be called periodically by setInterval().
  async manageCircuitRelays (thisNode, useCases) {
    try {
      // Disable the timer while processing is happening.
      clearInterval(this.circuitRelayTimerHandle)

      // Maintain connections to Relays.
      await useCases.relays.connectToCRs(thisNode)

      // Update metrics on Relays.
      await useCases.relays.measureRelays(thisNode)

      const now = new Date()
      this.adapters.log.statusLog(
        1,
        `Renewed connections to all circuit relays at ${now.toLocaleString()}`
      )
    } catch (err) {
      // console.error('Error in timer-controller.js/manageCircuitRelays(): ', err)
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
        orbitdbId: thisNode.orbit.id,

        // TODO: Allow node.js apps to pass a config setting to override this.
        isCircuitRelay: false
      }

      // Generate the announcement message.
      const announceMsgObj = thisNode.schema.announcement(announceObj)
      // console.log(`announceMsgObj: ${JSON.stringify(announceMsgObj, null, 2)}`)

      const announceMsgStr = JSON.stringify(announceMsgObj)

      // Publish the announcement to the pubsub channel.
      await this.adapters.pubsub.publishToPubsubChannel(
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
      // console.error('Error in timer-controller.js/manageAnnouncement(): ', err)
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

      if (this.debugLevel) {
        const now = new Date()
        this.statusLog(
          `status: Renewed connections to all subnet peers at ${now.toLocaleString()}`
        )
      }

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
      await useCases.thisNode.enforceBlacklist()

      this.adapters.log.statusLog(1, 'Finished enforcing blacklist.')

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

module.exports = TimerControllers
