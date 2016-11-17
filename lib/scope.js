/* @flow */
'use strict'

/* ::
import type {BlinkMRC} from '../types.js'
*/

const chalk = require('chalk')
const Table = require('cli-table2')
const objectMerge = require('object-merge')

const projectMeta = require('./utils/project-meta.js')

function read (
  cwd /* : string */
) /* : Promise<BlinkMRC> */ {
  return projectMeta.read(cwd)
    .then((cfg) => cfg || {})
}

function display (
  logger /* : any */,
  cwd /* : string */
) /* : Promise<void> */ {
  return read(cwd)
    .then((meta) => meta.project ? meta : Promise.reject())
    .catch(() => Promise.reject(new Error('Scope has not been set yet, see --help for information on how to set scope.')))
    .then((meta) => {
      var table = new Table()
      table.push(
        [{
          content: chalk.bold('Scope'),
          hAlign: 'center',
          colSpan: 2
        }],
        [
          chalk.grey('Project'),
          meta.project
        ],
        [
          chalk.grey('Region'),
          meta.region
        ]
      )
      logger.log(table.toString())
    })
}

function write (
  cwd /* : string */,
  meta /* : BlinkMRC */
) /* : Promise<BlinkMRC> */ {
  meta = meta || {}
  if (!meta.project) {
    return Promise.reject(new Error('meta.project was not defined.'))
  }

  return projectMeta.write(cwd, (config) => objectMerge(config, {
    project: meta.project,
    region: meta.region
  }))
    .then((cfg) => cfg)
}

module.exports = {
  read,
  display,
  write
}
