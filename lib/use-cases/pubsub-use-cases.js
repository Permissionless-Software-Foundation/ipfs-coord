/*
  A Use Case library for interacting with the Pubsub Entity.
*/

const DEFAULT_COORDINATION_ROOM = 'psf-ipfs-coordination-002'

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
    } catch (err) {
      console.error('Error in pubsub-use-cases.js/initializePubsub()')
      throw err
    }
  }
}

module.exports = PubsubUseCase
