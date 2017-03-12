/* @flow */
'use strict'

/* ::
import type {
  CLIFlags,
  CLIOptions
} from '../types.js'
*/

/**
bm serve serverless --input . --output /tmp/foobar
*/

const lib = require('../lib/serverless.js')

module.exports = function (
  input /* : Array<string> */,
  flags /* : CLIFlags */,
  logger /* : typeof console */,
  options /* : CLIOptions */
) /* : Promise<void> */ {
  const cwd = options.cwd
  const out = flags.out
  const env = flags.env
  const vpcSecurityGroups = flags.vpcSecurityGroups || ''
  const vpcSubnets = flags.vpcSubnets || ''
  const deploymentBucket = flags.deploymentBucket
  const executionRole = flags.executionRole

  if (!out) {
    return Promise.reject(new Error('"--out" is mandatory'))
  }

  return lib.copyProject(cwd, out)
    .then(() => lib.applyTemplate(out)) // TODO: eventually unnecessary?
    .then(() => lib.copyWrapper(out))
    .then(() => lib.copyConfiguration(out, env))
    .then(() => lib.registerFunctions(out, env, deploymentBucket, executionRole))
    .then(() => lib.registerRootProxy(out, env))
    .then(() => lib.registerVpc(out, vpcSecurityGroups, vpcSubnets, ','))
}
