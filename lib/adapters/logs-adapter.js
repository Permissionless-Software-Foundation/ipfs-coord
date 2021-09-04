/*
  Controls the verbosity of the status log

  Default verbosity is zero, which is the least verbose messages.
  As the value increases, the amount of messages also increases.

  0 - Normal logs
  1 - More information on connections and error connections.
  2 - Verbose Error messages
  3 - Error messages about connections.
*/

const util = require('util')

class LogsAdapter {
  constructor (localConfig = {}) {
    // Default to debugLevel 0 if not specified.
    this.debugLevel = localConfig.debugLevel
    if (!this.debugLevel) this.debugLevel = 0

    this.logHandler = localConfig.statusLog
    if (!this.logHandler) {
      throw new Error(
        'statusLog must be specified when instantiating Logs adapter library.'
      )
    }
  }

  // Print out the data, if the log level is less than or equal to the debug
  // level set when instantiating the library.
  statusLog (level, str, object) {
    if (level <= this.debugLevel) {
      if (object === undefined) {
        this.logHandler('status: ' + str)
      } else {
        this.logHandler('status: ' + str + ' ' + util.inspect(object))
      }
    }
  }
}

module.exports = LogsAdapter
