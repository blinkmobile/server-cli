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

const archiver = require('archiver')
const chalk = require('chalk')
const inquirer = require('inquirer')
const logSymbols = require('log-symbols')
const logUpdates = require('./utils/log-updates.js')
const temp = require('temp').track()

const EXT = 'zip'

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

function zip (
  cwd /* : string */
) /* : Promise<void> */ {
  const stopUpdates = logUpdates(() => 'Compressing project...')
  return new Promise((resolve, reject) => {
    const fail = (err) => {
      stopUpdates((logUpdater) => logUpdater(logSymbols.error, 'Compressing project...'))
      reject(err)
    }

    const archive = archiver.create(EXT, {})
    archive.on('error', (err) => fail(err))

    const output = temp.createWriteStream({suffix: `.${EXT}`})
    output.on('finish', () => {
      stopUpdates((logUpdater) => logUpdater(logSymbols.success, 'Compression complete!'))
      resolve(output.path)
    })
    output.on('error', (err) => fail(err))

    archive.pipe(output)
    archive.glob('**/*', {
      cwd,
      nodir: true
      // Still unsure on whether or not this will be needed.
      // If projects have private packages, we can not ignore node_modules
      // as the server cli service will not be able to download them.
      // ignore: ['node_modules/**']
    })
    archive.finalize()
  })
}

module.exports = {
  authenticate,
  confirm,
  zip
}
