/* @flow */
'use strict'

const configLoader = require('@blinkmobile/blinkmrc')

const pkg = require('../../package.json')

function projectConfig (
  cwd /* : string */
) /* : any */ {
  return configLoader.projectConfig({
    name: pkg.name,
    cwd: cwd
  })
}

function read (
  cwd /* : string */
) /* : Promise<any> */ {
  return projectConfig(cwd).load()
}

function write (
  cwd /* : string */,
  updater /* : Function */
) /* : Promise<any> */ {
  return projectConfig(cwd).update(updater)
}

module.exports = {
  read,
  write
}
