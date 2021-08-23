/*
  Use cases for interacting with subnet peer nodes.
*/

class PeerUseCases {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Must inject instance of adapters when instantiating Peer Use Cases library.'
      )
    }
    this.controllers = localConfig.controllers
    if (!this.controllers) {
      throw new Error(
        'Must inject instance of controllers when instantiating Peer Use Cases library.'
      )
    }
  }

  // Publish a string of text to another peers OrbitDB recieve database.
  // orbitdbId input is optional.
  async sendPrivateMessage (peerId, str, thisNode) {
    try {
      // console.log('sendToDb() peerId: ', peerId)
      // console.log('sendToDb() str: ', str)

      // const peer = this.peers.state.peers[peerId]
      // console.log('thisNode.peerData: ', thisNode.peerData)
      const peerData = thisNode.peerData.filter(x => x.from === peerId)

      // Throw an error if the peer matching the peerId is not found.
      if (peerData.length === 0) {
        throw new Error(`Data for peer ${peerId} not found.`)
      }

      // Encrypt the string with the peers public key.
      const encryptedStr = await this.adapters.encryption.encryptMsg(
        peerData[0],
        str
      )

      const now = new Date()

      const peerDb = thisNode.orbitData.filter(x => x.ipfsId === peerId)
      // console.log('peerDb: ', peerDb)

      // Throw an error if peer database was not found.
      if (peerDb.length === 0) {
        throw new Error(`OrbitDB for peer ${peerId} not found.`)
      }

      const db = peerDb[0].db

      const dbObj = {
        from: peerId,
        data: encryptedStr,
        timestamp: now.toISOString()
      }
      // console.log(`dbObj: ${JSON.stringify(dbObj, null, 2)}`)

      // Add the encrypted message to the peers OrbitDB.
      await db.add(dbObj)

      return true
    } catch (err) {
      console.error('Error in peer-use-cases.js/sendPrivateMessage()')
      throw err
    }
  }
}

module.exports = PeerUseCases
