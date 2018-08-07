#!/usr/bin/env node

/* eslint-disable no-console */ // this is a CLI entrypoint

'use strict'

const path = require('path')

const meow = require('meow')
const updateNotifier = require('update-notifier')
const chalk = require('chalk')
const execa = require('execa')

const BlinkMobileIdentity = require('@blinkmobile/bm-identity')

const pkg = require('../package.json')

const blinkMobileIdentity = new BlinkMobileIdentity(pkg.name)

updateNotifier({ pkg }).notify()

const help = `
Usage: blinkm server <command>

Where command is one of:

  info, serve, scope, deploy, logs, serverless

Local development:

  info                        => displays project information
    --env <environment>       => optionally sets the environment to display information for, defaults to 'dev'
    --cwd <path>              => optionally set the path to project, defaults to current working directory
  serve                       => start a local development server using local API files
    --env <environment>       => optionally sets the environment to load environment variables from, defaults to 'dev'
    --port <port>             => optionally sets the port to use for server, defaults to 3000
    --cwd <path>              => optionally set the path to project, defaults to current working directory

Initial settings:

  scope                       => displays the current scope
    <project>                 => sets the project id
    --region <region>         => optionally sets the region
    --cwd <path>              => optionally set the path to project, defaults to current working directory

Deploying server side code:

  The deploy command requires a login to BlinkMobile before use.
  For help on the login and logout commands please see:
  https://github.com/blinkmobile/identity-cli#usage

  deploy                      => deploy the project
    --force                   => deploy without confirmation
    --env <environment>       => optionally sets the environment to deploy to, defaults to 'dev'
    --cwd <path>              => optionally set the path to project, defaults to current working directory

Viewing server logs:

  logs                        => view logs for project
    --tail                    => keep listening for new logs in your terminal session
    --filter <filterPattern>  => optionally set a search filter, defaults to all logs
    --start-time <startTime>  => a unit in time to start fetching logs from (ie: 2010-10-20 or 1469705761), defaults to all logs
    --env <environment>       => optionally set the environment to view logs for, defaults to 'dev'
    --cwd <path>              => optionally set the path to project, defaults to current working directory

Create serverless project:

  serverless                       => create serverless project
    --deployment-bucket <bucket>   => set the deployment S3 bucket
    --execution-role <role>        => set the execution IAM Role ARN
    --vpc-security-groups <groups> => comma separated list of VPC Security Group identifiers
    --vpc-subnets <subnets>        => comma separated list of VPC Subnet identifiers
    --bm-server-version <version>  => server version of @blinkmobile/sever-cli that the project was created with
    --env <environment>            => optionally set the environment, defaults to 'dev'
    --cwd <path>                   => optionally set the path to project, defaults to current working directory
`

const cli = meow({
  help,
  flags: {
    'force': {
      type: 'boolean',
      default: false
    },
    'tail': {
      type: 'boolean',
      default: false
    },
    'bmServerVersion': {
      type: 'string',
      default: pkg.version
    },
    'cwd': {
      type: 'string',
      default: process.cwd()
    },
    'deploymentBucket': {
      type: 'string'
    },
    'env': {
      type: 'string',
      default: 'dev'
    },
    'executionRole': {
      type: 'string'
    },
    'filter': {
      type: 'string'
    },
    'out': {
      type: 'string'
    },
    'port': {
      type: 'string'
    },
    'region': {
      type: 'string',
      default: 'ap-southeast-2'
    },
    'startTime': {
      type: 'string'
    },
    'vpcSecurityGroups': {
      type: 'string'
    },
    'vpcSubnets': {
      type: 'string'
    }
  }
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
  blinkMobileIdentity
}

Promise.resolve()
  .then(() => main(input, cli.flags, console, options))
  .catch((err) => {
    return execa('npm', ['-v'])
      .then(({ stdout: npmVersion }) => {
        console.error(`
There was a problem executing '${command}':

${chalk.red(err)}

Please fix the error and try again.

${chalk.grey(`Your Environment Information:
  Server CLI Version:   v${pkg.version}
  Node Version:         ${process.version}
  NPM Version:          v${npmVersion}`)}`)
        process.exitCode = 1
      })
  })
