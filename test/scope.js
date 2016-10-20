'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')

const TEST_SUBJECT = '../lib/scope.js'
const CWD = 'current working directory'
const SERVER = {
  project: 'name of project',
  region: 'name of region'
}
const CFG = {
  server: SERVER
}

test.beforeEach((t) => {
  t.context.getTestSubject = (overrides) => {
    overrides = overrides || {}
    return proxyquire(TEST_SUBJECT, Object.assign({
      './utils/project-meta': {
        read: () => Promise.resolve(CFG),
        write: () => Promise.resolve()
      }
    }, overrides))
  }

  t.context.logger = {
    log: () => {}
  }
})

test('read() should call projectMeta.read() with correct input', (t) => {
  t.plan(1)
  const scope = t.context.getTestSubject({
    './utils/project-meta': {
      read: (cwd) => {
        t.is(cwd, CWD)
        return Promise.resolve(CFG)
      }
    }
  })

  return scope.read(CWD)
})

test('read() should handle an unitinitalised config file', (t) => {
  t.plan(1)
  const scope = t.context.getTestSubject({
    './utils/project-meta': {
      read: (cwd) => Promise.resolve({
        'test': 123
      })
    }
  })
  return scope.read()
    .then((cfg) => t.deepEqual(cfg, {}))
})

test('read() should return the currently set scope', (t) => {
  const scope = t.context.getTestSubject()

  return scope.read(CWD)
    .then((server) => t.deepEqual(server, SERVER))
})

test('read() should reject if projectMeta.read() throws an error', (t) => {
  t.plan(2)
  const scope = t.context.getTestSubject({
    './utils/project-meta': {
      read: (cwd) => {
        t.pass()
        return Promise.reject()
      }
    }
  })

  return scope.read(CWD)
    .catch(() => t.pass())
})

test('display() should call projectMeta.read() with correct input', (t) => {
  t.plan(1)
  const scope = t.context.getTestSubject({
    './utils/project-meta': {
      read: (cwd) => {
        t.is(cwd, CWD)
        return Promise.resolve(CFG)
      }
    }
  })

  return scope.display(t.context.logger, CWD)
})

test('display() should reject with nice error message if projectMeta.read() throws an error', (t) => {
  t.plan(1)
  const scope = t.context.getTestSubject({
    './utils/project-meta': {
      read: (cwd) => Promise.reject('test error message')
    }
  })

  t.throws(scope.display(t.context.logger, CWD), 'Scope has not been set yet, see --help for information on how to set scope.')
})

test('display() should log the currently set scope', (t) => {
  t.plan(1)
  const scope = t.context.getTestSubject()

  return scope.display({ log: () => t.pass() }, CWD)
})

test('write() should reject if project is not set on the meta object', (t) => {
  const scope = t.context.getTestSubject()

  t.throws(scope.write(CWD, null), 'meta.project was not defined.')
})

test('write() should merge new scope with the current config', (t) => {
  t.plan(2)
  const originalConfig = {
    bmp: {
      scope: 'blah'
    },
    server: {
      project: 'old',
      extra: 'existing'
    }
  }
  const newConfig = {
    project: 'new project',
    region: 'new region'
  }
  const scope = t.context.getTestSubject({
    './utils/project-meta': {
      write: (cwd, updater) => {
        t.is(cwd, CWD)
        return Promise.resolve(updater(originalConfig))
      }
    }
  })

  return scope.write(CWD, newConfig)
    .then((server) => t.deepEqual(server, {
      project: 'new project',
      region: 'new region',
      extra: 'existing'
    }))
})