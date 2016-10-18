'use strict'

const path = require('path')

const test = require('ava')

const lib = require('../lib/apis.js')

const EXAMPLE_DIR = path.join(__dirname, '..', 'examples', 'directory')
const CONFIGURATION_DIR = path.join(__dirname, '..', 'examples', 'configuration')

test('getHandlerConfig()', (t) => {
  const tests = [
    { args: [ EXAMPLE_DIR, '/missing', 'get' ], expected: 'undefined', params: undefined },
    { args: [ EXAMPLE_DIR, '/helloworld', 'get' ], expected: 'function', params: {} },
    { args: [ EXAMPLE_DIR, '/methods', 'get' ], expected: 'function', params: {} },
    { args: [ EXAMPLE_DIR, '/methods', 'patch' ], expected: 'object', params: {} },
    { args: [ CONFIGURATION_DIR, '/api/missing', 'get' ], expected: 'undefined', params: undefined },
    { args: [ CONFIGURATION_DIR, '/api/books', 'get' ], expected: 'function', params: {} },
    { args: [ CONFIGURATION_DIR, '/api/books', 'patch' ], expected: 'object', params: {} },
    { args: [ CONFIGURATION_DIR, '/api/books/123', 'get' ], expected: 'function', params: { id: '123' } }
  ]
  return Promise.all(tests.map(({ args, expected, params }) => lib.getHandlerConfig(...args)))
    .then((results) => {
      tests.forEach(({ args, expected, params }, index) => {
        t.is(typeof results[index].handler, expected)
        t.deepEqual(results[index].params, params)
      })
    })
})

test('getRouteConfig()', (t) => {
  const tests = [
    {
      args: [ EXAMPLE_DIR, '/helloworld' ],
      expected: {
        route: '/helloworld',
        module: path.join(EXAMPLE_DIR, './helloworld/index.js'),
        params: {}
      }
    },
    {
      args: [ CONFIGURATION_DIR, '/api/books' ],
      expected: {
        route: '/api/books',
        module: path.join(CONFIGURATION_DIR, './api/books.js'),
        params: {}
      }
    },
    {
      args: [ CONFIGURATION_DIR, '/api/books/123' ],
      expected: {
        route: '/api/books/{id}',
        module: path.join(CONFIGURATION_DIR, './api/book.js'),
        params: {
          id: '123'
        }
      }
    },
    {
      args: [ CONFIGURATION_DIR, '/missing' ],
      expected: undefined
    }
  ]
  return Promise.all(tests.map(({ args, expected }) => lib.getRouteConfig(...args)))
    .then((results) => {
      tests.forEach(({ args, expected }, index) => {
        t.deepEqual(results[index], expected)
      })
    })
})

test('wipeRouteFromRequireCache()', (t) => {
  return lib.getHandlerConfig(CONFIGURATION_DIR, '/api/books')
    .then(() => lib.getRouteConfig(CONFIGURATION_DIR, '/api/books'))
    .then((routeConfig) => {
      t.truthy(require.cache[routeConfig.module])
      return lib.wipeRouteFromRequireCache(CONFIGURATION_DIR, '/api/books')
        .then(() => t.falsy(require.cache[routeConfig.module]))
    })
})
