'use strict'

const path = require('path')

const test = require('ava')

const lib = require('../lib/project.js')

const EXAMPLE_DIR = path.join(__dirname, '..', 'examples', 'directory')

test('listAPIs()', (t) => {
  const expected = [
    'boom',
    'helloworld',
    'methods',
    'promise',
    'request',
    'response'
  ]
  return lib.listAPIs(EXAMPLE_DIR)
    .then((results) => t.deepEqual(results, expected))
})

test('listRoutes()', (t) => {
  const expected = [
    {
      'route': '/boom',
      'module': './boom/index.js'
    },
    {
      'route': '/helloworld',
      'module': './helloworld/index.js'
    },
    {
      'route': '/methods',
      'module': './methods/index.js'
    },
    {
      'route': '/promise',
      'module': './promise/index.js'
    },
    {
      'route': '/request',
      'module': './request/index.js'
    },
    {
      'route': '/response',
      'module': './response/index.js'
    }
  ]
  return lib.listRoutes(EXAMPLE_DIR)
    .then((results) => t.deepEqual(results, expected))
})
