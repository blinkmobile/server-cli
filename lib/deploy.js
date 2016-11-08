/* @flow */
'use strict'

const chalk = require('chalk')
const inquirer = require('inquirer')

function confirm (
  logger /* : any */,
  force /* : boolean */
) /* : Promise<boolean> */ {
  if (force) {
    return Promise.resolve(true)
  }
  logger.log(chalk.yellow(`
Please check configuration before continuing
`))
  const promptQuestions = [{
    type: 'confirm',
    name: 'confirmation',
    message: 'Would you like to continue: [Y]'
  }]
  return inquirer.prompt(promptQuestions)
    .then(results => results.confirmation)
}

module.exports = {
  confirm
}
