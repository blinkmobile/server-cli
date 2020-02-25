/* @flow */
'use strict'

/* ::
import type {
  CLIFlags,
  CLIOptions
} from '../types.js'
*/

const scope = require('../lib/scope')

module.exports = function(
  input /* : Array<string> */,
  flags /* : CLIFlags */,
  logger /* : typeof console */,
  options /* : CLIOptions */
) /* : Promise<void> */ {
  const cwd = flags.cwd
  const project = input[0]
  const tenant = flags.tenant
  return Promise.resolve()
    .then(() => {
      if (project) {
        return scope.write(cwd, {
          project,
          tenant
        })
      }
    })
    .then(() => scope.display(logger, cwd))
}
