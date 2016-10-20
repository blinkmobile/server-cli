/* @flow */
'use strict'

const configuation = require('../configuration.js')

/* ::
export type CorsConfiguration = {
  origins: Array<string>,
  headers: Array<string> | void
}
*/

function readCors (
  cwd /* : string */
) /* : Promise<CorsConfiguration> */ {
  return configuation.read(cwd)
    .then((config) => config.cors || {})
}

module.exports = readCors
