/*
  This Controller library is concerned with timer-based functions that are
  kicked off periodicially. These functions maintain connections and state
  of the IPFS node.
*/

let _this

class TimerControllers {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters required when instantiating Timer Controllers'
      )
    }

    _this = this
  }

  startTimers (thisNode, useCases) {
    // Periodically maintain the connection to Circuit Relays.
    this.circuitRelayTimerHandle = setInterval(function () {
      _this.manageCircuitRelays(thisNode, useCases)
    }, 60000) // One Minute

    // Periodically maintain the connection to other coordination peers.
    // this.peerTimerHandle = setInterval(function () {
    //   _this.managePeers()
    // }, 21000) // Twenty Seconds

    // Periodically announce this nodes existance to the network.
    // this.announceTimerHandle = setInterval(function () {
    //   _this.manageAnnouncement()
    // }, 22000)
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
}

module.exports = TimerControllers
