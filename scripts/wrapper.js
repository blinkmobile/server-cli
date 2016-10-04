/**
This module exports a "handler" function,
that wraps a customer function.
We bundle this module and its dependencies to ../dist/wrapper.js .
To bundle: `npm run build`
*/
'use strict'

const path = require('path')

const apis = require('../lib/apis.js')
const wrapper = require('../lib/wrapper.js')

// assume that this file has been copied and renamed as appropriate
function getAPIName () {
  return path.basename(__filename, '.js')
}

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
      pathname: `/api/${getAPIName()}`,
      protocol: wrapper.protocolFromHeaders(headers),
      query: request.query
    }
  }
}

function handler (event, context, cb) {
  // TODO: extract error code from Boom-compatible errors
  // TODO: error handling needs to match Serverless' APIG error templates
  const request = normaliseLambdaRequest(event)
  const api = apis.getAPI(__dirname, getAPIName(), request.method)

  if (!api) {
    cb(new Error('[500] Internal Server Error'))
    return
  }
  if (typeof api !== 'function') {
    cb(new Error('[501] Not Implemented'))
    return
  }

  // TODO: transparently implement HEAD

  apis.executeAPI(api, request)
    .then((result) => {
      cb(null, result || 200)
    })
    .catch((err) => cb(err))
}

module.exports = {
  handler,
  normaliseLambdaRequest
}
