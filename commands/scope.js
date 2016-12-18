'use strict'

const scope = require('../lib/scope')

const REGION = 'ap-southeast-2'

module.exports = function (input, flags, logger, options) {
  const cwd = options.cwd
  const project = input[0]
  const region = flags.region || REGION
  let promise = Promise.resolve()
  if (project) {
    promise = scope.write(cwd, {
      project,
      region
    })
  }
  return promise
    .then(() => scope.display(logger, cwd))
}
