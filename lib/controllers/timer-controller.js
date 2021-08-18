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

    _this = this
  }

  startTimers (thisNode, useCases) {
    // Periodically maintain the connection to Circuit Relays.
    this.circuitRelayTimerHandle = setInterval(function () {
      _this.manageCircuitRelays(thisNode, useCases)
    }, 60000) // One Minute

    // Periodically announce this nodes existance to the network.
    this.announceTimerHandle = setInterval(function () {
      _this.manageAnnouncement(thisNode, useCases)
    }, 22000)

    // Periodically maintain the connection to other coordination peers.
    // this.peerTimerHandle = setInterval(function () {
    //   _this.managePeers()
    // }, 21000) // Twenty Seconds
  }

  // This function is intended to be called periodically by setInterval().
  async manageCircuitRelays (thisNode, useCases) {
    try {
      await useCases.relays.connectToCRs(thisNode)
    } catch (err) {
      console.error('Error in timer-controller.js/manageCircuitRelays(): ', err)
      // Note: Do not throw an error. This is a top-level function.
    }
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

      const now = new Date()
      this.statusLog(
        `status: ${now.toLocaleString()}: Announced self on ${DEFAULT_COORDINATION_ROOM} pubsub channel.`
      )
    } catch (err) {
      console.error('Error in timer-controller.js/manageAnnouncement(): ', err)
      // Note: Do not throw an error. This is a top-level function.
    }
  }
}

module.exports = TimerControllers
