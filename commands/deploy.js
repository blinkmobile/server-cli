'use strict'

const info = require('./info.js')
const deploy = require('../lib/deploy.js')

module.exports = function (input, flags, logger, options) {
  const blinkMobileIdentity = options.blinkMobileIdentity
  const cwd = options.cwd
  const stage = flags.stage
  const force = flags.force
  return info(input, flags, logger, options)
    .then(() => deploy.confirm(logger, force))
    .then((confirmation) => {
      if (confirmation) {
        return deploy.authenticate(blinkMobileIdentity)
          .then((results) => {
            const awsCredentials = results[0]
            const serviceSettings = results[1]
            return deploy.zip(cwd)
              .then((zipFilePath) => deploy.upload(zipFilePath, awsCredentials, serviceSettings))
              .then((bundleUrl) => deploy.deploy(logger, bundleUrl, stage, serviceSettings))
          })
      }
    })
}
