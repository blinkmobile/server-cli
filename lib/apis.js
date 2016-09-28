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
  name /* : string */
) /* : Function | void */ {
  const apiPath = getAPIFilePath(cwd, name)
  let api
  try {
    // $FlowIssue in this case, we explicitly `require()` dynamically
    api = require(apiPath)
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
