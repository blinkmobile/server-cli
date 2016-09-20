'use strict'

const cpr = require('cpr')
const execa = require('execa')
const pify = require('pify')

function applyTemplate (cwd) {
  return execa('serverless', [ 'create', '--template', 'aws-nodejs' ], { cwd })
}

function copyRecursive (source, target) {
  return pify(cpr)(source, target, {
    confirm: true,
    deleteFirst: true,
    overwrite: true
  })
}

module.exports = {
  applyTemplate,
  copyRecursive
}
