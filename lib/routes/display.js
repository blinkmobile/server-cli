/* @flow */
'use strict'

const Table = require('cli-table2')
const chalk = require('chalk')

const readRoutes = require('./read.js')
const validateRoute = require('./validate.js')

function displayRoutes (
  logger /* : any */,
  cwd /* : string */
) /* : Promise<void> */ {
  return readRoutes(cwd)
    .then((routeConfigs) => {
      const table = new Table()
      const headings = ['Route', 'Module', 'Info']
      table.push(headings.map((heading) => ({
        content: chalk.bold(heading),
        hAlign: 'center'
      })))

      if (!routeConfigs || !routeConfigs.length) {
        table.push([{
          content: 'No routes found',
          colSpan: 3
        }])
        logger.log(table.toString())
        return Promise.reject(new Error('No routes found, see documentation for information on how to create routes.'))
      } else {
        let totalErrors = 0
        return Promise.all(routeConfigs.map((routeConfig) => {
          return validateRoute(cwd, routeConfig)
            .then(errors => {
              const tableRow = [
                routeConfig.route,
                routeConfig.module
              ]
              if (errors && errors.length) {
                totalErrors++
                tableRow.push(chalk.red(errors.join('\n')))
              } else {
                tableRow.push(chalk.green('OK'))
              }
              table.push(tableRow)
            })
        }))
          .then(() => {
            logger.log(table.toString())
            if (totalErrors) {
              return Promise.reject(new Error(`${totalErrors} of ${routeConfigs.length} route configurations are not valid.`))
            }
          })
      }
    })
}

module.exports = displayRoutes
