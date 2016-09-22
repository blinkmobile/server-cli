'use strict'

const path = require('path')

const Boom = require('boom')
const Hapi = require('hapi')
const pify = require('pify')

const values = require('./values.js')

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

/**
https://www.w3.org/TR/url-1/#dom-urlutils-protocol
protocol ends with ':', same as in Node.js 'url' module
https://en.wikipedia.org/wiki/List_of_HTTP_header_fields
*/
function protocolFromHeaders (headers) {
  if (headers['x-forwarded-proto'] === 'https') {
    return `https:`
  }
  if (headers.forwarded && ~headers.forwarded.indexOf('proto=https')) {
    return `https:`
  }
  if (headers['front-end-https'] === 'on') {
    return `https:`
  }
  return 'http:'
}

// return only the pertinent data from a Hapi Request
function normaliseHapiRequest (request) {
  const urlInfo = Object.assign({}, request.url, {
    host: request.info.host,
    hostname: request.info.hostname,
    protocol: protocolFromHeaders(request.headers)
  })
  delete urlInfo.auth
  delete urlInfo.hash
  delete urlInfo.port
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
      const api = getAPI(options.cwd, request.params.api)
      if (!api) {
        reply(Boom.notFound())
        return
      }

      executeAPI(api, normaliseHapiRequest(request))
        .then((result) => {
          reply(null, result || 200)
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
  executeAPI,
  getAPI,
  normaliseHapiRequest,
  protocolFromHeaders,
  startServer
}
