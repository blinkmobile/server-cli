'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')

const TEST_SUBJECT = '../../lib/routes/read.js'

const projectMetaMock = require('../helpers/project-meta.js')

const CWD = 'current working directory'
const CONFIGURATION_ROUTES = 'configuration routes'
const PROJECT_ROUTES = 'project routes'

test.beforeEach((t) => {
  t.context.getTestSubject = (overrides) => {
    overrides = overrides || {}
    return proxyquire(TEST_SUBJECT, Object.assign({
      '../utils/project-meta.js': projectMetaMock(() => Promise.resolve({
        server: {
          routes: CONFIGURATION_ROUTES
        }
      })),

      '../project.js': {
        listRoutes: () => Promise.resolve(PROJECT_ROUTES)
      }
    }, overrides))
  }
})

test('Should use configuration routes if available', (t) => {
  t.plan(2)
  const read = t.context.getTestSubject({
    '../utils/project-meta.js': projectMetaMock((cwd) => {
      t.is(cwd, CWD)
      return Promise.resolve({
        server: {
          routes: CONFIGURATION_ROUTES
        }
      })
    }),
    '../project.js': {
      listRoutes: (cwd) => {
        t.fail('Should not be looking in project for routes')
        return Promise.resolve()
      }
    }
  })

  return read(CWD)
    .then(routes => t.is(routes, CONFIGURATION_ROUTES))
})

test('Should use project routes if configuration routes are unavailable', (t) => {
  t.plan(2)
  const read = t.context.getTestSubject({
    '../utils/project-meta.js': projectMetaMock((cwd) => Promise.resolve({
      server: {
        routes: null
      }
    })),
    '../project.js': {
      listRoutes: (cwd) => {
        t.is(cwd, CWD)
        return Promise.resolve(PROJECT_ROUTES)
      }
    }
  })

  return read(CWD)
    .then(routes => t.is(routes, PROJECT_ROUTES))
})

test('Should not reject and should always return an array if no routes are found', (t) => {
  t.plan(1)
  const read = t.context.getTestSubject({
    '../utils/project-meta.js': projectMetaMock((cwd) => Promise.resolve({
      server: {
        routes: null
      }
    })),
    '../project.js': {
      listRoutes: (cwd) => Promise.resolve(null)
    }
  })

  return read(CWD)
    .then(routes => t.deepEqual(routes, []))
})
