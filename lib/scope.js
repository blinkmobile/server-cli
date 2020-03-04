/* @flow */
'use strict'

/* ::
import type {
  BlinkMRC,
  BlinkMRCServer,
  ServerCLIServiceConfig
} from '../types.js'
*/

const chalk = require('chalk')
const Table = require('cli-table2')
const objectMerge = require('object-merge')

const projectMeta = require('./utils/project-meta.js')
const values = require('./values.js')
const { getTenantOrigin, getTenantBucket } = require('./tenants')
function read(cwd /* : string */) /* : Promise<BlinkMRCServer> */ {
  return projectMeta
    .read(cwd)
    .then(cfg => (cfg && cfg.server ? cfg.server : {}))
}

function display(
  logger /* : typeof console */,
  cwd /* : string */,
  env /* : ?string */
) /* : Promise<void> */ {
  return read(cwd)
    .then(meta => (meta.project ? meta : Promise.reject(new Error())))
    .catch(() =>
      Promise.reject(
        new Error(
          'Scope has not been set yet, see --help for information on how to set scope.'
        )
      )
    )
    .then(meta => {
      var table = new Table()
      table.push(
        [
          {
            content: chalk.bold('Scope'),
            hAlign: 'center',
            colSpan: 2
          }
        ],
        [chalk.grey('Project'), meta.project],
        [chalk.grey('Tenant'), meta.tenant],
        [chalk.grey('Timeout'), meta.timeout || values.DEFAULT_TIMEOUT_SECONDS]
      )
      if (env) {
        table.push([chalk.grey('Environment'), env])
      }
      logger.log(table.toString())
    })
}

function write(
  cwd /* : string */,
  meta /* : BlinkMRCServer */
) /* : Promise<BlinkMRCServer> */ {
  meta = meta || {}
  if (!meta.project) {
    return Promise.reject(new Error('meta.project was not defined.'))
  }

  return projectMeta
    .write(cwd, config => {
      return objectMerge(config, {
        server: {
          project: meta.project,
          tenant: meta.tenant
        }
      })
    })
    .then(cfg => cfg.server || {})
}

function serverCLIServiceConfig(
  config /* : BlinkMRCServer */
) /* : ServerCLIServiceConfig */ {
  const serviceCliService = config.service || {}

  const serviceConfig = {
    origin: serviceCliService.origin || getTenantOrigin(config.tenant),
    bucket: serviceCliService.bucket || getTenantBucket(config.tenant)
  }

  if (serviceConfig.origin === 'https://server-cli-service.blinkm.io') {
    serviceConfig.origin = values.TENANTS.ONEBLINK.origin
  }

  if (serviceConfig.bucket === 'server-cli-service-bundles-multitenant') {
    serviceConfig.bucket = values.TENANTS.ONEBLINK.bucket
  }

  return serviceConfig
}

module.exports = {
  read,
  display,
  write,
  serverCLIServiceConfig
}
