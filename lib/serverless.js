'use strict'

const path = require('path')

const cpr = require('cpr')
const execa = require('execa')
const pify = require('pify')

const apis = require('./apis.js')

const CPR_OPTIONS = {
  confirm: true,
  deleteFirst: true,
  overwrite: true
}

const WRAPPER = path.join(__dirname, '..', 'scripts', 'wrapper.js')

function applyTemplate (cwd) {
  return execa('serverless', [ 'create', '--template', 'aws-nodejs' ], { cwd })
}

function copyRecursive (source, target) {
  return pify(cpr)(source, target, CPR_OPTIONS)
}

function copyWrapper (source, target) {
  return apis.listAPIs(source)
    .then((names) => Promise.all(names.map((name) => {
      const targetWrapper = path.join(target, `${name}.js`)
      return copyRecursive(WRAPPER, targetWrapper)
    })))
}

module.exports = {
  applyTemplate,
  copyRecursive,
  copyWrapper
}
