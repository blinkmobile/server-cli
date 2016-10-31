/* @flow */
'use strict'

function executeHandler (
  handler /* : Function */,
  request /* : any */
) /* : Promise<void> */ {
  return Promise.resolve()
    .then(() => handler(request))
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
