/*
  Mocked version of the Use Cases library.
*/

class UseCasesMock {
  constructor () {
    this.thisNode = {
      refreshPeerConnections: () => {},
      enforceBlacklist: () => {}
    }
    this.relays = {
      connectToCRs: () => {},
      addRelay: () => {},
      measureRelays: () => {}
    }
    this.pubsub = {}
  }
}

module.exports = UseCasesMock
