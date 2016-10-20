'use strict'

const path = require('path')

const serve = require('../lib/serve.js')
const readCors = require('../lib/cors/read.js')

module.exports = function (input, flags, logger, options) {
  const cwd = path.resolve(options.cwd)
  const example = path.join(cwd, 'helloworld', 'index.js')
  return readCors(cwd)
    .then((cors) => serve.startServer({
      cors,
      cwd,
      port: 3000
    })
    .then((server) => logger.log(`
HTTP service for local development is running at port ${server.info.port}

Your current directory "." is:
  ${cwd}

HTTP API files should be in sub-folders within the directory above E.g:
  ${example}

Create new HTTP APIs, rename, update, or delete them at any time
Your changes automatically take effect on the next request
`)))
}
