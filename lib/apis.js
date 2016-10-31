/* @flow */
'use strict'

/* ::
import type {RouteConfiguration} from './routes/read.js'
export type HandlerConfiguration = {
  handler: Function | void,
  params: {
    [id:string]: string
  }
}
*/

const path = require('path')

const uniloc = require('uniloc')

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
    .then((routes) => {
      routes = routes || []
      const unilocRoutes = routes.reduce((memo, r) => {
        memo[r.route] = `GET ${r.route.replace('{', ':').replace('}', '')}`
        return memo
      }, {})
      const unilocRouter = uniloc(unilocRoutes)
      const unilocRoute = unilocRouter.lookup(route, 'GET') || {}

      const routeConfig = routes.find((routeConfig) => routeConfig.route === unilocRoute.name)
      if (!routeConfig) {
        return Promise.reject(new Error(`Route has not been implemented: /${route}`))
      }

      routeConfig.module = path.resolve(cwd, routeConfig.module)
      routeConfig.params = unilocRoute.options
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
