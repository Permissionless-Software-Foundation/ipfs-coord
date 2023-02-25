/*
  A Use Case library for interacting with the Pubsub Entity.
*/

const DEFAULT_COORDINATION_ROOM = 'psf-ipfs-coordination-002'
const BCH_COINJOIN_ROOM = 'bch-coinjoin-001'

class PubsubUseCase {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Must inject instance of adapters when instantiating Pubsub Use Cases library.'
      )
    }
    this.controllers = localConfig.controllers
    if (!this.controllers) {
      throw new Error(
        'Must inject instance of controllers when instantiating Pubsub Use Cases library.'
      )
    }
    this.thisNodeUseCases = localConfig.thisNodeUseCases
    if (!this.thisNodeUseCases) {
      throw new Error(
        'thisNode use cases required when instantiating Pubsub Use Cases library.'
      )
    }

    // Allow the app to override the default CoinJoin pubsub handler.
    this.coinjoinPubsubHandler = () => true
    if (localConfig.coinjoinPubsubHandler) this.coinjoinPubsubHandler = localConfig.coinjoinPubsubHandler
  }

  // Connect to the default pubsub rooms.
  async initializePubsub (thisNode) {
    try {
      // Subscribe to the coordination channel, where new peers announce themselves
      // to the network.
      await this.adapters.pubsub.subscribeToPubsubChannel(
        DEFAULT_COORDINATION_ROOM,
        // this.adapters.peers.addPeer
        this.thisNodeUseCases.addSubnetPeer,
        thisNode
      )

      // Subscribe to the BCH CoinJoin coordination channel. This code is here
      // so that Circuit Relays automatically subscribe to the channel and
      // relay the messages.
      await this.adapters.pubsub.subscribeToPubsubChannel(
        BCH_COINJOIN_ROOM,
        this.coinjoinPubsubHandler,
        thisNode
      )
    } catch (err) {
      console.error('Error in pubsub-use-cases.js/initializePubsub()')
      throw err
    }
  }
}

module.exports = PubsubUseCase
