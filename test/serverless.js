/* @flow */
'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')

const TEST_SUBJECT = '../lib/serverless.js'

function getTestSubject (
  overrides /* : { [id:string]: any } | void */
) /* : any */ {
  overrides = overrides || {}
  return proxyquire(TEST_SUBJECT, Object.assign({
    './utils/yaml.js': {
      updateYamlFile: (filePath, update) => Promise.resolve(update({}))
    },
    './routes/read.js': () => Promise.resolve([{
      route: '/helloworld',
      module: '.'
    }]),
    './scope.js': {
      read: () => Promise.resolve({
        project: 'project-name.api.blinkm.io',
        region: 'region-name'
      })
    }
  }, overrides))
}

test('registerFunctions()', (t) => {
  const expected = {
    functions: {
      '0': {
        description: '/helloworld',
        events: [{
          http: 'ANY helloworld'
        }],
        handler: 'handler.handler',
        name: 'project-name-api-blinkm-io-prod-0',
        timeout: 15
      }
    },
    provider: {
      deploymentBucket: 'deployment-bucket',
      region: 'region-name',
      role: 'execution-role',
      stage: 'prod'
    },
    service: 'project-name-api-blinkm-io'
  }
  const serverless = getTestSubject()
  return serverless.registerFunctions('.', 'prod', 'deployment-bucket', 'execution-role')
    .then((result) => t.deepEqual(result, expected))
})

test('registerVpc() should return undefined if vpc configuation was not added', (t) => {
  const serverless = getTestSubject()
  return serverless.registerVpc()
    .then((result) => t.falsy(result))
})

test('registerVpc() should return undefined if vpc configuation was not added', (t) => {
  const serverless = getTestSubject()
  return serverless.registerVpc()
    .then((result) => t.falsy(result))
})

test('registerVpc() should return config with vpc configuration added', (t) => {
  const expected = {
    provider: {
      vpc: {
        securityGroupIds: [
          '123',
          '456'
        ],
        subnetIds: [
          'abc',
          'def'
        ]
      }
    }
  }
  const serverless = getTestSubject()
  return serverless.registerVpc('.', '123, 456', 'abc, def', ',')
    .then((result) => t.deepEqual(result, expected))
})
