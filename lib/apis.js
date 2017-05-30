/* @flow */
'use strict'

/* ::
import type {
  HandlerConfiguration,
  RouteConfiguration
} from '../types.js'
*/

const path = require('path')

const handlers = require('./handlers.js')
const readRoutes = require('./routes/read.js')

function getHandlerConfig (
  routeConfig /* : RouteConfiguration */,
  method /* : string */
) /* : Promise<HandlerConfiguration> */ {
  return handlers.getHandler(routeConfig.module, method)
    .then((handler) => ({
      handler,
      params: routeConfig.params || {}
    }))
}

function getRouteConfig (
  cwd /* : string */,
  route /* : string */
) /* : Promise<RouteConfiguration> */ {
  return readRoutes(cwd)
    .then((routeConfigs) => handlers.findRouteConfig(route, routeConfigs))
    .then((routeConfig) => {
      routeConfig.module = path.resolve(cwd, routeConfig.module)
      wipeRouteFromRequireCache(routeConfig)
      return routeConfig
    })
}

function wipeRouteFromRequireCache (
  routeConfig /* : RouteConfiguration */
) /* : void */ {
  // property names in require.cache are absolute paths
  if (routeConfig && require.cache[routeConfig.module]) {
    delete require.cache[routeConfig.module]
  }
}

module.exports = {
  getHandlerConfig,
  getRouteConfig,
  wipeRouteFromRequireCache
}
