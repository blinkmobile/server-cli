'use strict'

const Boom = require('boom')
const Hapi = require('hapi')
const pify = require('pify')

const apis = require('./apis.js')
const values = require('./values.js')
const wrapper = require('./wrapper.js')

// return only the pertinent data from a Hapi Request
function normaliseHapiRequest (request) {
  const urlInfo = Object.assign({}, request.url, {
    host: request.info.host,
    hostname: request.info.hostname,
    protocol: wrapper.protocolFromHeaders(request.headers)
  })
  delete urlInfo.auth
  delete urlInfo.hash
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
      cors: true // development only, not recommended in production
    },
    handler (request, reply) {
      // TODO: consider sanitising this input
      const cwd = options.cwd
      const name = request.params.api
      apis.wipeAPIFromRequireCache(cwd, name)
      const api = apis.getAPI(cwd, name, request.method)

      if (!api) {
        reply(Boom.notFound())
        return
      }
      if (typeof api !== 'function') {
        reply(Boom.notImplemented())
        return
      }

      apis.executeAPI(api, normaliseHapiRequest(request))
        .then((result) => {
          if (result) {
            const jsonResult = JSON.stringify(result, null, 2)
            const response = reply(null, jsonResult)
            response.type('application/json')
          } else {
            reply(null, 200)
          }
        })
        .catch((err) => reply(err))
    },
    // HTTP HEAD is automatically provided based on GET
    method: values.METHODS,
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
  normaliseHapiRequest,
  startServer
}
