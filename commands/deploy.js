/* @flow */
'use strict'

/* ::
import type {
  CLIFlags,
  CLIOptions
} from '../types.js'
*/

const info = require('./info.js')
const deploy = require('../lib/deploy.js')

module.exports = function (
  input /* : Array<string> */,
  flags /* : CLIFlags */,
  logger /* : typeof console */,
  options /* : CLIOptions */
) /* : Promise<void> */ {
  const blinkMobileIdentity = options.blinkMobileIdentity
  const cwd = flags.cwd
  const env = flags.env
  const force = flags.force
  return info(input, flags, logger, options)
    .then(() => deploy.confirm(logger, force, env))
    .then((confirmation) => {
      if (confirmation) {
        return deploy.authenticate(cwd, blinkMobileIdentity, env)
          .then((results) => {
            const awsCredentials = results[0]
            const accessToken = results[1]
            return deploy.zip(cwd)
              .then((zipFilePath) => deploy.upload(zipFilePath, awsCredentials))
              .then((bundleKey) => deploy.deploy(bundleKey, accessToken, env))
          })
      }
    })
}
