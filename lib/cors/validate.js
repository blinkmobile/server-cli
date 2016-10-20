/* @flow */
'use strict'

const validUrl = require('valid-url')

/* ::
import type {CorsConfiguration} from './read.js'
*/

const HELP = ', see documentation for information on how to configure cors.'

function validateCors (
  cors /* : CorsConfiguration */
) /* : Promise<CorsConfiguration> */ {
  if (!cors) {
    return Promise.reject(new Error('Must specify cors configuration' + HELP))
  }
  if (!cors.origins || !Array.isArray(cors.origins) || !cors.origins.length) {
    return Promise.reject(new Error('Must specify at least a single allowable origin in cors configuration' + HELP))
  }
  if (cors.origins.some((origin) => origin === '*')) {
    return Promise.reject(new Error('Cannot specify all origins as allowable in cors configuration i.e. "*"' + HELP))
  }
  const invalidOrigins = cors.origins.reduce((invalidOrigins, origin) => {
    if (!validUrl.isWebUri(origin)) {
      invalidOrigins.push(origin)
    }
    return invalidOrigins
  }, [])
  if (invalidOrigins.length) {
    return Promise.reject(new Error('The following origins in cors configuration are not valid: ' + invalidOrigins.join(', ')))
  }
  if (cors.headers && !Array.isArray(cors.headers)) {
    return Promise.reject(new Error('Invalid headers in cors configuration' + HELP))
  }
  return Promise.resolve(cors)
}

module.exports = validateCors
