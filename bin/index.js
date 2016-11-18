#!/usr/bin/env node

/* eslint-disable no-console */ // this is a CLI entrypoint

'use strict'

const path = require('path')

const meow = require('meow')
const updateNotifier = require('update-notifier')
const chalk = require('chalk')

const BlinkMobileIdentity = require('@blinkmobile/bm-identity')

const pkg = require('../package.json')

const blinkMobileIdentity = new BlinkMobileIdentity(pkg.name)

updateNotifier({ pkg }).notify()

const help = `
Usage: blinkm server <command> <project_path>

Where command is one of:

  info, serve, scope, deploy

And project_path is path to project directory, defaults to current working directory

Local development:
  info                    => displays project information
  serve                   => start a local development server using local API files
    --port <port>         => sets the port to use for server

Initial settings:
  scope                   => displays the current scope
    --project <project>   => sets the project id
    --region <region>     => optionally sets the region

Deploying server side code:
  deploy                  => deploy the project
    --force               => deploy without confirmation
`

const cli = meow({
  help,
  version: true
}, {
  boolean: [
    'force'
  ],
  default: {
    'force': false,
    'stage': 'test'
  },
  string: [
    'out',
    'port',
    'stage'
  ]
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
  cwd: input[0] || process.cwd(),
  blinkMobileIdentity
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
