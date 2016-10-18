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
) /* : Function | void */ {
  let handler
  try {
    // $FlowIssue in this case, we explicitly `require()` dynamically
    handler = require(module)
    if (handler && method && typeof handler[method] === 'function') {
      handler = handler[method]
    }
  } catch (err) {
    // do nothing
  }
  return handler
}

module.exports = {
  executeHandler,
  getHandler
}
