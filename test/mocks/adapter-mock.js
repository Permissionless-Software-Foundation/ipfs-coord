/*
  A mocked version of the adapters library.
*/

class AdaptersMock {
  constructor () {
    this.ipfs = {
      ipfsPeerId: 'fake-id',
      ipfsMultiaddrs: ['addr1', 'addr2'],
      ipfs: {
        pubsub: {
          subscribe: () => {
          }
        }
      },
      getPeers: () => {
      },
      connectToPeer: () => {
      },
      disconnectFromPeer: () => {
      },
      disconnectFromMultiaddr: () => {
      }
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
      },
      bchjs: {
        Util: {
          sleep: () => {
          }
        }
      }
    }

    this.pubsub = {
      subscribeToPubsubChannel: () => {
      },
      publishToPubsubChannel: () => {
      },
      messaging: {
        publishToPubsubChannel: () => {
        },
        generateMsgObj: () => {
        },
        generateAckMsg: () => {
        },
        sendMsg: () => {
        },
        sendAck: () => {
        },
        handleIncomingData: () => {
        },
        _checkIfAlreadyProcessed: () => {
        },
        delMsgFromQueue: () => {
        },
        addMsgToQueue: () => {
        },
        resendMsg: () => {
        },
        waitForAck: () => {
        }
      },
      about: {
        queryAbout: () => {
        }
      }
    }

    this.encryption = {
      encryptMsg: () => {
      }
    }

    this.orbit = {
      createRcvDb: () => {
        return { id: 'fake-orbit-id' }
      },
      connectToPeerDb: () => {
      }
    }

    this.log = {
      statusLog: () => {
      }
    }

    this.gist = {
      getCRList: async () => {
      }
    }
  }
}

module.exports = AdaptersMock
