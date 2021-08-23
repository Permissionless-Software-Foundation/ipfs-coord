/*
  This is an Entity library for creating a representation the 'self' or
  the current IPFS node with the adding information of a BCH wallet and
  any future features added to ipfs-coord.

  There is only one instance of this class library, as there is only one
  IPFS node that is the 'self'.
*/

class ThisNodeEntity {
  // The constructor checks the input data and throws an error if any of the
  // required data is missing.
  constructor (localConfig = {}) {
    this.ipfsId = localConfig.ipfsId
    if (!this.ipfsId) {
      throw new Error('ipfsId required when instantiating thisNode Entity')
    }

    this.ipfsMultiaddrs = localConfig.ipfsMultiaddrs
    if (!this.ipfsMultiaddrs) {
      throw new Error(
        'ipfsMultiaddrs required when instantiating thisNode Entity'
      )
    }

    this.bchAddr = localConfig.bchAddr
    if (!this.bchAddr) {
      throw new Error('bchAddr required when instantiating thisNode Entity')
    }

    this.slpAddr = localConfig.slpAddr
    if (!this.slpAddr) {
      throw new Error('slpAddr required when instantiating thisNode Entity')
    }

    this.publicKey = localConfig.publicKey
    if (!this.publicKey) {
      throw new Error('publicKey required when instantiating thisNode Entity')
    }

    this.type = localConfig.type
    if (!this.type) {
      throw new Error(
        "Node type of 'node.js' or 'browser' required when instantiating thisNode Entity"
      )
    }

    this.orbit = localConfig.orbit
    if (!this.orbit) {
      throw new Error(
        'OrbitDB for private messages required when instantiating thisNode Entity'
      )
    }

    this.schema = localConfig.schema

    // This Node will keep track of peers, relays, and services.
    // The 'List' array tracks the IPFS ID for that peer.
    // The 'Data' array holds instances of the other Entities.
    this.peerList = []
    this.peerData = []
    this.relayData = []
    this.serviceList = []
    this.serviceData = []

    // List of peer IDs that we're following with an orbitDB.
    this.orbitList = []
    // Instances of OrbitDB
    this.orbitData = []
  }
}

module.exports = ThisNodeEntity
