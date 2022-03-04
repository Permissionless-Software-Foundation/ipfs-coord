/*
  Schema templates for sending and recieving messages from other IPFS peers.
*/

class Schema {
  constructor (schemaConfig) {
    this.ipfsId = schemaConfig.ipfsId ? schemaConfig.ipfsId : null

    // Initialize the state with default values.
    this.state = {
      ipfsId: this.ipfsId,
      name: schemaConfig.name ? schemaConfig.name : this.ipfsId,
      type: schemaConfig.type ? schemaConfig.type : null,
      ipfsMultiaddrs: schemaConfig.ipfsMultiaddrs
        ? schemaConfig.ipfsMultiaddrs
        : [],
      isCircuitRelay: schemaConfig.isCircuitRelay
        ? schemaConfig.isCircuitRelay
        : false,
      circuitRelayInfo: schemaConfig.circuitRelayInfo
        ? schemaConfig.circuitRelayInfo
        : {},
      cashAddress: schemaConfig.cashAddress || '',
      slpAddress: schemaConfig.slpAddress || '',
      publicKey: schemaConfig.publicKey || '',
      orbitdbId: schemaConfig.orbitdbId || '',

      // Default API Info. This should be a link to the API documenation, passed
      // in by the consumer of the ipfs-coord library.
      apiInfo: schemaConfig.apiInfo ||
        'You should put an IPFS hash or web URL here to your documentation.'
    }

    // Default JSON-LD Schema
    this.state.announceJsonLd = schemaConfig.announceJsonLd || {
      '@context': 'https://schema.org/',
      '@type': 'WebAPI',
      name: this.state.name,
      description: 'IPFS Coordination Library is used. This app has not been customized.',
      documentation: 'https://www.npmjs.com/package/ipfs-coord',
      provider: {
        '@type': 'Organization',
        name: 'Permissionless Software Foundation',
        url: 'https://PSFoundation.cash'
      }
    }

    this.state.announceJsonLd.identifier = this.ipfsId
  }

  // Returns a JSON object that represents an announement message.
  announcement (announceObj) {
    const now = new Date()

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
      apiVersion: '1.3.2',
      apiInfo: this.state.apiInfo,

      // Add a timestamp
      broadcastedAt: now.toISOString(),

      // IPFS specific information for this node.
      ipfsId: this.state.ipfsId,
      type: this.state.type,
      ipfsMultiaddrs: this.state.ipfsMultiaddrs,
      orbitdb: this.state.orbitdbId,

      // The circuit relays preferred by this node.
      circuitRelays: [],
      isCircuitRelay: this.state.isCircuitRelay,
      circuitRelayInfo: this.state.circuitRelayInfo,

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
      encryptPubKey: this.state.publicKey,

      // Schema.org and JSON Linked Data
      jsonLd: this.state.announceJsonLd
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
      apiVersion: '1.3.2',
      apiInfo: this.state.apiInfo,

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
      },

      // Schema.org and JSON Linked Data
      jsonLd: {
        '@context': 'https://schema.org/',
        '@type': 'CommentAction',
        agent: {
          '@type': 'WebAPI',
          name: this.state.name,
          identifier: this.state.ipfsId
        },
        resultComment: {
          '@type': 'Comment',
          text: message
        }
      }
    }

    return retObj
  }
}

module.exports = Schema
