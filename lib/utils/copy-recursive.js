/* @flow */
'use strict'

const cpr = require('cpr')
const pify = require('pify')

const CPR_OPTIONS = {
  confirm: true,
  deleteFirst: true,
  overwrite: true
}

function copyRecursive (
  source /* : string */,
  target /* : string */
) /* : Promise<void> */ {
  return pify(cpr)(source, target, CPR_OPTIONS)
}

module.exports = copyRecursive
