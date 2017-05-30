/* @flow */
'use strict'

const elegantSpinner = require('elegant-spinner')
const logUpdate = require('log-update')

/* ::
type LogUpdate = {
  (icon: string, message: string): void,
  done : () => void,
  clear : () => void
}
type LogUpdateMessage = () => string
type BeforeStop = (LogUpdate) => void
type StopLogUpdate = (BeforeStop) => void
*/

function logUpdates (
  message /* : LogUpdateMessage */
) /* : StopLogUpdate */ {
  const frame = elegantSpinner()
  const refreshIntervalId = setInterval(() => {
    logUpdate(`${frame()} ${message()}`)
  }, 100)

  return function stop (beforeStop) {
    if (beforeStop) {
      beforeStop(logUpdate)
    }
    clearInterval(refreshIntervalId)
    logUpdate.done()
  }
}

module.exports = logUpdates
