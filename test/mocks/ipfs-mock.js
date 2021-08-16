/*
  A mocked instance of ipfs, for use in unit tests.
*/
const ipfs = {
  id: () => {
    return {
      id: 'myID'
    }
  },
  swarm: {
    connect: async () => {},
    peers: async () => {
      return []
    }
  },
  pubsub: {
    subscribe: async () => {},
    publish: async () => {}
  }
}

module.exports = ipfs
