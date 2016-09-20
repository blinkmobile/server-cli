'use strict'

const cpr = require('cpr')
const pify = require('pify')

function copyRecursive (source, target) {
  return pify(cpr)(source, target, {
    confirm: true,
    overwrite: true
  })
}

module.exports = {
  copyRecursive
}
