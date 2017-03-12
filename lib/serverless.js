/* @flow */
'use strict'

/* ::
import type {
  BlinkMRCServer, CorsConfiguration, RouteConfiguration
} from '../types.js'
*/

const path = require('path')

const execa = require('execa')
const loadJsonFile = require('load-json-file')
const writeJsonFile = require('write-json-file')

const nonAlphaNumericToDashes = require('./utils/non-alpha-numeric-to-dashes.js')
const readCors = require('./cors/read.js')
const readRoutes = require('./routes/read.js')
const scope = require('./scope.js')
const updateYamlFile = require('./utils/yaml.js').updateYamlFile
const copyRecursive = require('./utils/copy-recursive.js')
const validateCors = require('./cors/validate.js')

const HANDLER = 'handler'
const WRAPPER = path.join(__dirname, '..', 'dist', 'wrapper.js')

function applyTemplate (
  cwd /* : string */
) /* : Promise<void> */ {
  return execa(path.join(__dirname, '..', 'node_modules', '.bin', 'serverless'), [ 'create', '--template', 'aws-nodejs' ], { cwd })
}

function copyConfiguration (
  target /* : string */,
  projectPath /* : string */,
  env /* : string */
) /* : Promise<void> */ {
  const configPath = path.join(target, 'bm-server.json')
  return Promise.all([
    readCors(projectPath)
      .then((cors) => cors ? validateCors(cors) : false),
    readRoutes(projectPath)
  ])
    .then((results) => writeJsonFile(configPath, {
      cors: results[0],
      routes: results[1].map((routeConfig, index) => {
        routeConfig.module = path.join(projectPath, routeConfig.module)
        return routeConfig
      })
    }))
}

function copyProject (
  source /* : string */,
  target /* : string */
) /* : Promise<string> */ {
  const projectPath = path.join(target, 'project')
  return copyRecursive(source, projectPath)
    .then(() => projectPath)
}

function copyWrapper (
  target /* : string */
) /* : Promise<void> */ {
  const wrapperPath = path.join(target, `${HANDLER}.js`)
  return copyRecursive(WRAPPER, wrapperPath)
}

function getFunctionName (
  cfg /* : BlinkMRCServer */,
  routeConfig /* : RouteConfiguration */,
  env /* : string */
) /* : string */ {
  // Lambdas do not allow for any characters other than alpha-numeric and dashes in function names
  const arr = [cfg.project || '', env, routeConfig.route]
  const mapped = arr.map(nonAlphaNumericToDashes)
  return mapped.join('-')
}

function registerFunctions (
  target /* : string */,
  projectPath /* : string */,
  env /* : string */
) /* : Promise<void> */ {
  return Promise.all([
    readRoutes(projectPath),
    scope.read(projectPath)
  ])
    .then((results) => {
      const routeConfigs = results[0]
      const cfg = results[1]

      return updateServerlessYamlFile(target, (config) => {
        config.service = nonAlphaNumericToDashes(cfg.project || '')
        config.provider = config.provider || {}
        config.provider.region = cfg.region
        config.provider.stage = env
        config.functions = routeConfigs.reduce((functions, routeConfig, index) => {
          // The route must not start with a leading '/'
          const route = routeConfig.route.substr(1)
          const functionName = getFunctionName(cfg, routeConfig, env)
          functions[functionName] = {
            events: [{
              http: `ANY ${route}`
            }],
            handler: `${HANDLER}.handler`,
            name: functionName,
            description: routeConfig.route,
            timeout: routeConfig.timeout
          }
          return functions
        }, {})

        return config
      })
    })
}

function registerDeploymentBucket (
  target /* : string */,
  deploymentBucket /* : string | void */
) /* : Promise<void> */ {
  if (!deploymentBucket) {
    return Promise.resolve()
  }
  return updateServerlessYamlFile(target, (config) => {
    config.provider = config.provider || {}
    config.provider.deploymentBucket = deploymentBucket
    return config
  })
}

function registerExecutionRole (
  target /* : string */,
  executionRole /* : string | void */
) /* : Promise<void> */ {
  if (!executionRole) {
    return Promise.resolve()
  }
  return updateServerlessYamlFile(target, (config) => {
    config.provider = config.provider || {}
    config.provider.role = executionRole
    return config
  })
}

function registerRootProxy (
  target /* : string */,
  env /* : string */
) /* : Promise<void> */ {
  // TODO: detect root route Lambda function (if any) and skip this proxy

  // https://serverless.com/framework/docs/providers/aws/events/apigateway#setting-an-http-proxy-on-api-gateway

  return loadJsonFile(path.join(__dirname, 'root-route-proxy.json'))
    .then((resources) => updateServerlessYamlFile(target, (config) => {
      config.resources = resources
      return config
    }))
}

function registerVpc (
  target /* : string */,
  vpcSecurityGroups /* : string | void */,
  vpcSubnets /* : string | void */,
  separator /* : string */
) /* : Promise<void> */ {
  // Only add vpc configuration if security groups and subnets are provided
  if (!vpcSecurityGroups || !vpcSubnets) {
    return Promise.resolve()
  }
  // https://serverless.com/framework/docs/providers/aws/guide/functions#vpc-configuration
  return updateServerlessYamlFile(target, (config) => {
    // need the extra check here incase things changed during updateServerlessYamlFile() (flow-type)
    if (vpcSecurityGroups && vpcSubnets) {
      config.provider = config.provider || {}
      config.provider.vpc = {
        securityGroupIds: vpcSecurityGroups.split(separator).map((securityGroup) => securityGroup.trim()),
        subnetIds: vpcSubnets.split(separator).map((subnet) => subnet.trim())
      }
    }
    return config
  })
}

function updateServerlessYamlFile (
  target /* : string */,
  updater /* : (data: Object) => Object */
) /* : Promise<void> */ {
  const configPath = path.join(target, 'serverless.yml')
  return updateYamlFile(configPath, updater)
}

module.exports = {
  applyTemplate,
  copyConfiguration,
  copyProject,
  copyWrapper,
  getFunctionName,
  registerDeploymentBucket,
  registerExecutionRole,
  registerFunctions,
  registerRootProxy,
  registerVpc
}
