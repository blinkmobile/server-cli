/* @flow */
'use strict'

/* ::
import type BlinkMobileIdentity, {
  AWSCredentials
} from '@blinkmobile/bm-identity'

import type {
  BMServerSettings
} from '../types.js'

type BMServerAuthentication = [
  AWSCredentials,
  BMServerSettings,
  string | void
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
const scope = require('./scope.js')
const temp = require('temp').track()

const EXT = 'zip'

function authenticate (
  cwd /* : string */,
  blinkMobileIdentity /* : BlinkMobileIdentity */
) /* : Promise<BMServerAuthentication> */ {
  const stopUpdates = logUpdates(() => 'Authenticating...')
  return scope.read(cwd)
    .then((config) => ({
      bmProject: config.project,
      command: 'deploy'
    }))
    .then((parameters) => Promise.all([
      blinkMobileIdentity.assumeAWSRole(parameters),
      blinkMobileIdentity.getServiceSettings(parameters),
      blinkMobileIdentity.getAccessToken()
    ]))
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
  logger /* : typeof console */,
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
  accessToken /* : string | void */,
  env /* : string */,
  serviceSettings /* : BMServerSettings */
) /* : Promise<void> */ {
  const stopUpdates = logUpdates(() => `Deploying project - this may take several minutes...`)
  return new Promise((resolve, reject) => {
    // Make request to start deployment
    const baseRequest = request.defaults({
      auth: {
        bearer: accessToken
      },
      baseUrl: `${serviceSettings.serviceOrigin}/v1`,
      json: true
    })
    baseRequest.post('/deploy', {
      json: {
        bundleBucket: serviceSettings.bucket,
        bundleKey,
        env
      }
    }, (err, deployResponse, deployData) => {
      // Ensure deployment started successfully
      if (err) {
        stopUpdates((logUpdater) => logUpdater(logSymbols.error, 'Deployment failed...'))
        reject(err)
        return
      }
      if (deployResponse.statusCode !== 202) {
        stopUpdates((logUpdater) => logUpdater(logSymbols.error, `Deployment failed - ${deployData.statusCode} ${deployData.error}`))
        reject(new Error(deployData.message))
        return
      }

      // Start polling deployment for status updates
      const intervalId = setInterval(() => {
        baseRequest.get(`/deployments/${deployData.id}`, (error, response, data) => {
          // Ensure request for status of deployment is successful
          if (error) {
            stopUpdates((logUpdater) => logUpdater(logSymbols.error, 'Deployment failed...'))
            clearInterval(intervalId)
            reject(error)
            return
          }
          if (response.statusCode !== 200) {
            stopUpdates((logUpdater) => logUpdater(logSymbols.error, `Deployment failed - ${data.statusCode} ${data.error}`))
            clearInterval(intervalId)
            reject(new Error(data.message))
            return
          }
          if (data.error) {
            stopUpdates((logUpdater) => logUpdater(logSymbols.error, `Deployment failed - ${data.error.name}`))
            clearInterval(intervalId)
            reject(new Error(data.error.message))
            return
          }

          // If status has a result on it, it has finished.
          // We can stop the polling and display origin deployed to.
          if (data.result) {
            stopUpdates((logUpdater) => logUpdater(logSymbols.success, `Deployment complete - Origin: ${data.result.baseUrl}`))
            clearInterval(intervalId)
            resolve(data.result)
          }
        })
      }, 5000)
    })
  })
}

function upload (
  zipFilePath /* : string */,
  awsCredentials /* : AWSCredentials */,
  serviceSettings /* : BMServerSettings */
) /* : Promise<string> */ {
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
