/*
  Schema templates for sending and recieving messages from other IPFS peers.
*/

class Schema {
  constructor (schemaConfig) {
    // Initialize the state with default values.
    this.state = {
      ipfsId: schemaConfig.ipfsId ? schemaConfig.ipfsId : null,
      type: schemaConfig.type ? schemaConfig.type : null,
      ipfsMultiaddrs: schemaConfig.ipfsMultiaddrs
        ? schemaConfig.ipfsMultiaddrs
        : [],
      isCircuitRelay: schemaConfig.isCircuitRelay
        ? schemaConfig.isCircuitRelay
        : false,
      cashAddress: schemaConfig.cashAddress || '',
      slpAddress: schemaConfig.slpAddress || '',
      publicKey: schemaConfig.publicKey || '',
      orbitdbId: schemaConfig.orbitdbId || ''
    }
  }

  // Returns a JSON object that represents an announement message.
  announcement (announceObj) {
    // Update the orbitdb ID in the state, if it's changed.
    if (
      announceObj &&
      announceObj.orbitdbId &&
      announceObj.orbitdbId !== this.state.orbitdbId
    ) {
      this.state.orbitdbId = announceObj.orbitdbId
    }

    const retObj = {
      apiName: 'ipfs-coord-announce',
      apiVersion: '1.3.0',
      apiInfo: 'ipfs-hash-to-documentation-to-go-here',

      // IPFS specific information for this node.
      ipfsId: this.state.ipfsId,
      type: this.state.type,
      ipfsMultiaddrs: this.state.ipfsMultiaddrs,
      orbitdb: this.state.orbitdbId,

      // The circuit relays preferred by this node.
      circuitRelays: [],
      isCircuitRelay: this.state.isCircuitRelay,

      // Array of objects, containing addresses for different blockchains.
      cryptoAddresses: [
        {
          blockchain: 'BCH',
          type: 'cashAddr',
          address: this.state.cashAddress
        },
        {
          blockchain: 'BCH',
          type: 'slpAddr',
          address: this.state.slpAddress
        }
      ],

      // BCH public key, used for e2e encryption.
      encryptPubKey: this.state.publicKey
    }

    return retObj
  }

  // Returns a JSON object that represents a chat message.
  // Inputs:
  // - message - string text message
  // - handle - the desired display name for the user
  chat (msgObj) {
    const { message, handle } = msgObj

    const retObj = {
      apiName: 'chat',
      apiVersion: '1.3.0',
      apiInfo: 'ipfs-hash-to-documentation-to-go-here',

      // IPFS specific information for this node.
      ipfsId: this.state.ipfsId,
      type: this.state.type,
      ipfsMultiaddrs: this.state.ipfsMultiaddrs,

      // The circuit relays preferred by this node.
      circuitRelays: [],

      // Array of objects, containing addresses for different blockchains.
      cryptoAddresses: [],

      // BCH public key, used for e2e encryption.
      encryptPubKey: '',

      data: {
        message: message,
        handle: handle
      }
    }

    return retObj
  }
}

module.exports = Schema
