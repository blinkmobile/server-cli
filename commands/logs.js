/* @flow */
'use strict'

/* ::
import type {
  CLIFlags,
  CLIOptions
} from '../types.js'
*/

const pify = require('pify')
const temp = require('temp').track()

const getRouteConfig = require('../lib/routes/get-route-config')
const scope = require('../lib/scope.js')
const serverless = require('../lib/serverless.js')

module.exports = function (
  input /* : Array<string> */,
  flags /* : CLIFlags */,
  logger /* : typeof console */,
  options /* : CLIOptions */
) /* : Promise<void> */ {
  const route = input[0]
  if (!route) {
    return Promise.reject(new Error('Must specify a route. E.g. bm server logs /route'))
  }

  return Promise.all([
    scope.read(flags.cwd),
    pify(temp.mkdir)('serverless')
  ])
    .then((results) => {
      const cfg = results[0]
      const tempDir = results[1]
      return serverless.applyTemplate(tempDir)
        .then(() => serverless.registerFunctions(tempDir, flags.cwd, flags.env))
        .then(() => Promise.all([
          getRouteConfig(flags.cwd, route),
          options.blinkMobileIdentity.assumeAWSRole({
            bmProject: cfg.project,
            command: 'logs'
          })
        ]))
        .then((results) => {
          const routeConfig = results[0]
          const credentials = results[1]
          const args = [
            'logs',
            '--function',
            serverless.getFunctionName(cfg, routeConfig, flags.env),
            '--region',
            cfg.region || flags.region,
            '--stage',
            flags.env
          ]
          if (flags.tail) {
            args.push('--tail')
          }
          if (flags.filter) {
            args.push('--filter', flags.filter)
          }
          if (flags.startTime) {
            args.push('--startTime', flags.startTime)
          }
          const options = {
            stdio: 'inherit',
            cwd: tempDir,
            env: Object.assign({}, process.env, {
              SLS_IGNORE_WARNING: '*',
              AWS_ACCESS_KEY_ID: credentials.accessKeyId,
              AWS_SECRET_ACCESS_KEY: credentials.secretAccessKey,
              AWS_SESSION_TOKEN: credentials.sessionToken
            })
          }
          return serverless.executeSLSCommand(args, options)
            .catch(() => Promise.reject(new Error('See Severless Error above for more details.')))
        })
    })
}
