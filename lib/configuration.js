/* @flow */
'use strict'

const path = require('path')

const loadJsonFile = require('load-json-file')
const writeJsonFile = require('write-json-file')

function loadPackage (
  cwd /* : string */
) /* : Promise<any> */ {
  return loadJsonFile(path.join(cwd, 'package.json'))
    .catch(() => ({ main: 'bm-server.json' }))
}

function read (
  cwd /* : string */
) /* : Promise<any> */ {
  return loadPackage(cwd)
    .then((pkg) => loadJsonFile(path.join(cwd, pkg.main)))
    .catch(() => ({}))
}

function write (
  cwd /* : string */,
  writeFn /* : Function */
) /* : Promise<any> */ {
  return loadPackage(cwd)
    .then((pkg) => {
      return loadJsonFile(path.join(cwd, pkg.main))
        .catch(() => ({}))
        .then((config) => writeFn(config))
        .then((config) => writeJsonFile(path.join(cwd, pkg.main), config))
    })
}

module.exports = {
  read,
  write
}
