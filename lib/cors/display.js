/* @flow */
'use strict'

const Table = require('cli-table2')
const chalk = require('chalk')

const readCors = require('./read.js')
const validateCors = require('./validate.js')
const values = require('../values.js')

function displayCors (
  logger /* : any */,
  cwd /* : string */
) /* : Promise<void> */ {
  return readCors(cwd)
    .then((cors) => validateCors(cors))
    .then((cors) => {
      const table = new Table()
      table.push([{
        content: chalk.bold('Cors Configuration'),
        hAlign: 'center',
        colSpan: 2
      }])

      const headings = [
        'Origins',
        'Headers' + (cors.headers ? '' : ' (defaults)')
      ]
      table.push(headings.map((heading) => (chalk.grey(heading))))

      const tableRow = [
        cors.origins,
        (cors.headers || values.DEFAULT_HEADERS)
      ]
      const ordered = tableRow.map((section) => section.sort().join('\n'))
      table.push(ordered)

      logger.log(table.toString())
    })
}

module.exports = displayCors
