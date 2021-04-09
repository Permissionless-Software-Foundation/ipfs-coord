/*
  The top-level IPFS library. This library will encapsulate the following
  libraries:
  - circuit-relay
  - pubsub
  - peers
  - schema
  - encryption

  Initialization of this library flows like this:
  - constructor()
  - initIpfs()
  - getNodeInfo()
    - isInitialized set to true
  - Start management timers
  - Setup circuit relays
  - Subscribe to pubsub channels
    - isReady set to true
*/

// Local libraries.
const CircuitRelay = require('./circuit-relay')
const PubSub = require('./pubsub')
const Schema = require('./schema')
const Peers = require('./peers')
const Encrypt = require('./encryption')
const OrbitDB = require('./orbitdb')

const DEFAULT_COORDINATION_ROOM = 'psf-ipfs-coordination-001'

// A local global that maintains scope to the instance of this Class.
let _this

class IPFS {
  constructor (ipfsConfig) {
    // Input Validation
    if (!ipfsConfig.ipfs) {
      throw new Error(
        'An instance of IPFS must be passed when instantiating the ipfs-lib library.'
      )
    }
    if (!ipfsConfig.type) {
      throw new Error('The type of IPFS node must be specified.')
    }

    // Pass-through config settings.
    this.ipfs = ipfsConfig.ipfs
    this.bch = ipfsConfig.bch

    // Define the log handlers.
    this.statusLog = ipfsConfig.statusLog
    this.privateLog = ipfsConfig.privateLog

    // Initialize the state of this instance.
    this.state = {
      isInitialize: false, // IPFS node is initialized, but not ready.
      isReady: false, // IPFS node is initialized and ready.
      type: ipfsConfig.type,
      isCircuitRelay: ipfsConfig.isCircuitRelay
        ? ipfsConfig.isCircuitRelay
        : false
    }

    // Instantiate the libraries that *do not* require async data.
    this.cr = new CircuitRelay({
      ipfs: this.ipfs,
      type: this.state.type,
      statusLog: this.statusLog
    })

    this.orbitdb = new OrbitDB({
      privateLog: this.privateLog
    })

    this.peers = new Peers({
      ipfs: this.ipfs,
      cr: this.cr,
      statusLog: this.statusLog,
      orbitdb: this.orbitdb
    })

    this.pubsub = new PubSub({
      ipfs: this.ipfs,
      statusLog: this.statusLog,
      peers: this.peers
    })

    // _this is the handle to the instance of this class.
    _this = this

    // Instantiate the libraries that *do* require async data.
    // Constructors can't await, so initIpfs() kicks off all the async functions.
    this.startTimers()
  }

  // Initialization function that kicks off timer-intervals that attempt to
  // keep this IPFS node connected to the network and coordinated with peers
  // and circuit relays.
  async startTimers () {
    try {
      // Initialize the IPFS node, set the initial state, and instantiate the
      // libraries that require asynchronous data.
      // Wait until this completes
      await this.initAsyncLibs()

      // START timer interval managers.
      // Periodically maintain the connection to Circuit Relays.
      this.circuitRelayTimerHandle = setInterval(function () {
        _this.manageCircuitRelays()
      }, 60000) // One Minute

      // Periodically maintain the connection to other coordination peers.
      this.peerTimerHandle = setInterval(function () {
        _this.managePeers()
      }, 21000) // Twenty Seconds

      // Periodically announce this nodes existance to the network.
      this.announceTimerHandle = setInterval(function () {
        _this.manageAnnouncement()
      }, 22000)
      // END timer interval managers.

      // Wait a short delay for the IPFS node to initialize.
      await this.sleep(5000)

      // START first (one-time) management calls.
      // Kick off the first call to handle circuit relays and peers.
      _this.manageCircuitRelays()

      // Subscribe to initial pubsub channels.
      _this.managePubSubChannels()
      // END first (one-time) management calls.

      this.state.isReady = true
    } catch (err) {
      console.error('Error in ipfs-lib.js/initIpfs()')
      throw err
    }
  }

  // This function is called during instantiation. It will set the `isInitialize`
  // flag in the state, once the IPFS node has intialized.
  // It instantiates all the dependencies that require async data.
  async initAsyncLibs () {
    try {
      // Wait until the IPFS creation Promise has resolved, and the node is
      // fully instantiated.
      this.ipfs = await this.ipfs

      // Get ID information about this IPFS node.
      const id2 = await this.ipfs.id()
      this.state.ipfsPeerId = id2.id

      // Get multiaddrs that can be used to connect to this node.
      const addrs = id2.addresses.map(elem => elem.toString())
      this.state.ipfsMultiaddrs = addrs

      // Signal to the rest of the library that the IPFS node is initialized and
      // ready to start coordination.
      this.state.isInitialize = true

      // Generate BCH address and public key for e2e encryption.
      const bchId = await this.bch.generateBchId()

      // Instantiate OrbitDB
      this.orbitdbId = await this.orbitdb.createRcvDb(this.ipfs)
      this.statusLog(`This nodes Orbit DB id: ${this.orbitdbId}`)

      // Now that the IPFS node ID and other info is known, the Schema lib
      // can be instantiated.
      const schemaConfig = {
        ipfsId: this.state.ipfsPeerId,
        type: this.state.type,
        ipfsMultiaddrs: this.state.ipfsMultiaddrs,
        isCircuitRelay: this.state.isCircuitRelay,
        cashAddress: bchId.cashAddress,
        slpAddress: bchId.slpAddress,
        publicKey: bchId.publicKey,
        orbitdbId: this.orbitdbId
      }
      this.schema = new Schema(schemaConfig)

      // Instantiate the encryption library.
      const encryptConfig = {
        ipfsId: this.state.ipfsPeerId,
        bchLib: this.bch,
        ipfs: this.ipfs
      }
      this.encrypt = new Encrypt(encryptConfig)

      // Pass dependencies to the orbitdb library.
      const orbitConfigObj = {
        peers: this.peers,
        encrypt: this.encrypt
      }
      this.orbitdb.addDeps(orbitConfigObj)

      this.statusLog('IPFS state: ', this.state)
    } catch (err) {
      console.error('Error in ipfs-lib.js/getNodeInfo()')
      throw err
    }
  }

  // This function is intended to be called periodically by setInterval().
  async manageCircuitRelays () {
    try {
      // Quietly exit if the IPFS node has NOT been initialized.
      if (!this.state.isInitialize) return

      await this.cr.connectToCRs()
    } catch (err) {
      console.error('Error in ipfs-lib.js/manageCircuitRelays(): ', err)
      // Note: Do not throw an error. This is a top-level function.
    }
  }

  // This function is intended to be called periodically by setInterval().
  async managePeers () {
    try {
      // Quietly exit if the IPFS node has not been initialized.
      if (!this.state.isInitialize) return

      // this.statusLog('managePeers')
      await this.peers.refreshPeerConnections()
    } catch (err) {
      console.error('Error in ipfs-lib.js/managePeers(): ', err)
      // Note: Do not throw an error. This is a top-level function.
    }
  }

  // This function is intended to be called periodically by setInterval().
  // Announce the existance of this node to the network.
  async manageAnnouncement () {
    try {
      // Quietly exit if the IPFS node has not been initialized.
      if (!this.state.isInitialize) return

      // Get the information needed for the announcement.
      const announceObj = {
        ipfsId: this.state.ipfsPeerId,
        ipfsMultiaddrs: this.state.ipfsMultiaddrs,
        type: this.state.type,
        orbitdbId: this.orbitdbId,

        // TODO: Allow node.js apps to pass a config setting to override this.
        isCircuitRelay: false
      }

      // Generate the announcement message.
      const announceMsgObj = this.schema.announcement(announceObj)
      // console.log(`announceMsgObj: ${JSON.stringify(announceMsgObj, null, 2)}`)

      const announceMsgStr = JSON.stringify(announceMsgObj)

      // Publish the announcement to the pubsub channel.
      await this.pubsub.publishToPubsubChannel(
        DEFAULT_COORDINATION_ROOM,
        announceMsgStr
      )

      const now = new Date()
      this.statusLog(
        `${now.toLocaleString()}: Announced self on ${DEFAULT_COORDINATION_ROOM} pubsub channel.`
      )
    } catch (err) {
      console.error('Error in ipfs-lib.js/manageAnnouncement(): ', err)
      // Note: Do not throw an error. This is a top-level function.
    }
  }

  // This function is NOT intended to be called periodically.
  // This function only needs to be called once to set up the initial pubsub
  // channel subscriptions.
  async managePubSubChannels () {
    try {
      // If the IPFS node has not been initialized, wait 5 seconds and try again.
      if (!this.state.isInitialize) {
        await this.sleep(5000)
        await this.managePubSubChannels()
        return
      }

      // Subscribe to the coordination channel, where new peers announce themselves
      // to the network.
      this.pubsub.subscribeToPubsubChannel(
        DEFAULT_COORDINATION_ROOM,
        this.peers.addPeer
      )

      // Subscribe to a pubsub channel with the same name as this IPFS ID.
      // It's assumed that all messages on this channel are e2e encrypted, so
      // bypass the normal pubsub channel handler and send the message straight
      // to the encryption library.
      // this.ipfs.pubsub.subscribe(
      //   this.state.ipfsPeerId.toString(),
      //   async msg => {
      //     try {
      //       console.log(`Encrypted message recieved from ${msg.from}`)
      //       // console.log(`Attempting to decrypt this message: ${JSON.stringify(msg, null, 2)}`)
      //
      //       const from = msg.from
      //
      //       const decryptedStr = await this.encrypt.decryptMsg(msg)
      //
      //       // Pipe the decrypted messages to the private log.
      //       this.privateLog(`pubsub ${from}: ${decryptedStr}`)
      //     } catch (err) {
      //       console.error('Error in personal pubsub channel: ', err)
      //     }
      //   }
      // )

      this.statusLog('managePubSubChannels was called.')
    } catch (err) {
      console.error('Error in ipfs-lib.js/managePubSubChannels(): ', err)
      // Note: Do not throw an error. This is a top-level function.
    }
  }

  // Promise-based delay
  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

module.exports = IPFS
