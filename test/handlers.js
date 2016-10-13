'use strict'

const path = require('path')

const test = require('ava')

const lib = require('../lib/handlers.js')

const EXAMPLE_DIR = path.join(__dirname, '..', 'examples', 'directory')
const CONFIGURATION_DIR = path.join(__dirname, '..', 'examples', 'configuration')

test('executeHandler()', (t) => {
  let isHandlerCalled = false
  const request = {}
  const handler = (req) => {
    t.is(req, request)
    isHandlerCalled = true
  }
  return lib.executeHandler(handler, request)
    .then(() => t.truthy(isHandlerCalled))
})

test('getHandler()', (t) => {
  const tests = [
    { args: [ path.join(EXAMPLE_DIR, 'missing'), 'get' ], expected: 'undefined' },
    { args: [ path.join(EXAMPLE_DIR, 'helloworld'), 'get' ], expected: 'function' },
    { args: [ path.join(EXAMPLE_DIR, 'methods'), 'get' ], expected: 'function' },
    { args: [ path.join(EXAMPLE_DIR, 'methods'), 'patch' ], expected: 'object' },
    { args: [ path.join(CONFIGURATION_DIR, 'api/missing'), 'get' ], expected: 'undefined' },
    { args: [ path.join(CONFIGURATION_DIR, 'api/request'), 'get' ], expected: 'function' },
    { args: [ path.join(CONFIGURATION_DIR, 'api/books'), 'get' ], expected: 'function' },
    { args: [ path.join(CONFIGURATION_DIR, 'api/books'), 'patch' ], expected: 'object' }
  ]
  tests.forEach(({ args, expected }) => {
    t.is(typeof lib.getHandler(...args), expected)
  })
})
