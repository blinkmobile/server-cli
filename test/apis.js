/* @flow */
'use strict'

const path = require('path')

const test = require('ava')

const lib = require('../lib/apis.js')

const EXAMPLE_DIR = path.join(__dirname, '..', 'example')

test('executeAPI()', (t) => {
  let isHandlerCalled = false
  const request = {}
  const handler = (req) => {
    t.is(req, request)
    isHandlerCalled = true
  }
  return lib.executeAPI(handler, request)
    .then(() => t.truthy(isHandlerCalled))
})

test('getAPI()', (t) => {
  const tests = [
    { args: [ EXAMPLE_DIR, 'missing', 'get' ], expected: 'undefined' },
    { args: [ EXAMPLE_DIR, 'helloworld', 'get' ], expected: 'function' },
    { args: [ EXAMPLE_DIR, 'methods', 'get' ], expected: 'function' },
    { args: [ EXAMPLE_DIR, 'methods', 'patch' ], expected: 'object' }
  ]
  tests.forEach(({ args, expected }) => {
    t.is(typeof lib.getAPI(...args), expected)
  })
})

test('getAPIFilePath()', (t) => {
  const expected = path.join(EXAMPLE_DIR, 'api', 'helloworld', 'index.js')
  t.is(lib.getAPIFilePath(EXAMPLE_DIR, 'helloworld'), expected)
})

test('wipeAPIFromRequireCache()', (t) => {
  lib.getAPI(EXAMPLE_DIR, 'helloworld', 'get')
  const cacheKey = lib.getAPIFilePath(EXAMPLE_DIR, 'helloworld')
  t.truthy(require.cache[cacheKey])
  lib.wipeAPIFromRequireCache(EXAMPLE_DIR, 'helloworld')
  t.falsy(require.cache[cacheKey])
})
