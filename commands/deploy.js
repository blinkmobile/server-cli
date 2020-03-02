/* @flow */
'use strict'

/* ::
import type {
  APIEnvironment,
  CLIFlags,
  CLIOptions
} from '../types.js'
*/

const util = require('util')

const jwt = require('jsonwebtoken')
const ora = require('ora')
const temp = require('temp').track()
const semver = require('semver')

const pkg = require('../package.json')
const info = require('./info.js')
const deploy = require('../lib/deploy.js')
const scope = require('../lib/scope.js')
const upsertAPIEnvironment = require('../lib/upsert-api-environment.js')
const getAPIInstance = require('../lib/get-api-instance.js')
const getAWSAccount = require('../lib/get-aws-account.js')
const serverlessCommand = require('./serverless.js')
const serverless = require('../lib/serverless.js')
const fqdnHelper = require('../lib/utils/fully-qualified-domain-name.js')
const values = require('../lib/values.js')

module.exports = async function(
  input /* : Array<string> */,
  flags /* : CLIFlags */,
  logger /* : typeof console */,
  options /* : CLIOptions */
) /* : Promise<void> */ {
  const blinkMobileIdentity = options.blinkMobileIdentity
  const cwd = flags.cwd
  const env = flags.env
  const force = flags.force
  await info(input, flags, logger, options)
  const confirmation = await deploy.confirm(logger, force, env)
  if (!confirmation) {
    return
  }
  const config = await scope.read(cwd)
  const [awsCredentials, accessToken] = await deploy.authenticate(
    config,
    blinkMobileIdentity,
    env
  )

  // If environment does not exist or --provision flag is set, full deploy.
  // A full deploy is also required if the environment is
  // being deployed using a different major version of the
  // Server CLI as this will change the NodeJS version.
  const apiInstance = await getAPIInstance(config, accessToken)
  const existingEnvironment /* : APIEnvironment | void */ = (
    apiInstance.environments || []
  ).find(apiEnvironment => apiEnvironment.environment === env)
  const environmentExists =
    !!existingEnvironment &&
    existingEnvironment.bmServerVersion &&
    semver.major(existingEnvironment.bmServerVersion) ===
      semver.major(pkg.version)
  if (flags.provision || !environmentExists) {
    const zipFilePath = await deploy.zip(cwd)
    const bundleKey = await deploy.upload(zipFilePath, awsCredentials, config)
    await deploy.deploy(bundleKey, accessToken, env, config)
    return
  }

  const spinner = ora('Deploying project...').start()
  try {
    // otherwise, just update lambda
    const service = scope.serverCLIServiceConfig(config)
    const mkdir = util.promisify(temp.mkdir)
    const tempDirectory = await mkdir('server-cli')
    const awsAccount = await getAWSAccount(apiInstance, config, accessToken)

    // if the analytics key is available, pass it through to be used by the instance
    const analyticsFlags = {}
    if (config.analytics) {
      const analytics = config.analytics
      if (analytics.key && analytics.secret) {
        // generate JWT
        analyticsFlags.analyticsCollectorToken = jwt.sign(
          {
            iss: analytics.key
          },
          analytics.secret,
          {
            expiresIn: '3650d'
          }
        )
      }
      analyticsFlags.analyticsOrigin =
        analytics.origin || values.ANALYTICS_ORIGIN
    }
    await serverlessCommand(
      [],
      Object.assign({}, flags, analyticsFlags, {
        out: tempDirectory,
        deploymentBucket: service.bucket,
        executionRole: `arn:aws:iam::${awsAccount.accountNumber}:role/${apiInstance.executionIamRole}`,
        vpcSecurityGroups: apiInstance.vpcSecurityGroupIds || '',
        vpcSubnets: apiInstance.vpcSubnetIds || ''
      }),
      logger,
      options
    )
    const functionName = serverless.getFunctionName(config, env)
    await serverless.executeSLSCommand(
      ['deploy', 'function', '--function', functionName, '--force'],
      {
        cwd: tempDirectory,
        env: Object.assign({}, process.env, {
          AWS_ACCESS_KEY_ID: awsCredentials.accessKeyId,
          AWS_SECRET_ACCESS_KEY: awsCredentials.secretAccessKey,
          AWS_SESSION_TOKEN: awsCredentials.sessionToken
        })
      }
    )
    await upsertAPIEnvironment(config, apiInstance, env, cwd, accessToken)
    spinner.succeed(
      `Deployment complete - Origin: https://${fqdnHelper.getFQDN(
        apiInstance.id,
        env
      )}`
    )
  } catch (error) {
    spinner.fail('Deployment failed...')
    throw error
  }
}
