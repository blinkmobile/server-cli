/* @flow */
'use strict'

/* ::
import type {
  CLIFlags,
  CLIOptions
} from '../types.js'
*/

const displayCors = require('../lib/cors/display.js')
const displayRoutes = require('../lib/routes/display.js')
const scope = require('../lib/scope.js')

module.exports = function (
  input /* : Array<string> */,
  flags /* : CLIFlags */,
  logger /* : typeof console */,
  options /* : CLIOptions */
) /* : Promise<void> */ {
  const tasks = [
    () => scope.display(logger, flags.cwd),
    () => displayCors(logger, flags.cwd),
    () => displayRoutes(logger, flags.cwd)
  ]
  // Catch all errors and let all tasks run before
  // transforming into a single error
  const errors = []
  return tasks.reduce((prev, task) => {
    return prev.then(() => task())
      .catch(error => errors.push(error))
  }, Promise.resolve())
    .then(() => {
      if (errors && errors.length) {
        return Promise.reject(new Error(errors.map((error) => error.message).join('\n')))
      }
    })
}
