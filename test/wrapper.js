/* @flow */
'use strict'

const test = require('ava')

const lib = require('../lib/wrapper.js')

test('keysToLowerCase()', (t) => {
  const input = { Hello: 'World!' }
  const expected = { hello: 'World!' }
  t.deepEqual(lib.keysToLowerCase(input), expected)
})

test('normaliseMethod()', (t) => {
  t.is(lib.normaliseMethod('GET'), 'get')
})

test('protocolFromHeaders() with no headers', (t) => {
  t.is(lib.protocolFromHeaders({}), 'http:')
})
