/*
  Mocked version of the Use Cases library.
*/

class UseCasesMock {
  constructor () {
    this.thisNode = {
      refreshPeerConnections: () => {}
    }
    this.relays = {
      connectToCRs: () => {},
      addRelay: () => {}
    }
    this.pubsub = {}
  }
}

module.exports = UseCasesMock
