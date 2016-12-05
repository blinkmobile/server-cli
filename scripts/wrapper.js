/**
This module exports a "handler" function,
that wraps a customer function.
We bundle this module and its dependencies to ../dist/wrapper.js .
To bundle: `npm run build`
*/
/* @flow */
'use strict'

/* ::
import type {
  BmRequest,
  Headers,
  LambdaEvent
} from '../types.js'
*/

const path = require('path')

const loadJsonFile = require('load-json-file')

const handlers = require('../lib/handlers.js')
const wrapper = require('../lib/wrapper.js')

// return only the pertinent data from a API Gateway + Lambda event
function normaliseLambdaRequest (
  event /* : LambdaEvent */
) /* : BmRequest */ {
  const headers = wrapper.keysToLowerCase(event.headers)
  let body = event.body
  try {
    body = JSON.parse(body)
  } catch (e) {
    // Do nothing...
  }
  const host = headers['x-forwarded-host'] || headers.host
  return {
    body,
    headers,
    method: wrapper.normaliseMethod(event.httpMethod),
    url: {
      host,
      hostname: host,
      params: event.pathParameters || {},
      pathname: event.path,
      protocol: wrapper.protocolFromHeaders(headers),
      query: event.queryStringParameters || {}
    }
  }
}

function handler (
  event /* : LambdaEvent */,
  context /* : any */,
  cb /* : (error: null, response: {
    body: string,
    headers: Headers,
    statusCode: number
  }) => void */
) /* : Promise<void> */ {
  const request = normaliseLambdaRequest(event)
  const configPath = path.join(__dirname, 'bm-server.json')
  const internalHeaders = {}
  internalHeaders['Content-Type'] = 'application/json'
  const finish = (statusCode, body, customHeaders) => {
    const headers = Object.assign(internalHeaders, customHeaders)
    cb(null, {
      body: JSON.stringify(body, null, 2),
      headers: wrapper.keysToLowerCase(headers),
      statusCode: statusCode
    })
  }
  return loadJsonFile(configPath, 'utf8')
    .then((config) => {
      // Check for browser requests and apply CORS if required
      if (request.headers.origin) {
        if (!config.cors) {
          // No cors, we will return 405 result and let browser handler error
          return finish(405, {
            error: 'Method Not Allowed',
            message: 'OPTIONS method has not been implemented',
            statusCode: 405
          })
        }
        if (!config.cors.origins.some((origin) => origin === '*' || origin === request.headers.origin)) {
          // Invalid origin, we will return 200 result and let browser handler error
          return finish(200)
        }
        // Headers for all cross origin requests
        internalHeaders['Access-Control-Allow-Origin'] = request.headers.origin
        internalHeaders['Access-Control-Expose-Headers'] = config.cors.exposedHeaders.join(',')
        // Headers for OPTIONS cross origin requests
        if (request.method === 'options' && request.headers['access-control-request-method']) {
          internalHeaders['Access-Control-Allow-Headers'] = config.cors.headers.join(',')
          internalHeaders['Access-Control-Allow-Methods'] = request.headers['access-control-request-method']
          internalHeaders['Access-Control-Max-Age'] = config.cors.maxAge
        }
        // Only set credentials header if truthy
        if (config.cors.credentials) {
          internalHeaders['Access-Control-Allow-Credentials'] = true
        }
      }
      if (request.method === 'options') {
        // For OPTIONS requests, we can just finish
        // as we have created our own implementation of CORS
        return finish(200)
      }

      // Get handler module based on route
      const routeConfig = config.routes.find((routeConfig) => routeConfig.route === event.resource)
      if (!routeConfig) {
        return Promise.reject(new Error(`Could not find route configuration for route: ${event.resource}`))
      }

      // Change current working directory to the project
      // to accomadate for packages using process.cwd()
      const projectPath = path.join(__dirname, 'project')
      if (process.cwd() !== projectPath) {
        try {
          process.chdir(projectPath)
        } catch (err) {
          return Promise.reject(new Error(`Could not change current working directory to '${projectPath}': ${err}`))
        }
      }

      return handlers.getHandler(path.join(__dirname, routeConfig.module), request.method)
        .then((handler) => {
          if (typeof handler !== 'function') {
            return finish(405, {
              error: 'Method Not Allowed',
              message: `${request.method.toUpperCase()} method has not been implemented`,
              statusCode: 405
            })
          }

          return handlers.executeHandler(handler, request)
            .then((response) => finish(response.statusCode, response.payload, response.headers))
        })
    })
    .catch((error) => {
      if (error && error.isBoom && error.output && error.output.payload && error.output.statusCode) {
        // TODO: Make sure the docs indicate what we do with the
        // [data] argument of all Boom functions. (Available through error.data)
        // Options:
        // 1. Include in response, prob not safe. Could include sensitive information
        // 2. Log to something in AWS, Not sure if this is possible ???
        return finish(error.output.statusCode, error.output.payload, error.output.headers)
      }
      // TODO: Log the original error
      finish(500, {
        error: 'Internal Server Error',
        message: 'An internal server error occurred',
        statusCode: 500
      })
    })
}

module.exports = {
  handler,
  normaliseLambdaRequest
}
