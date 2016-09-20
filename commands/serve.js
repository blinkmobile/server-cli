'use strict'

const serve = require('../lib/serve.js')

module.exports = function (input, flags, logger, options) {
  const cwd = options.cwd
  return serve.startServer({
    cwd,
    port: 3000
  })
    .then((server) => logger.log(`
HTTP service for local development is running at port ${server.info.port}

Your current directory "." is:
  ${cwd}

HTTP API files should be in sub-folders within:
  ./api/

Create new HTTP APIs, rename, update, or delete them at any time
Your changes automatically take effect on the next request
`))
}
