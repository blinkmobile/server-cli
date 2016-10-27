/* @flow */
'use strict'

/* ::
export type CorsConfiguration = {
  credentials: boolean,
  exposedHeaders: Array<string>,
  headers: Array<string>,
  maxAge: number,
  origins: Array<string>
}
*/

const configuation = require('../configuration.js')
const values = require('../values.js')

function readCors (
  cwd /* : string */
) /* : Promise<CorsConfiguration | false> */ {
  return configuation.read(cwd)
    .then((config) => {
      // Want to support two options here:
      // 1. Falsey to disable CORS
      if (!config.cors) {
        return false
      }
      // 2. Truthy to use default CORS and merge in any custom stuff
      return Object.assign({
        credentials: values.DEFAULT_CORS.CREDENTIALS,
        exposedHeaders: values.DEFAULT_CORS.EXPOSED_HEADERS,
        headers: values.DEFAULT_CORS.HEADERS,
        maxAge: values.DEFAULT_CORS.MAX_AGE,
        origins: values.DEFAULT_CORS.ORIGINS
      }, config.cors)
    })
}

module.exports = readCors
