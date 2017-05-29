/* @flow */
'use strict'

/* ::
import type BlinkMobileIdentity, {
  AWSCredentials
} from '@blinkmobile/bm-identity'

import type {
  BlinkMRCServer
} from '../types.js'
*/

const logSymbols = require('log-symbols')

const logUpdates = require('./utils/log-updates.js')

function authenticate (
  config /* : BlinkMRCServer */,
  blinkMobileIdentity /* : BlinkMobileIdentity */
) /* : Promise<AWSCredentials> */ {
  const stopUpdates = logUpdates(() => 'Authenticating...')
  return blinkMobileIdentity.assumeAWSRole({
    bmProject: config.project,
    command: 'logs'
  })
    .then((results) => {
      stopUpdates((logUpdater) => logUpdater(logSymbols.success, 'Authentication complete!'))
      return results
    })
    .catch((err) => {
      stopUpdates((logUpdater) => logUpdater(logSymbols.error, 'Authentication failed...'))
      return Promise.reject(err)
    })
}

module.exports = {
  authenticate
}
