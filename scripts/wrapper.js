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

function finish (cb, body, statusCode) {
  cb(null, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: statusCode
  })
}

function handler (event, context, cb) {
  const routesPath = path.join(__dirname, 'routes.json')
  return loadJsonFile(routesPath, 'utf8')
    .then((routeConfigs) => {
      const request = normaliseLambdaRequest(event)
      const routeConfig = routeConfigs.find((routeConfig) => routeConfig.route === event.resource)
      if (!routeConfig) {
        return finish(cb, 'Internal Server Error', 500)
      }

      const handler = handlers.getHandler(path.join(__dirname, routeConfig.module), request.method)
      if (!handler) {
        return finish(cb, 'Internal Server Error', 500)
      }
      if (typeof handler !== 'function') {
        return finish(cb, 'Method Not Implemented', 405)
      }

      return handlers.executeHandler(handler, request)
        // TODO: Allow for customer to set there own statusCode and headers (including CORS)
        .then((result) => finish(cb, result, 200))
    })
    // TODO: extract error code from Boom-compatible errors
    .catch((error) => finish(cb, error && error.message ? error.message : (error || 'Internal Server Error'), 500))
}

module.exports = {
  handler,
  normaliseLambdaRequest
}
