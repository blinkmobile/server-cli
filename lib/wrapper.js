/* @flow */
'use strict'

/* ::
type MapObject = { [id:string]: any }
export type Headers = { [id:string]: string }
export type Protocol = 'http:' | 'https:'
export type BmRequest = {
  body: any,
  headers: Headers,
  method: string,
  url: {
    host: string,
    hostname: string,
    params: { [id:string]: string },
    pathname: string,
    protocol: Protocol,
    query: { [id:string]: string }
  }
}
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
