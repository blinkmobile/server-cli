'use strict'

const test = require('ava')

const validate = require('../../lib/cors/validate.js')

const HELP = ', see documentation for information on how to configure cors.'

test('Should reject if cors is not truthy', (t) => {
  t.throws(validate(), 'Must specify cors configuration' + HELP)
})

test('Should reject if cors does not have origins property', (t) => {
  t.throws(validate({}), 'Must specify at least a single allowable origin in cors configuration' + HELP)
})

test('Should reject if origins is not an array', (t) => {
  t.throws(validate({
    origins: {}
  }), 'Must specify at least a single allowable origin in cors configuration' + HELP)
})

test('Should reject if origins is an empty array', (t) => {
  t.throws(validate({
    origins: []
  }), 'Must specify at least a single allowable origin in cors configuration' + HELP)
})

test('Should reject if origins contains "*"', (t) => {
  t.throws(validate({
    origins: ['*']
  }), 'Cannot specify all origins as allowable in cors configuration i.e. "*"' + HELP)
})

test('Should reject if origins contains invalid urls', (t) => {
  t.throws(validate({
    origins: ['test', '123']
  }), 'The following origins in cors configuration are not valid: test, 123')
})

test('Should reject if headers is defined but not as an array', (t) => {
  t.throws(validate({
    origins: ['http://test'],
    headers: 'test'
  }), 'Invalid headers in cors configuration' + HELP)
})
