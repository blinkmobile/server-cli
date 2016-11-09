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

const fs = require('fs')
const path = require('path')

const archiver = require('archiver')
const AWS = require('aws-sdk')
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

function deploy (
  logger /* : any */,
  bundleUrl /* : string */,
  stage /* : string */,
  serviceSettings /* : BMServerSettings */
) /* : Promise<void> */ {
  // TODO Call Server CLI Service to deploy
  logger.log(logSymbols.success, `
Deployed:
  Bundle Url: ${bundleUrl}

To:
  Deployment Url: ${serviceSettings.deploymentUrl}
  Stage: ${stage}
  Target Origin: https://example.com
`)
  return Promise.resolve()
}

function upload (
  zipFilePath /* : string */,
  awsCredentials /* : AWSCredentials */,
  serviceSettings /* : BMServerSettings */
) /* : Promise<void> */ {
  const src = fs.createReadStream(zipFilePath)
  const key = path.basename(zipFilePath)
  AWS.config.region = serviceSettings.region
  const s3 = new AWS.S3(Object.assign({}, {region: serviceSettings.region}, awsCredentials))
  const params = {
    Bucket: serviceSettings.bucket,
    Key: key,
    Body: src
  }

  const manager = s3.upload(params)
  let progress = 0
  manager.on('httpUploadProgress', uploadProgress => {
      // Note that total may be undefined until the payload size is known.
      // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html
    if (uploadProgress.total) {
      progress = Math.floor(uploadProgress.loaded / uploadProgress.total * 100)
    }
  })

  const stopUpdates = logUpdates(() => `Transferring project: ${progress}%`)
  return new Promise((resolve, reject) => {
    manager.send((err, data) => stopUpdates((logUpdater) => {
      if (err) {
        reject(err)
        logUpdater(logSymbols.error, `Transferring project: ${progress}%`)
        return
      }
      logUpdater(logSymbols.success, 'Transfer complete!')
      resolve(data.Location)
    }))
  })
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
  deploy,
  upload,
  zip
}
