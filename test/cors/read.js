'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')

const TEST_SUBJECT = '../../lib/cors/read.js'

const configurationMock = require('../helpers/configuration.js')

const CWD = 'current working directory'
const CORS = 'cors configuration'

test.beforeEach((t) => {
  t.context.getTestSubject = (overrides) => {
    overrides = overrides || {}
    return proxyquire(TEST_SUBJECT, Object.assign({
      '../configuration.js': configurationMock(() => Promise.resolve({
        cors: CORS
      }))
    }, overrides))
  }
})

test('Should call configuration.read() with correct input', (t) => {
  t.plan(1)
  const read = t.context.getTestSubject({
    '../configuration.js': configurationMock((cwd) => {
      t.is(cwd, CWD)
      return Promise.resolve({
        cors: CORS
      })
    })
  })

  return read(CWD)
})

test('Should handle an unitinitalised config file', (t) => {
  t.plan(1)
  const read = t.context.getTestSubject({
    '../configuration.js': configurationMock((cwd) => Promise.resolve({
      'test': 123
    }))
  })
  return read()
    .then((cors) => t.deepEqual(cors, {}))
})

test('Should return the currently set cors', (t) => {
  const read = t.context.getTestSubject()

  return read(CWD)
    .then((cors) => t.deepEqual(cors, CORS))
})

test('Should reject if configuration.read() throws an error', (t) => {
  const read = t.context.getTestSubject({
    '../configuration.js': configurationMock((cwd) => Promise.reject(new Error('test')))
  })

  t.throws(read(CWD), 'test')
})
