'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')

const TEST_SUBJECT = '../../lib/cors/display.js'

const CWD = 'current working directory'
const CORS = {
  'origins': [
    'http://test'
  ],
  headers: [
    'Accept',
    'Content-Type'
  ]
}

test.beforeEach((t) => {
  t.context.getTestSubject = (overrides) => {
    overrides = overrides || {}
    return proxyquire(TEST_SUBJECT, Object.assign({
      './read.js': () => Promise.resolve(CORS),

      './validate.js': () => Promise.resolve(CORS)
    }, overrides))
  }

  t.context.logger = {
    log: () => {}
  }
})

test('Should call read() with correct input', (t) => {
  t.plan(1)
  const display = t.context.getTestSubject({
    './read.js': (cwd) => {
      t.is(cwd, CWD)
      return Promise.resolve(CORS)
    }
  })

  return display(t.context.logger, CWD)
})

test('Should call validate() with correct input', (t) => {
  const display = t.context.getTestSubject({
    './validate.js': (cors) => {
      t.deepEqual(cors, CORS)
      return Promise.resolve(cors)
    }
  })

  return display(t.context.logger, CWD)
})

test('Should not log the cors and reject if no routes are found', (t) => {
  t.plan(1)
  const display = t.context.getTestSubject({
    './validate.js': () => Promise.reject()
  })

  return display({log: () => t.fail('Should not log if there are no routes')}, CWD)
    .catch(() => t.pass())
})

test('Should log the cors', (t) => {
  t.plan(1)
  const display = t.context.getTestSubject()

  return display({log: () => t.pass()}, CWD)
})
