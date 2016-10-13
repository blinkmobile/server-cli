'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')

const TEST_SUBJECT = '../../lib/routes/validate.js'

const CWD = 'current working directory'
const PATH_RESOLVE = 'returned from path resolve'
const MODULE = 'module path'

test.beforeEach((t) => {
  t.context.getTestSubject = (overrides) => {
    overrides = overrides || {}
    return proxyquire(TEST_SUBJECT, Object.assign({
      'path': {
        resolve: () => PATH_RESOLVE
      },

      '@jokeyrhyme/pify-fs': {
        stat: (path) => Promise.resolve()
      }
    }, overrides))
  }
})

test('Should contain error if route does not start with "/"', (t) => {
  const validate = t.context.getTestSubject()

  return validate(CWD, {
    route: 'test',
    module: 'test'
  })
    .then(errors => t.deepEqual(errors, [
      'Route must start with a "/"'
    ]))
})

test('Should contain error message if module can not be found', (t) => {
  const errorMessage = 'This is an error'
  const validate = t.context.getTestSubject({
    '@jokeyrhyme/pify-fs': {
      stat: (path) => Promise.reject(new Error(errorMessage))
    }
  })
  return validate(CWD, {
    route: '/test',
    module: 'test'
  })
    .then(errors => t.deepEqual(errors, [
      errorMessage
    ]))
})

test('Should contain different error message if module can not be found with ENOENT code', (t) => {
  const validate = t.context.getTestSubject({
    '@jokeyrhyme/pify-fs': {
      stat: (path) => Promise.reject({code: 'ENOENT'})
    }
  })
  return validate(CWD, {
    route: '/test',
    module: MODULE
  })
    .then(errors => t.deepEqual(errors, [
      `Could not find module: ${MODULE}`
    ]))
})

test('Input for for fs.stat() should be the result of path.resolve()', (t) => {
  t.plan(3)
  const validate = t.context.getTestSubject({
    'path': {
      resolve: (cwd, moduleString) => {
        t.is(cwd, CWD)
        t.is(moduleString, MODULE)
        return PATH_RESOLVE
      }
    },
    '@jokeyrhyme/pify-fs': {
      stat: (path) => {
        t.is(path, PATH_RESOLVE)
        return Promise.resolve()
      }
    }
  })
  return validate(CWD, {
    route: '/test',
    module: MODULE
  })
})
