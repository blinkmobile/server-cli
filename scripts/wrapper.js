/**
This module exports a "handler" function,
that wraps a customer function.
We bundle this module and its dependencies to ../dist/wrapper.js .
To bundle: `npm run build`
*/
'use strict'

const path = require('path')

const loadJsonFile = require('load-json-file')

const handlers = require('../lib/handlers.js')
const wrapper = require('../lib/wrapper.js')

// return only the pertinent data from a API Gateway + Lambda event
function normaliseLambdaRequest (request) {
  const headers = wrapper.keysToLowerCase(request.headers)
  let body = request.body
  try {
    body = JSON.parse(body)
  } catch (e) {
    // Do nothing...
  }
  return {
    body,
    headers,
    method: wrapper.normaliseMethod(request.httpMethod),
    url: {
      host: headers.host,
      hostname: headers.host,
      params: request.pathParameters || {},
      pathname: request.path,
      protocol: wrapper.protocolFromHeaders(headers),
      query: request.queryStringParameters || {}
    }
  }
}

function handler (event, context, cb) {
  const request = normaliseLambdaRequest(event)
  const configPath = path.join(__dirname, 'bm-server.json')
  const internalHeaders = {
    'Content-Type': 'application/json'
  }
  const finish = (statusCode, body, customHeaders) => {
    cb(null, {
      body: JSON.stringify(body, null, 2),
      headers: Object.assign(internalHeaders, customHeaders),
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
            // TODO: Allow for customer to set there own statusCode and headers
            .then((result) => finish(200, result))
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
