/*
  A class library defining a peer. Each instance of this class represent a new
  peer that this node knows about and wants to maintain a connection with.
*/

class SubnetPeer {
  constructor (localConfig = {}) {
    this.id = localConfig.id
    if (!this.id) throw new Error('IPFS ID required when creating a new peer')
  }
}

module.exports = SubnetPeer
