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
    route: '',
    url: {
      host,
      hostname: host,
      params: {},
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
  const startTime = Date.now()
  const request = normaliseLambdaRequest(event)
  const internalHeaders = {}
  internalHeaders['Content-Type'] = 'application/json'
  const finish = (statusCode, body, customHeaders) => {
    const headers = Object.assign(internalHeaders, customHeaders)
    const endTime = Date.now()
    const requestTime = endTime - startTime
    console.log('BLINKM_ANALYTICS_EVENT', JSON.stringify({ // eslint-disable-line no-console
      request: {
        method: request.method.toUpperCase(),
        query: request.url.query,
        port: 443,
        path: request.route,
        hostName: request.url.hostname,
        params: request.url.params,
        protocol: request.url.protocol
      },
      response: {
        statusCode: statusCode
      },
      requestTime: {
        startDateTime: new Date(startTime),
        startTimeStamp: startTime,
        endDateTime: new Date(endTime),
        endTimeStamp: endTime,
        ms: requestTime,
        s: requestTime / 1000
      }
    }, null, 2))
    cb(null, {
      body: JSON.stringify(body, null, 2),
      headers: wrapper.keysToLowerCase(headers),
      statusCode: statusCode
    })
  }

  return Promise.resolve()
    // $FlowFixMe requiring file without string literal to accomodate for __dirname
    .then(() => require(path.join(__dirname, 'bm-server.json')))
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
      let routeConfig
      try {
        routeConfig = handlers.findRouteConfig(event.path, config.routes)
        request.url.params = routeConfig.params || {}
        request.route = routeConfig.route
      } catch (error) {
        return finish(404, {
          error: 'Not Found',
          message: error.message,
          statusCode: 404
        })
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
      if (error && error.stack) {
        console.error(error.stack) // eslint-disable-line no-console
      }
      if (error && error.isBoom && error.output && error.output.payload && error.output.statusCode) {
        if (error.data) {
          console.error('Boom Data: ', JSON.stringify(error.data, null, 2)) // eslint-disable-line no-console
        }
        return finish(error.output.statusCode, error.output.payload, error.output.headers)
      }
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
