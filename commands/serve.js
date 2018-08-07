/* @flow */
'use strict'

/* ::
import type {
  CLIFlags,
  CLIOptions
} from '../types.js'
*/

const path = require('path')

const chalk = require('chalk')

const readCors = require('../lib/cors/read.js')
const serve = require('../lib/serve.js')
const displayRoutes = require('../lib/routes/display.js')

module.exports = async function (
  input /* : Array<string> */,
  flags /* : CLIFlags */,
  logger /* : typeof console */,
  options /* : CLIOptions */
) /* : Promise<void> */ {
  const cwd = path.resolve(flags.cwd)
  const cors = await readCors(cwd)
  const server = await serve.startServer(logger, {
    cors,
    cwd,
    env: flags.env,
    port: flags.port || 3000
  })
  await displayRoutes(logger, flags.cwd)
  logger.log(`
HTTP service for local development is available from:
  http://localhost:${server.info.port}

${chalk.yellow('Hit CTRL-C to stop the service')}
`)
}
