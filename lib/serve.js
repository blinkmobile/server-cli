'use strict'

const Boom = require('boom')
const Hapi = require('hapi')
const pify = require('pify')

const apis = require('./apis.js')
const handlers = require('./handlers.js')
const values = require('./values.js')
const wrapper = require('./wrapper.js')

function normaliseHapiCors (cors) {
  return {
    credentials: cors.credentials,
    exposedHeaders: cors.exposedHeaders,
    headers: cors.headers,
    maxAge: cors.maxAge,
    origin: cors.origins
  }
}

// return only the pertinent data from a Hapi Request
function normaliseHapiRequest (request, params) {
  const urlInfo = Object.assign({}, request.url, {
    host: request.info.host,
    hostname: request.info.hostname,
    params,
    protocol: wrapper.protocolFromHeaders(request.headers)
  })
  delete urlInfo.auth
  delete urlInfo.hash
  delete urlInfo.href
  delete urlInfo.path
  delete urlInfo.port
  delete urlInfo.search
  delete urlInfo.slashes
  return {
    body: request.payload,
    headers: request.headers,
    method: request.method,
    url: urlInfo
  }
}

function startServer (options) {
  options = options || {}
  const server = new Hapi.Server()
  server.connection({ port: options.port })

  server.route({
    config: {
      cors: options.cors ? normaliseHapiCors(options.cors) : false
    },
    handler (request, reply) {
      // TODO: consider sanitising this input
      const cwd = options.cwd
      const route = request.params.route
      if (!route) {
        reply(Boom.notImplemented('Must supply a route')) // 501
        return
      }

      apis.wipeRouteFromRequireCache(cwd, route)
        .then(() => apis.getHandlerConfig(cwd, route, request.method))
        .then((handlerConfig) => {
          if (!handlerConfig || !handlerConfig.handler) {
            reply(Boom.notFound(`Route has not been implemented: ${route}`)) // 404
            return
          }
          if (typeof handlerConfig.handler !== 'function') {
            reply(Boom.methodNotAllowed(`${request.method.toUpperCase()} method has not been implemented for route: ${route}`, {test: 123}, ['GET', 'POST'])) // 405
            return
          }

          return handlers.executeHandler(handlerConfig.handler, normaliseHapiRequest(request, handlerConfig.params))
            .then((result) => {
              if (result) {
                const jsonResult = JSON.stringify(result, null, 2)
                const response = reply(null, jsonResult)
                response.type('application/json')
              } else {
                reply(null, 200)
              }
            })
        })
        .catch((err) => {
          if (!err || !err.isBoom) {
            err = Boom.wrap(err, 500)
          }
          // Want to show customers what went wrong locally for development.
          // Boom hides this message for 500 status codes.
          // TODO: Ensure docs specify that 500 error messages will only be returned locally.
          err.output.payload.message = err.message
          reply(err)
        })
    },
    // HTTP HEAD is automatically provided based on GET
    method: values.METHODS.filter((method) => method !== 'OPTIONS'),
    path: '/{route*}' // catch-all
  })

  return server.register({
    register: require('good'),
    options: {
      ops: false,
      reporters: {
        console: [{
          module: 'good-console'
        }, 'stdout']
      }
    }
  })
    .then(() => pify(server.start.bind(server))())
    .then(() => server)
}

module.exports = {
  normaliseHapiCors,
  normaliseHapiRequest,
  startServer
}
