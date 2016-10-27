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

function finish (cb, body, statusCode, corsHeaders) {
  cb(null, {
    body: JSON.stringify(body),
    headers: Object.assign({
      'Content-Type': 'application/json'
    }, corsHeaders),
    statusCode: statusCode
  })
}

function handler (event, context, cb) {
  const request = normaliseLambdaRequest(event)
  const configPath = path.join(__dirname, 'bm-server.json')
  return loadJsonFile(configPath, 'utf8')
    .then((config) => {
      // Get handler module based on route
      const routeConfig = config.routes.find((routeConfig) => routeConfig.route === event.resource)
      if (!routeConfig) {
        return finish(cb, 'Internal Server Error', 500)
      }

      let handler = handlers.getHandler(path.join(__dirname, routeConfig.module), request.method)
      if (!handler) {
        return finish(cb, 'Internal Server Error', 500)
      }
      if (typeof handler !== 'function') {
        if (request.method === 'options') {
          // If we couldnt find the options function we can just finish
          // as we have created our own implementation of CORS
          handler = () => {}
        } else {
          return finish(cb, 'Method Not Implemented', 405)
        }
      }

      // Check for browser requests and apply CORS if required
      let corsHeaders = {}
      if (request.headers.origin) {
        if (!config.cors) {
          // No cors, we will return 405 result and let browser handler error
          return finish(cb, 'Method Not Implemented', 405)
        }
        if (!config.cors.origins.some((origin) => origin === '*' || origin === request.headers.origin)) {
          // Invalid origin, we will return 200 result and let browser handler error
          return finish(cb, null, 200)
        }
        // Headers for all cross origin requests
        corsHeaders['Access-Control-Allow-Origin'] = request.headers.origin
        corsHeaders['Access-Control-Expose-Headers'] = config.cors.exposedHeaders.join(',')
        // Headers for OPTIONS cross origin requests
        if (request.method === 'options' && request.headers['access-control-request-method']) {
          corsHeaders['Access-Control-Allow-Headers'] = config.cors.headers.join(',')
          corsHeaders['Access-Control-Allow-Methods'] = request.headers['access-control-request-method']
          corsHeaders['Access-Control-Max-Age'] = config.cors.maxAge
        }
        // Only set credentials header if truthy
        if (config.cors.credentials) {
          corsHeaders['Access-Control-Allow-Credentials'] = true
        }
      }

      return handlers.executeHandler(handler, request)
        // TODO: Allow for customer to set there own statusCode and headers
        .then((result) => finish(cb, result, 200, corsHeaders))
    })
    // TODO: extract error code from Boom-compatible errors
    .catch((error) => finish(cb, error && error.message ? error.message : (error || 'Internal Server Error'), 500))
}

module.exports = {
  handler,
  normaliseLambdaRequest
}
