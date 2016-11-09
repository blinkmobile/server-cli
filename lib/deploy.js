/* @flow */
'use strict'

/* ::
type AWSCredentials = {
  accessKeyId : string,
  secretAccessKey : string,
  sessionToken : string
}
type BMServerSettings = {
  analyticsKeys : any,
  bucket : string,
  deploymentUrl : string,
  region: string
}
type BlinkMobileIdentity = {
  assumeAWSRole : () => Promise<AWSCredentials>,
  getServiceSettings : () => Promise<AWSCredentials>
}
type BMServerAuthentication = [
  AWSCredentials,
  BMServerSettings
]
*/

const chalk = require('chalk')
const inquirer = require('inquirer')
const logSymbols = require('log-symbols')
const logUpdates = require('./utils/log-updates.js')

function authenticate (
  blinkMobileIdentity /* : BlinkMobileIdentity */
) /* : Promise<BMServerAuthentication> */ {
  const stopUpdates = logUpdates(() => 'Authenticating...')
  return Promise.all([
    blinkMobileIdentity.assumeAWSRole(),
    blinkMobileIdentity.getServiceSettings()
  ])
    .then((results) => {
      stopUpdates((logUpdater) => logUpdater(logSymbols.success, 'Authenticated!'))
      return results
    })
    .catch((err) => {
      stopUpdates((logUpdater) => logUpdater(logSymbols.error, 'Authenticating...'))
      return Promise.reject(err)
    })
}

function confirm (
  logger /* : any */,
  force /* : boolean */
) /* : Promise<boolean> */ {
  if (force) {
    return Promise.resolve(true)
  }
  logger.log(chalk.yellow(`
Please check configuration before continuing
`))
  const promptQuestions = [{
    type: 'confirm',
    name: 'confirmation',
    message: 'Would you like to continue: [Y]'
  }]
  return inquirer.prompt(promptQuestions)
    .then(results => results.confirmation)
}

module.exports = {
  authenticate,
  confirm
}
