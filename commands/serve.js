'use strict'

const path = require('path')

const chalk = require('chalk')

const readCors = require('../lib/cors/read.js')
const serve = require('../lib/serve.js')

module.exports = function (input, flags, logger, options) {
  const cwd = path.resolve(options.cwd)
  const example = path.join('helloworld', 'index.js')
  return readCors(cwd)
    .then((cors) => serve.startServer({
      cors,
      cwd,
      port: flags.port || 3000
    })
    .then((server) => logger.log(`
HTTP service for local development is available from:
  ${server.info.uri}

Your current directory "." is:
  ${cwd}

HTTP API files should be in sub-folders within the directory above E.g:
  ${example} -> ${server.info.uri}/helloworld

Create new HTTP APIs, rename, update, or delete them at any time.
Your changes automatically take effect on the next request

${chalk.yellow('Hit CTRL-C to stop the service')}
`)))
}
