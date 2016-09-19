'use strict'

const path = require('path')

const Boom = require('boom')
const Hapi = require('hapi')
const pify = require('pify')

function executeAPI (handler, request) {
  return Promise.resolve()
    .then(() => handler(request))
}

function getAPI (cwd, name) {
  const apiPath = path.join(cwd, 'api', name, 'index.js')
  let api
  try {
    api = require(apiPath)
  } catch (err) {
    // do nothing
  }
  // property names in require.cache are absolute paths
  delete require.cache[apiPath]
  return api
}

function simplifyRequest (request) {
  return {
    body: request.payload,
    headers: request.headers,
    host: request.info.host,
    hostname: request.info.hostname,
    method: request.method,
    params: request.params,
    query: request.query,
    url: request.url
  }
}

function startServer (options) {
  options = options || {}
  const server = new Hapi.Server()
  server.connection({ port: options.port })

  server.route({
    config: {
      cors: true // development only, not recommended in production
    },
    handler (request, reply) {
      const api = getAPI(options.cwd, request.params.api)
      if (!api) {
        reply(Boom.notFound())
        return
      }

      executeAPI(api, simplifyRequest(request))
        .then((result) => {
          reply(null, result || 200)
        })
        .catch((err) => reply(err))
    },
    // HTTP HEAD is automatically provided based on GET
    method: [ 'DELETE', 'GET', 'OPTION', 'PATCH', 'POST', 'PUT' ],
    path: '/api/{api}' // catch-all
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
  executeAPI,
  getAPI,
  startServer
}
