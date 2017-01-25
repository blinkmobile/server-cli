'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')

const TEST_SUBJECT = '../lib/serverless.js'

test.beforeEach((t) => {
  t.context.getTestSubject = (overrides) => {
    overrides = overrides || {}
    return proxyquire(TEST_SUBJECT, Object.assign({
      './utils/yaml.js': {
        updateYamlFile: (filePath, update) => Promise.resolve(update({}))
      }
    }, overrides))
  }
})

test('registerVpc() should return undefined if vpc configuation was not added', (t) => {
  const serverless = t.context.getTestSubject()
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
  const serverless = t.context.getTestSubject({
    './utils/yaml.js': {
      updateYamlFile: (filePath, update) => Promise.resolve(update({}))
    }
  })
  return serverless.registerVpc('.', '123, 456', 'abc, def', ',')
    .then((result) => t.deepEqual(result, expected))
})
