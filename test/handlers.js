'use strict'

const path = require('path')

const test = require('ava')

const lib = require('../lib/handlers.js')
const BmResponse = require('../lib/bm-response.js')

const EXAMPLE_DIR = path.join(__dirname, '..', 'examples', 'directory')
const CONFIGURATION_DIR = path.join(__dirname, '..', 'examples', 'configuration')

test('executeHandler() should call handler()', (t) => {
  t.plan(1)
  const request = {}
  const handler = (req) => {
    t.is(req, request)
  }
  return lib.executeHandler(handler, request)
})

test('executeHandler() should return a BmResponse with correct values', (t) => {
  const statusCode = 1
  const payload = {
    key: 'value'
  }
  const headers = {
    'one': '1',
    'two': '2'
  }
  return lib.executeHandler((request, response) => {
    response.setStatusCode(statusCode)
    response.setPayload(payload)
    Object.keys(headers).forEach((key) => response.setHeader(key, headers[key]))
  })
    .then((response) => {
      t.truthy(response instanceof BmResponse)
      t.is(response.statusCode, statusCode)
      t.deepEqual(response.payload, payload)
      t.deepEqual(response.headers, headers)
    })
})

test('executeHandler() should return a BmResponse with status code set from handler that return number', (t) => {
  return lib.executeHandler(() => 201)
    .then((response) => t.is(response.statusCode, 201))
})

test('executeHandler() should return a BmResponse with payload set from handler that return a truthy value that is not a number', (t) => {
  return lib.executeHandler(() => 'payload')
    .then((response) => t.is(response.payload, 'payload'))
})

test('getHandler() valid modules', (t) => {
  const tests = [
    { args: [ path.join(EXAMPLE_DIR, 'helloworld'), 'get' ], expected: 'function' },
    { args: [ path.join(EXAMPLE_DIR, 'methods'), 'get' ], expected: 'function' },
    { args: [ path.join(EXAMPLE_DIR, 'methods'), 'patch' ], expected: 'object' },
    { args: [ path.join(CONFIGURATION_DIR, 'api/request'), 'get' ], expected: 'function' },
    { args: [ path.join(CONFIGURATION_DIR, 'api/books'), 'get' ], expected: 'function' },
    { args: [ path.join(CONFIGURATION_DIR, 'api/books'), 'patch' ], expected: 'object' }
  ]
  return tests.reduce((prev, config) => {
    return prev.then(() => lib.getHandler.apply(null, config.args))
      .then(result => t.is(typeof result, config.expected))
  }, Promise.resolve())
})

test('getHandler() invalid modules', (t) => {
  const tests = [
    { args: [ path.join(EXAMPLE_DIR, 'missing'), 'get' ], expected: `Cannot find module '${path.join(EXAMPLE_DIR, 'missing')}'` },
    { args: [ path.join(CONFIGURATION_DIR, 'api/missing'), 'get' ], expected: `Cannot find module '${path.join(CONFIGURATION_DIR, 'api/missing')}'` }
  ]

  return tests.reduce((prev, config) => {
    return prev.then(() => t.throws(lib.getHandler.apply(null, config.args), config.expected))
  }, Promise.resolve())
})
