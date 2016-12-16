'use strict'

const info = require('./info.js')
const deploy = require('../lib/deploy.js')

module.exports = function (input, flags, logger, options) {
  const blinkMobileIdentity = options.blinkMobileIdentity
  const cwd = options.cwd
  const env = flags.env
  const force = flags.force
  return info(input, flags, logger, options)
    .then(() => deploy.confirm(logger, force))
    .then((confirmation) => {
      if (confirmation) {
        return deploy.authenticate(cwd, blinkMobileIdentity)
          .then((results) => {
            const awsCredentials = results[0]
            const serviceSettings = results[1]
            const accessToken = results[2]
            return deploy.zip(cwd)
              .then((zipFilePath) => deploy.upload(zipFilePath, awsCredentials, serviceSettings))
              .then((bundleKey) => deploy.deploy(bundleKey, accessToken, env, serviceSettings))
          })
      }
    })
}
