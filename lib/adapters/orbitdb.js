/*
  Adapters library for interacting with OrbitDB.

  OrbitDB is used by ipfs-coord to publish messages between peers, as opposed
  to publishing these messages directly to the pubsub channel. Publishing them
  through OrbitDB prevents 'dropped' messages.
*/

class OrbitDBAdapter {
  // Open another subnet peers OrbitDB
  async connectToPeerDb (peerId, orbitdbId) {
    try {
      console.log('connectToPeerDb() peerId: ', peerId)
      console.log('connectToPeerDb() orbitdbId: ', orbitdbId)

      // // Exit if invalid input is passed in.
      // if (!peerId || !orbitdbId) return
      //
      // // If this is a new peer that we've never seen before.
      // if (!this.state.peers[peerId]) {
      //   // Create a new OrbitDB instance for this newly discovered peer.
      //   // const orbitdb = await this.OrbitDbClass.createInstance(this.ipfs, {
      //   //   repo: `./orbitdb/${peerId}`
      //   // })
      //   const peerDb = await this.orbitdb.eventlog(orbitdbId)
      //
      //   // Add this new peer to the state.
      //   this.state.peerList.push(peerId)
      //   this.state.peers[peerId] = {
      //     orbitdbId: orbitdbId,
      //     db: peerDb
      //   }
      //   //
      // } else {
      //   // The peer is already known. Ensure we're still tracking the correct DB.
      //
      //   if (orbitdbId !== this.state.peers[peerId].orbitdbId) {
      //     // OrbitDB for the peer has changed. Switch to the new DB.
      //
      //     // Create a new OrbitDB instance for this newly discovered peer.
      //     // const orbitdb = await this.OrbitDbClass.createInstance(this.ipfs, {
      //     //   repo: `./orbitdb/${peerId}`
      //     // })
      //     const peerDb = await this.orbitdb.eventlog(orbitdbId)
      //
      //     // Update the state to point to the new database for this peer.
      //     this.state.peers[peerId] = {
      //       orbitdbId: orbitdbId,
      //       db: peerDb
      //     }
      //   }
      // }
    } catch (err) {
      console.error('Error in adapters/orbitdb.js/connectToPeerDb()')
      throw err
    }
  }
}

module.exports = OrbitDBAdapter
