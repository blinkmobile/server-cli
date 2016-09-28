'use strict'

const fs = require('fs')
const path = require('path')

const cpr = require('cpr')
const execa = require('execa')
const pify = require('pify')
const yaml = require('js-yaml')

const project = require('./project.js')
const values = require('./values.js')

const CPR_OPTIONS = {
  confirm: true,
  deleteFirst: true,
  overwrite: true
}

const WRAPPER = path.join(__dirname, '..', 'dist', 'wrapper.js')

function applyTemplate (cwd) {
  return execa('serverless', [ 'create', '--template', 'aws-nodejs' ], { cwd })
}

function copyRecursive (source, target) {
  return pify(cpr)(source, target, CPR_OPTIONS)
}

function copyWrapper (source, target) {
  return project.listAPIs(source)
    .then((names) => Promise.all(names.map((name) => {
      const targetWrapper = path.join(target, `${name}.js`)
      return copyRecursive(WRAPPER, targetWrapper)
    })))
}

function registerFunctions (source, target) {
  const configPath = path.join(target, 'serverless.yml')
  return pify(fs.readFile)(configPath, 'utf8')
    .then((content) => Promise.all([
      project.listAPIs(source),
      yaml.safeLoad(content)
    ]))
    .then((results) => {
      const names = results[0]
      const config = results[1]

      config.functions = names.reduce((functions, name) => {
        functions[name] = {
          events: values.METHODS.map((METHOD) => ({
            http: `${METHOD} ${name}`
          })),
          handler: `${name}.handler`
        }
        return functions
      }, {})

      return config
    })
    .then((config) => pify(fs.writeFile)(
      configPath,
      yaml.safeDump(config),
      'utf8')
    )
}

// TODO: configure CORS

module.exports = {
  applyTemplate,
  copyRecursive,
  copyWrapper,
  registerFunctions
}
