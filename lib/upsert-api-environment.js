/* @flow */
'use strict'

/* ::
import type {
  API,
  BlinkMRCServer
} from '../types.js'
*/

const request = require('request')

const readCors = require('./cors/read.js')
const readRoutes = require('./routes/read.js')
const scope = require('./scope.js')

module.exports = async function upsertAPIEnvironment(
  config /* : BlinkMRCServer */,
  api /* : API */,
  environment /* : string */,
  cwd /* : string */,
  accessToken /* : string | void */
) /* : Promise<void> */ {
  const cors = await readCors(cwd)
  const routes = await readRoutes(cwd)
  const serverCLIServiceConfig = scope.serverCLIServiceConfig(config)
  return new Promise((resolve, reject) => {
    if (!config.project) {
      return reject(
        new Error('Please run the "scope" command to set the project scope.')
      )
    }
    request.put(
      `${serverCLIServiceConfig.origin}/apis/${
        config.project
      }/environments/${environment}`,
      {
        auth: {
          bearer: accessToken
        },
        json: {
          routes,
          cors,
          vpcSecurityGroupIds: api.vpcSecurityGroupIds,
          vpcSubnetIds: api.vpcSubnetIds
        }
      },
      (err, response, body) => {
        if (err) {
          return reject(err)
        }
        if (response.statusCode !== 200) {
          return reject(
            new Error(
              body && body.message
                ? body.message
                : 'Unknown error, please try again and contact support if the problem persists'
            )
          )
        }
        return resolve(body)
      }
    )
  })
}
