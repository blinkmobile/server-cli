'use strict'

const path = require('path')

/**
This is a single-file wrapper script for use at endpoint runtime.
This means that all helper functions that are used need to be defined here,
even if they are used by other files during deploy / test time.
*/

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

// assume that this file has been copied and renamed as appropriate
function getAPIName () {
  return path.basename(__filename, '.js')
}

function keysToLowerCase (object) {
  return Object.keys(object).reduce((result, key) => {
    result[key.toLowerCase()] = object[key]
    return result
  }, {})
}

function normaliseMethod (method) {
  return method.toLowerCase()
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

// return only the pertinent data from a API Gateway + Lambda event
function normaliseLambdaRequest (request) {
  const headers = keysToLowerCase(request.headers)
  return {
    body: request.body,
    headers,
    method: normaliseMethod(request.method),
    url: {
      host: headers.host,
      hostname: headers.host,
      pathname: `/api/${getAPIName()}`,
      protocol: protocolFromHeaders(headers),
      query: request.query
    }
  }
}

function handler (event, context, cb) {
  // TODO: extract error code from Boom-compatible errors
  // TODO: error handling needs to match Serverless' APIG error templates
  const api = getAPI(__dirname, getAPIName())
  if (!api) {
    cb(new Error(500))
    return
  }

  // TODO: transparently implement HEAD

  executeAPI(api, normaliseLambdaRequest(event))
    .then((result) => {
      cb(null, result || 200)
    })
    .catch((err) => cb(err))
}

module.exports = {
  executeAPI,
  getAPI,
  handler,
  keysToLowerCase,
  normaliseMethod,
  normaliseLambdaRequest,
  protocolFromHeaders
}
