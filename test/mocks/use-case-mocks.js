/*
  Mocked version of the Use Cases library.
*/

class UseCasesMock {
  constructor () {
    this.thisNode = {
      refreshPeerConnections: () => {}
    }
    this.relays = {
      connectToCRs: () => {}
    }
    this.pubsub = {}
  }
}

module.exports = UseCasesMock
