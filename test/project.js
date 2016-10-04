/* @flow */
'use strict'

const path = require('path')

const test = require('ava')

const lib = require('../lib/project.js')

const EXAMPLE_DIR = path.join(__dirname, '..', 'example')

test('listAPIs()', (t) => {
  const expected = [
    'helloworld',
    'methods',
    'promise',
    'request'
  ]
  lib.listAPIs(EXAMPLE_DIR)
    .then((results) => t.deepEqual(results, expected))
})
