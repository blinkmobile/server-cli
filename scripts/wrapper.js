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
  return {
    body: request.body,
    headers,
    method: wrapper.normaliseMethod(request.method),
    url: {
      host: headers.host,
      hostname: headers.host,
      params: request.path,
      protocol: wrapper.protocolFromHeaders(headers),
      query: request.query
    }
  }
}

function handler (event, context, cb) {
  // TODO: extract error code from Boom-compatible errors
  // TODO: error handling needs to match Serverless' APIG error templates
  const routesPath = path.join(__dirname, 'routes.json')
  return loadJsonFile(routesPath, 'utf8')
    .then((routeConfigs) => {
      const request = normaliseLambdaRequest(event)
      const routeConfig = routeConfigs.find((routeConfig) => routeConfig.functionName === context.functionName)
      if (!routeConfig) {
        return Promise.reject(new Error('[500] Internal Server Error'))
      }
      request.url.pathname = routeConfig.route
      // Replace params in route to get pathname
      Object.keys(request.url.params).forEach((key) => {
        const val = request.url.params[key]
        request.url.pathname = request.url.pathname.replace(`{${key}}`, val)
      })
      const handler = handlers.getHandler(path.join(__dirname, routeConfig.module), request.method)

      if (!handler) {
        return Promise.reject(new Error('[500] Internal Server Error'))
      }
      if (typeof handler !== 'function') {
        return Promise.reject(new Error('[501] Not Implemented'))
      }

      // TODO: transparently implement HEAD

      return handlers.executeHandler(handler, request)
        .then((result) => {
          cb(null, result || 200)
        })
    })
    .catch((err) => cb(err))
}

module.exports = {
  handler,
  normaliseLambdaRequest
}
