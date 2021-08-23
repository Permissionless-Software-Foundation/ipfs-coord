/*
  A library for end-to-end encryption (e2ee). This will largely be a wrapper
  for existing encryption libraries.
*/

const BchEncrypt = require('bch-encrypt-lib/index.js')

class EncryptionAdapter {
  constructor (localConfig = {}) {
    // Dependency injection
    this.bch = localConfig.bch
    if (!this.bch) {
      throw new Error(
        'Must pass in an instance of bch Adapter when instantiating the encryption Adapter library.'
      )
    }
    this.bchjs = this.bch.bchjs // Copy of bch-js

    this.bchEncrypt = new BchEncrypt({ bchjs: this.bchjs })
    // this.ipfs = encryptConfig.ipfs
    // this.orbitdb = encryptConfig.orbitdb
  }

  // Decrypt incoming messages on the pubsub channel for this node.
  async decryptMsg (msg) {
    try {
      // console.log('decryptMsg msgObj: ', msg)

      const privKey = await this.bch.generatePrivateKey()
      // console.log(`privKey: ${privKey}`)

      const decryptedHexStr = await this.bchEncrypt.encryption.decryptFile(
        privKey,
        msg
      )
      // console.log(`decryptedHexStr ${decryptedHexStr}`)

      const decryptedBuff = Buffer.from(decryptedHexStr, 'hex')

      const decryptedStr = decryptedBuff.toString()
      // console.log(`decryptedStr: ${decryptedStr}`)

      return decryptedStr
    } catch (err) {
      // Exit quietly if the issue is a 'Bad MAC'. This seems to be a startup
      // issue.
      if (err.message.includes('Bad MAC')) {
        throw new Error(
          'Bad MAC. Could not decrypt message. Peer may have stale encryption data for this node.'
        )
        // return ''
      }

      console.error('Error in decryptMsg()')
      throw err
    }
  }

  // Returns an encrypted hexidecimal string derived from an input message
  // (string), encrypted with the public key of a peer.
  async encryptMsg (peer, msg) {
    try {
      // console.log('peer: ', peer)

      const pubKey = peer.data.encryptPubKey
      // console.log('msg to encrypt: ', msg)
      // console.log(`Encrypting with public key: ${pubKey}`)

      const msgBuf = Buffer.from(msg, 'utf8').toString('hex')

      const encryptedHexStr = await this.bchEncrypt.encryption.encryptFile(
        pubKey,
        msgBuf
      )

      return encryptedHexStr
    } catch (err) {
      console.error('Error in encryption.js/encryptMsg()')
      throw err
    }
  }

  // Send an e2e encrypted message to a peer.
  // async sendEncryptedMsg (peer, msg) {
  //   try {
  //     // console.log('sendEncryptedMsg peer: ', peer)
  //     // console.log('sendEncryptedMsg msg: ', msg)
  //
  //     // const channel = peer.ipfsId.toString()
  //     const pubKey = peer.encryptPubKey
  //     // const orbitdbId = peer.orbitdb
  //
  //     const msgBuf = Buffer.from(msg, 'utf8').toString('hex')
  //     // console.log(`msgBuf: ${msgBuf}`)
  //
  //     const encryptedHexStr = await this.bchEncrypt.encryption.encryptFile(
  //       pubKey,
  //       msgBuf
  //     )
  //     console.log(`encryptedHexStr: ${encryptedHexStr}`)
  //
  //     // const msgBuf2 = Buffer.from(encryptedHexStr, 'hex')
  //
  //     // Publish the message to the pubsub channel.
  //     // TODO: This will be deprecated in the future in favor of publishing to
  //     // the peers OrbitDB.
  //     // await this.ipfs.pubsub.publish(channel, msgBuf2)
  //
  //     // if (orbitdbId) {
  //     //   console.log(
  //     //     `Ready to send encrypted message to peer ${channel} on orbitdb ID ${orbitdbId}`
  //     //   )
  //     //   await this.orbitdb.sendToDb(channel, encryptedHexStr, orbitdbId)
  //     // }
  //   } catch (err) {
  //     console.error('Error in sendEncryptedMsg()')
  //     throw err
  //   }
  // }
}

module.exports = EncryptionAdapter
