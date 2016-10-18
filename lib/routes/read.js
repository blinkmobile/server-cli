/* @flow */
'use strict'

const configuation = require('../configuration.js')
const project = require('../project.js')

/* ::
export type RouteConfiguration = {
  route: string,
  module: string,
  params: {[id:string]: string}
}
*/

function readRoutes (
  cwd /* : string */
) /* : Promise<Array<RouteConfiguration>> */ {
  return configuation.read(cwd)
    .then((config) => {
      if (config.routes) {
        return config.routes
      }
      return project.listRoutes(cwd) || []
    })
    .then((routes) => routes || [])
}

module.exports = readRoutes
