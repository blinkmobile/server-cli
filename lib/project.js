/* @flow */
'use strict'

/* ::
import type {RouteConfiguration} from './routes/read.js'
*/

const glob = require('glob')
const pify = require('pify')

function listAPIs (
  cwd /* : string */
) /* : Promise<Array<string>> */ {
  return pify(glob)('./*/index.js', { cwd })
    .then((matches) => matches.map((match) => match.split('/')[1]))
}

function listRoutes (
  cwd /* : string */
) /* : Promise<Array<RouteConfiguration>> */ {
  return listAPIs(cwd)
    .then((apis) => apis.map((api) => ({
      route: `/${api}`,
      module: `./${api}/index.js`,
      params: {}
    })))
}

module.exports = {
  listAPIs,
  listRoutes
}
