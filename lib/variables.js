/* @flow */
'use strict'

const chalk = require('chalk')
const Table = require('cli-table3')

const projectMeta = require('./utils/project-meta.js')

function read (
  cwd /* : string */,
  env /* : string */
) /* : Promise<{ [id:string]: string }> */ {
  return projectMeta.read(cwd)
    .then((config) => config && config.server && config.server.variables ? config.server.variables : {})
    .then((variables) => {
      const keys = Object.keys(variables)

      if (!keys.length) {
        return {}
      }

      return keys.reduce((memo, key) => {
        const variable = variables[key]
        switch (typeof variable) {
          case 'string':
            memo[key] = variable
            return memo
          case 'object': {
            if (variable[env]) {
              if (typeof variable[env] !== 'string') {
                throw new Error(`Variable ${key} for Environment ${env} must be a string`)
              }
              memo[key] = variable[env]
            }
            return memo
          }
          default:
            throw new Error(`Variable ${key} must be an object or a string`)
        }
      }, {})
    })
}

function display (
  logger /* : any */,
  cwd /* : string */,
  env /* : string */
) /* : Promise<void> */ {
  return read(cwd, env)
    .then((envVars) => {
      const keys = Object.keys(envVars)
      if (!keys.length) {
        return
      }

      const rows = keys.map((key) => [
        chalk.grey(key),
        envVars[key]
      ])

      rows.unshift([{
        content: chalk.bold(`Environment Variables (${env})`),
        hAlign: 'center',
        colSpan: 2
      }])

      var table = new Table()
      table.push.apply(table, rows)

      logger.log(table.toString())
    })
}

module.exports = {
  read,
  display
}
