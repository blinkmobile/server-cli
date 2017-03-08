/* @flow */
'use strict'

/* ::
import type {
  BlinkMRCServer, CorsConfiguration, RouteConfiguration
} from '../types.js'
type ServerlessRouteConfiguration = {
  functionName: string,
  module: string,
  route: string
}
*/

const path = require('path')

const cpr = require('cpr')
const execa = require('execa')
const loadJsonFile = require('load-json-file')
const pify = require('pify')
const writeJsonFile = require('write-json-file')

const nonAlphaNumericToDashes = require('./utils/non-alpha-numeric-to-dashes.js')
const readCors = require('./cors/read.js')
const readRoutes = require('./routes/read.js')
const scope = require('./scope.js')
const updateYamlFile = require('./utils/yaml.js').updateYamlFile
const validateCors = require('./cors/validate.js')
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

function copyConfiguration (
  target /* : string */,
  env /* : string */
) /* : Promise<void> */ {
  const configPath = path.join(target, 'bm-server.json')
  return Promise.all([
    getCors(target),
    getRoutes(target, env)
  ])
    .then((results) => writeJsonFile(configPath, {
      cors: results[0],
      routes: results[1]
    }))
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

function getRoutes (
  target /* : string */,
  env /* : string */
) /* : Promise<Array<ServerlessRouteConfiguration>> */ {
  const projectPath = getProjectPath(target)
  return Promise.all([
    readRoutes(projectPath),
    scope.read(projectPath)
  ])
    .then((results) => results[0].map((routeConfig, index) => ({
      // Set function name to allow for generic serverless wrapper to find module based on function name
      functionName: getFunctionName(index.toString(), env, results[1].project || ''),
      module: path.join('project', routeConfig.module),
      route: routeConfig.route
    })))
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

function getCors (
  target /* : string */
) /* : Promise<CorsConfiguration | false> */ {
  const projectPath = getProjectPath(target)
  return readCors(projectPath)
    .then((cors) => cors ? validateCors(cors) : false)
}

function getFunctionName (
  route /* : string */,
  env /* : string */,
  project /* : string */
) /* : string */ {
  // Lambdas do not allow for any characters other than alpha-numeric and dashes in function names
  const arr = [project, env, route]
  const mapped = arr.map(nonAlphaNumericToDashes)
  return mapped.join('-')
}

function registerFunctions (
  target /* : string */,
  env /* : string */,
  deploymentBucket /* : string | void */,
  executionRole /* : string | void */
) /* : Promise<void> */ {
  const configPath = path.join(target, 'serverless.yml')
  const projectPath = getProjectPath(target)
  return Promise.all([
    readRoutes(projectPath),
    scope.read(projectPath)
  ])
    .then((results) => {
      const routeConfigs = results[0]
      const cfg = results[1]

      return updateYamlFile(configPath, (config) => {
        config.service = nonAlphaNumericToDashes(cfg.project || '')
        config.provider.region = cfg.region
        config.provider.stage = env
        if (deploymentBucket) {
          config.provider.deploymentBucket = deploymentBucket
        }
        if (executionRole) {
          config.provider.role = executionRole
        }
        config.functions = routeConfigs.reduce((functions, routeConfig, index) => {
          // The route must not start with a leading '/'
          const route = routeConfig.route.substr(1)
          const functionName = getFunctionName(index.toString(), env, cfg.project || '')
          functions[index] = {
            events: [{
              http: `ANY ${route}`
            }],
            handler: `${HANDLER}.handler`,
            name: functionName,
            description: routeConfig.route,
            timeout: values.DEFAULT_TIMEOUT_SECONDS
          }
          return functions
        }, {})

        return config
      })
    })
}

function registerRootProxy (
  target /* : string */,
  env /* : string */
) /* : Promise<void> */ {
  // TODO: detect root route Lambda function (if any) and skip this proxy

  const configPath = path.join(target, 'serverless.yml')

  // https://serverless.com/framework/docs/providers/aws/events/apigateway#setting-an-http-proxy-on-api-gateway

  return loadJsonFile(path.join(__dirname, 'root-route-proxy.json'))
    .then((resources) => updateYamlFile(configPath, (config) => {
      config.resources = resources
      return config
    }))
}

function registerVpc (
  target /* : string */,
  vpcSecurityGroups /* : string */,
  vpcSubnets /* : string */,
  separator /* : string */
) /* : Promise<void> */ {
  // Only add vpc configuration if security groups and subnets are provided
  if (!vpcSecurityGroups || !vpcSubnets) {
    return Promise.resolve()
  }
  const configPath = path.join(target, 'serverless.yml')

  // https://serverless.com/framework/docs/providers/aws/guide/functions#vpc-configuration

  return updateYamlFile(configPath, (config) => {
    config.provider = config.provider || {}
    config.provider.vpc = {
      securityGroupIds: vpcSecurityGroups.split(separator).map((securityGroup) => securityGroup.trim()),
      subnetIds: vpcSubnets.split(separator).map((subnet) => subnet.trim())
    }
    return config
  })
}

module.exports = {
  applyTemplate,
  copyConfiguration,
  copyProject,
  copyRecursive,
  copyWrapper,
  getCors,
  getProjectPath,
  getFunctionName,
  getRoutes,
  registerFunctions,
  registerRootProxy,
  registerVpc
}
