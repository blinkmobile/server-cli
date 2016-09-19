#! /usr/bin/env node

/* eslint-disable no-console */ // this is a CLI entrypoint

'use strict'

const path = require('path')

const meow = require('meow')
const updateNotifier = require('update-notifier')

const pkg = require('../package.json')

updateNotifier({ pkg }).notify()

const help = `
Oh, no! --help is not finished yet! :(
`

const cli = meow({
  version: true
})

const command = cli.input[0]

if (!command) {
  console.log(help)
  process.exit(0)
}

let main
try {
  main = require(path.join(__dirname, '..', 'commands', command))
} catch (err) {
  console.error(`unknown command: ${command}`)
  console.log(help)
  process.exit(1)
}

Promise.resolve()
  .then(() => main(cli.input.slice(1), cli.flags, console, {
    cwd: process.cwd()
  }))
  .catch((err) => {
    // TODO: properly handle specific errors to avoid showing stack traces
    console.error(`Error executing "${command}"`)
    console.error(err)
    console.log(help)
    process.exit(1)
  })
