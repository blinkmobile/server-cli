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
  getServiceSettings : () => Promise<AWSCredentials>,
  getAccessToken : () => Promise<string>
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
const request = require('request')
const temp = require('temp').track()

const EXT = 'zip'

function authenticate (
  blinkMobileIdentity /* : BlinkMobileIdentity */
) /* : Promise<BMServerAuthentication> */ {
  const stopUpdates = logUpdates(() => 'Authenticating...')
  return Promise.all([
    blinkMobileIdentity.assumeAWSRole(),
    blinkMobileIdentity.getServiceSettings(),
    blinkMobileIdentity.getAccessToken()
  ])
    .then((results) => {
      stopUpdates((logUpdater) => logUpdater(logSymbols.success, 'Authentication complete!'))
      return results
    })
    .catch((err) => {
      stopUpdates((logUpdater) => logUpdater(logSymbols.error, 'Authentication failed...'))
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
  bundleKey /* : string */,
  accessToken /* : string */,
  stage /* : string */,
  serviceSettings /* : BMServerSettings */
) /* : Promise<void> */ {
  const stopUpdates = logUpdates(() => `Deploying project - this may take several minutes...`)
  return new Promise((resolve, reject) => {
    request({
      auth: {
        bearer: accessToken
      },
      json: {
        bundleBucket: serviceSettings.bucket,
        bundleKey,
        targetOrigin: 'https://example.com' // TEMP, needed for authorisation
      },
      method: 'POST',
      timeout: 9000000, // TEMP, dont want timeouts
      url: `${serviceSettings.deploymentUrl}`
    }, (err, response, data) => stopUpdates((logUpdater) => {
      if (err) {
        logUpdater(logSymbols.error, 'Deployment failed...')
        reject(err)
        return
      }
      if (response.statusCode !== 200) {
        logUpdater(logSymbols.error, `Deployment failed - ${data.statusCode} ${data.error}`)
        reject(new Error(data.message))
        return
      }
      logUpdater(logSymbols.success, `Deployment complete - Base Url: ${data.baseUrl}`)
      resolve()
    }))
  })
}

function upload (
  zipFilePath /* : string */,
  awsCredentials /* : AWSCredentials */,
  serviceSettings /* : BMServerSettings */
) /* : Promise<void> */ {
  const src = fs.createReadStream(zipFilePath)
  const key = path.basename(zipFilePath)
  const s3 = new AWS.S3(awsCredentials)
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
        logUpdater(logSymbols.error, `Transfer failed: ${progress}%`)
        return
      }
      logUpdater(logSymbols.success, 'Transfer complete!')
      resolve(data.Key)
    }))
  })
}

function zip (
  cwd /* : string */
) /* : Promise<string> */ {
  const archive = archiver.create(EXT, {})
  const output = temp.createWriteStream({suffix: `.${EXT}`})
  archive.pipe(output)
  archive.glob('**/*', {
    cwd,
    nodir: true,
    dot: true,
    ignore: [
      '.git/**'
      // Still unsure on whether or not this will be needed.
      // If projects have private packages, we can not ignore node_modules
      // as the server cli service will not be able to download them.
      // 'node_modules/**'
    ]
  })
  archive.finalize()
  const stopUpdates = logUpdates(() => 'Compressing project...')
  return new Promise((resolve, reject) => {
    const fail = (err) => {
      stopUpdates((logUpdater) => logUpdater(logSymbols.error, 'Compression failed...'))
      reject(err)
    }

    archive.on('error', (err) => fail(err))
    output.on('error', (err) => fail(err))
    output.on('finish', () => {
      stopUpdates((logUpdater) => logUpdater(logSymbols.success, 'Compression complete!'))
      resolve(output.path)
    })
  })
}

module.exports = {
  authenticate,
  confirm,
  deploy,
  upload,
  zip
}
