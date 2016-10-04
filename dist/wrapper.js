(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.wrapper = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* @flow */
'use strict'

const path = require('path')

function executeAPI (
  handler /* : Function */,
  request /* : any */
) /* : Promise<void> */ {
  return Promise.resolve()
    .then(() => handler(request))
}

function getAPIFilePath (
  cwd /* : string */,
  name /* : string */
) /* : string */ {
  return path.join(cwd, 'api', name, 'index.js')
}

function getAPI (
  cwd /* : string */,
  name /* : string */,
  method /* : string */
) /* : Function | void */ {
  const apiPath = getAPIFilePath(cwd, name)
  let api
  try {
    // $FlowIssue in this case, we explicitly `require()` dynamically
    api = require(apiPath)
    if (api && method && typeof api[method] === 'function') {
      api = api[method]
    }
  } catch (err) {
    // do nothing
  }
  return api
}

function wipeAPIFromRequireCache (
  cwd /* : string */,
  name /* : string */
) {
  // property names in require.cache are absolute paths
  delete require.cache[getAPIFilePath(cwd, name)]
}

module.exports = {
  executeAPI,
  getAPI,
  getAPIFilePath,
  wipeAPIFromRequireCache
}

},{"path":undefined}],2:[function(require,module,exports){
/* @flow */
'use strict'

/* ::
type MapObject = { [id:string]: any }
type Headers = { [id:string]: string }
type Protocol = 'http:' | 'https:'
*/

function keysToLowerCase (
  object /* : MapObject */
) /* : MapObject */ {
  return Object.keys(object).reduce((result, key) => {
    result[key.toLowerCase()] = object[key]
    return result
  }, {})
}

function normaliseMethod (
  method /* : string */
) /* : string */ {
  return method.toLowerCase()
}

/**
https://www.w3.org/TR/url-1/#dom-urlutils-protocol
protocol ends with ':', same as in Node.js 'url' module
https://en.wikipedia.org/wiki/List_of_HTTP_header_fields
*/
function protocolFromHeaders (
  headers /* : Headers */
) /* : Protocol */ {
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

module.exports = {
  keysToLowerCase,
  normaliseMethod,
  protocolFromHeaders
}

},{}],3:[function(require,module,exports){
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

},{"../lib/apis.js":1,"../lib/wrapper.js":2,"path":undefined}]},{},[3])(3)
});