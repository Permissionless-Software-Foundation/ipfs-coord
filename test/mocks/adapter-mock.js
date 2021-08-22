/*
  A mocked version of the adapters library.
*/

class AdaptersMock {
  constructor () {
    this.ipfs = {
      state: {
        ipfsPeerId: 'fake-id',
        ipfsMultiaddrs: ['addr1', 'addr2']
      },
      ipfs: {
        pubsub: {
          subscribe: () => {}
        }
      },
      getPeers: () => {},
      connectToPeer: () => {}
    }
    this.bchjs = {}
    this.type = 'node.js'
    this.bch = {
      generateBchId: () => {
        return {
          cashAddress: 'cashAddress',
          slpAddress: 'slpAddress',
          publicKey: 'public-key'
        }
      }
    }
    this.pubsub = {
      subscribeToPubsubChannel: () => {}
    }
    this.encryption = {}
    this.orbit = {
      createRcvDb: () => {
        return { id: 'fake-orbit-id' }
      },
      connectToPeerDb: () => {}
    }
  }
}

module.exports = AdaptersMock
