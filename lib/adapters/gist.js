/*
  This adapter library is concerned with interfacing with the GitHub Gist API.
  It's used to download a more easily maintained list of Circuit Relays
  operated by members of the PSF.
*/

const axios = require('axios')

class Gist {
  constructor (localConfig = {}) {
    this.axios = axios
  }

  // Retrieve a JSON file from a GitHub Gist
  async getCRList () {
    try {
      // https://gist.github.com/christroutner/e818ecdaed6c35075bfc0751bf222258
      const gistUrl =
        'https://api.github.com/gists/e818ecdaed6c35075bfc0751bf222258'

      // Retrieve the gist from github.com.
      const result = await this.axios.get(gistUrl)
      // console.log('result.data: ', result.data)

      // Get the current content of the gist.
      const content = result.data.files['psf-circuit-relays.json'].content
      // console.log('content: ', content)

      // Parse the JSON string into an Object.
      const object = JSON.parse(content)
      // console.log('object: ', object)

      return object
    } catch (err) {
      console.error('Error in getCRList()')
      throw err
    }
  }
}

module.exports = Gist
