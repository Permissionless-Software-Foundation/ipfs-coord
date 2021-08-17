/*
  Use Cases library for the thisNode entity.
*/

const ThisNodeEntity = require('../entities/this-node-entity')

class ThisNodeUseCases {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Must inject instance of adapters when instantiating thisNode Use Cases library.'
      )
    }

    this.controllers = localConfig.controllers
    if (!this.controllers) {
      throw new Error(
        'Must inject instance of controllers when instantiating thisNode Use Cases library.'
      )
    }
  }

  // Create an instance of the 'self' of thisNode. This function aggregates
  // a lot of information pulled from the different adapters.
  async createSelf (initValues = {}) {
    const selfData = {
      type: initValues.type
    }

    // Aggregate data from the IPFS adapter.
    selfData.ipfsId = this.adapters.ipfs.state.ipfsPeerId
    selfData.ipfsMultiaddrs = this.adapters.ipfs.state.ipfsMultiaddrs

    // Aggregate data from the BCH adapter.
    const bchData = await this.adapters.bch.generateBchId()
    selfData.bchAddr = bchData.cashAddress
    selfData.slpAddr = bchData.slpAddress
    selfData.publicKey = bchData.publicKey
    // selfData.mnemonic = this.adapters.bch.mnemonic

    // console.log('selfData: ', selfData)

    const thisNode = new ThisNodeEntity(selfData)

    return thisNode
  }
}

module.exports = ThisNodeUseCases
