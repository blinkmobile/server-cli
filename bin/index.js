#! /usr/bin/env node

/* eslint-disable no-console */ // this is a CLI entrypoint

'use strict'

const path = require('path')

const meow = require('meow')
const updateNotifier = require('update-notifier')
const chalk = require('chalk')

const pkg = require('../package.json')

updateNotifier({ pkg }).notify()

const help = `
Usage: blinkm server <command> <project_path>

Commands:
  serve                   => start a local development server using local API files
  info                    => displays project information
  scope                   => displays the current scope
    --project <project>   => sets the project id
    --region <region>     => optionally sets the region
`

const cli = meow({
  help,
  version: true
}, {
  string: [ 'out' ]
})

const command = cli.input[0]

if (!command) {
  cli.showHelp(0)
}

let main
try {
  main = require(path.join(__dirname, '..', 'commands', `${command}.js`))
} catch (err) {
  console.error(chalk.red(`
Unknown command: ${command}`))
  cli.showHelp(1)
}

if (typeof main !== 'function') {
  console.error(chalk.red(`
Command not implemented: ${command}`))
  cli.showHelp(1)
}

const input = cli.input.slice(1)
const options = {
  cwd: input[0] || process.cwd()
}

Promise.resolve()
  .then(() => main(input, cli.flags, console, options))
  .catch((err) => {
    console.error(`
There was a problem executing '${command}':

${chalk.red(err)}

Please fix the error and try again.
`)
    process.exitCode = 1
  })
