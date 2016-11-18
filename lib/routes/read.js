/* @flow */
'use strict'

/* ::
import type {RouteConfiguration} from '../../types.js'
*/

const projectMeta = require('../utils/project-meta.js')
const project = require('../project.js')

function readRoutes (
  cwd /* : string */
) /* : Promise<Array<RouteConfiguration>> */ {
  return projectMeta.read(cwd)
    .then((config) => {
      if (config.server && config.server.routes) {
        return config.server.routes
      }
      return project.listRoutes(cwd)
    })
    .then((routes) => routes || [])
}

module.exports = readRoutes
