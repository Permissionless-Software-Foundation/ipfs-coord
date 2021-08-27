/*
  A mocked instance of ipfs, for use in unit tests.
*/
const ipfs = {
  id: () => {
    return {
      id: 'myID',
      addresses: ['addr1', 'addr2']
    }
  },
  swarm: {
    connect: async () => {},
    peers: async () => {
      return []
    },
    disconnect: async () => {}
  },
  pubsub: {
    subscribe: async () => {},
    publish: async () => {}
  }
}

module.exports = ipfs
