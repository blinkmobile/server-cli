/* @flow */
'use strict'

const fs = require('fs')
const path = require('path')

const cpr = require('cpr')
const execa = require('execa')
const pify = require('pify')
const yaml = require('js-yaml')
const writeJsonFile = require('write-json-file')

const nonAlphaNumericToDashes = require('./utils/non-alpha-numeric-to-dashes.js')
const readCors = require('./cors/read.js')
const readRoutes = require('./routes/read.js')
const scope = require('./scope.js')
const values = require('./values.js')

const CPR_OPTIONS = {
  confirm: true,
  deleteFirst: true,
  overwrite: true
}
const HANDLER = 'handler'
const WRAPPER = path.join(__dirname, '..', 'dist', 'wrapper.js')

function applyTemplate (
  cwd /* : string */
) /* : Promise<void> */ {
  return execa('serverless', [ 'create', '--template', 'aws-nodejs' ], { cwd })
}

function copyProject (
  source /* : string */,
  target /* : string */
) /* : Promise<void> */ {
  const projectPath = getProjectPath(target)
  return copyRecursive(source, projectPath)
}

function copyRecursive (
  source /* : string */,
  target /* : string */
) /* : Promise<void> */ {
  return pify(cpr)(source, target, CPR_OPTIONS)
}

function copyRoutes (
  target /* : string */,
  stage /* : string */
) /* : Promise<void> */ {
  const projectPath = getProjectPath(target)
  const routesPath = path.join(target, 'routes.json')
  return Promise.all([
    readRoutes(projectPath),
    scope.read(projectPath)
  ])
    .then((results) => results[0].map((routeConfig, index) => ({
      // Set function name to allow for generic serverless wrapper to find module based on function name
      functionName: getFunctionName(index.toString(), stage, results[1].project),
      module: path.join('project', routeConfig.module),
      route: routeConfig.route
    })))
    .then((routeConfigs) => writeJsonFile(routesPath, routeConfigs))
}

function copyWrapper (
  target /* : string */
) /* : Promise<void> */ {
  const wrapperPath = path.join(target, `${HANDLER}.js`)
  return copyRecursive(WRAPPER, wrapperPath)
}

function getProjectPath (
  target /* : string */
) /* : string */ {
  return path.join(target, 'project')
}

function getFunctionName (
  route /* : string */,
  stage /* : string */,
  project /* : string */
) /* : string */ {
  // Lambdas do not allow for any characters other than alpha-numeric and dashes in function names
  const arr = [project, stage, route]
  const mapped = arr.map(nonAlphaNumericToDashes)
  return mapped.join('-')
}

function registerFunctions (
  target /* : string */,
  stage /* : string */
) /* : Promise<void> */ {
  const configPath = path.join(target, 'serverless.yml')
  const projectPath = getProjectPath(target)
  return pify(fs.readFile)(configPath, 'utf8')
    .then((content) => Promise.all([
      readRoutes(projectPath),
      yaml.safeLoad(content),
      scope.read(projectPath),
      readCors(projectPath)
    ]))
    .then((results) => {
      const routeConfigs = results[0]
      const config = results[1]
      const cfg = results[2]
      const cors = results[3]

      config.service = nonAlphaNumericToDashes(cfg.project)
      config.provider.region = cfg.region
      config.provider.stage = stage
      if (cors && cors.origins) {
        config.custom = {
          cors: {
            origins: cors.origins,
            headers: cors.headers || values.DEFAULT_HEADERS
          }
        }
      }
      config.functions = routeConfigs.reduce((functions, routeConfig, index) => {
        // The route must not start with a leading '/'
        const route = routeConfig.route.substr(1)
        const functionName = getFunctionName(index.toString(), stage, cfg.project)
        functions[index] = {
          events: values.METHODS.map((METHOD) => ({
            http: {
              cors: cors && cors.origins ? '${self:custom.cors}' : false, // eslint-disable-line no-template-curly-in-string
              method: METHOD.toLowerCase(),
              path: route
            }
          })),
          handler: `${HANDLER}.handler`,
          name: functionName,
          description: routeConfig.route
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
  copyProject,
  copyRecursive,
  copyRoutes,
  copyWrapper,
  getProjectPath,
  getFunctionName,
  registerFunctions
}
