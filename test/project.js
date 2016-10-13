/* @flow */
'use strict'

const path = require('path')

const test = require('ava')

const lib = require('../lib/project.js')

const EXAMPLE_DIR = path.join(__dirname, '..', 'examples', 'directory')

test('listAPIs()', (t) => {
  const expected = [
    'helloworld',
    'methods',
    'promise',
    'request'
  ]
  return lib.listAPIs(EXAMPLE_DIR)
    .then((results) => t.deepEqual(results, expected))
})

test('listRoutes()', (t) => {
  const expected = [
    {
      'route': '/helloworld',
      'module': './helloworld/index.js',
      'params': {}
    },
    {
      'route': '/methods',
      'module': './methods/index.js',
      'params': {}
    },
    {
      'route': '/promise',
      'module': './promise/index.js',
      'params': {}
    },
    {
      'route': '/request',
      'module': './request/index.js',
      'params': {}
    }
  ]
  return lib.listRoutes(EXAMPLE_DIR)
    .then((results) => t.deepEqual(results, expected))
})
