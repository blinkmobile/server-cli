'use strict'

const glob = require('glob')
const pify = require('pify')

function listAPIs (cwd) {
  return pify(glob)('api/*/index.js', { cwd })
    .then((matches) => matches.map((match) => match.split('/')[1]))
}

module.exports = {
  listAPIs
}
