'use strict'

const displayRoutes = require('../lib/routes/display.js')

module.exports = function (input, flags, logger, options) {
  const tasks = [
    () => displayRoutes(logger, options.cwd)
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
