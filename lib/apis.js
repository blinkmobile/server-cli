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
  cwd /* : string */,
  route /* : string */,
  method /* : string */
) /* : Promise<HandlerConfiguration> */ {
  return getRouteConfig(cwd, route)
    .then((routeConfig) => {
      routeConfig = routeConfig || {}
      const handler = handlers.getHandler(routeConfig.module, method)
      return {
        handler,
        params: routeConfig.params
      }
    })
}

function getRouteConfig (
  cwd /* : string */,
  route /* : string */
) /* : Promise<RouteConfiguration | void> */ {
  return readRoutes(cwd)
    .then((routes) => {
      routes = routes || []
      const unilocRoutes = routes.reduce((memo, r) => {
        memo[r.route] = `GET ${r.route.replace('{', ':').replace('}', '')}`
        return memo
      }, {})
      const unilocRouter = uniloc(unilocRoutes)
      const unilocRoute = unilocRouter.lookup(route, 'GET')
      if (unilocRoute) {
        const routeConfig = routes.find((routeConfig) => routeConfig.route === unilocRoute.name)
        if (routeConfig) {
          routeConfig.module = path.resolve(cwd, routeConfig.module)
          routeConfig.params = unilocRoute.options
          return routeConfig
        }
      }
    })
}

function wipeRouteFromRequireCache (
  cwd /* : string */,
  route /* : string */
) /* : Promise<void> */ {
  // property names in require.cache are absolute paths
  return getRouteConfig(cwd, route)
    .then(routeConfig => {
      if (routeConfig) {
        delete require.cache[routeConfig.module]
      }
    })
}

module.exports = {
  getHandlerConfig,
  getRouteConfig,
  wipeRouteFromRequireCache
}
