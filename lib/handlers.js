/* @flow */
'use strict'

/* ::
import type {BmRequest} from './wrapper.js'
*/
const BmResponse = require('../lib/bm-response.js')

function executeHandler (
  handler /* : Function */,
  request /* : BmRequest */
) /* : Promise<BmResponse> */ {
  const response = new BmResponse()
  return Promise.resolve()
    .then(() => handler(request, response))
    .then((result) => {
      // If a result has been returned:
      // try and set status code or
      // try and set payload
      if (result && result !== response) {
        if (Number.isFinite(result)) {
          response.setStatusCode(result)
        } else {
          response.setPayload(result)
        }
      }
      return response
    })
}

function getHandler (
  module /* : string */,
  method /* : string */
) /* : Promise<Function | void> */ {
  try {
    // $FlowIssue in this case, we explicitly `require()` dynamically
    let handler = require(module)
    if (handler && method && typeof handler[method] === 'function') {
      handler = handler[method]
    }
    return Promise.resolve(handler)
  } catch (err) {
    return Promise.reject(err)
  }
}

module.exports = {
  executeHandler,
  getHandler
}
