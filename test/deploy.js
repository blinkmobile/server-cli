'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const logSymbols = require('log-symbols')

const TEST_SUBJECT = '../lib/deploy.js'

test.beforeEach((t) => {
  t.context.getTestSubject = (overrides) => {
    overrides = overrides || {}
    return proxyquire(TEST_SUBJECT, Object.assign({
      'inquirer': {
        prompt: (questions) => Promise.resolve({
          confirmation: true
        })
      },
      './utils/log-updates.js': (message) => (beforeStop) => beforeStop(() => {})
    }, overrides))
  }
})

test('confirm() should not prompt or log if force is true', (t) => {
  const deploy = t.context.getTestSubject({
    'inquirer': {
      prompt: (questions) => t.fail('Should not call prompt')
    }
  })
  return deploy.confirm({log: () => t.fail('Should not log')}, true)
})

test('confirm() should prompt and log if force is false', (t) => {
  t.plan(2)
  const deploy = t.context.getTestSubject({
    'inquirer': {
      prompt: (questions) => {
        t.pass()
        return Promise.resolve({
          confirmation: true
        })
      }
    }
  })
  return deploy.confirm({log: () => t.pass()}, false)
})

test('authenticate() should call blinkMobileIdentity functions and stop updates', (t) => {
  t.plan(6)
  const deploy = t.context.getTestSubject({
    './utils/log-updates.js': (message) => {
      // Check for correct message
      t.is(message(), 'Authenticating...')
      return (beforeStop) => {
        // Ensure stop function is called
        t.pass()
        beforeStop((symbol, str) => {
          // Ensure before stop is called with correct arguments
          t.is(symbol, logSymbols.success)
          t.is(str, 'Authenticated!')
        })
      }
    }
  })
  return deploy.authenticate({
    // Ensure blinkMobileIdentity functions are called
    assumeAWSRole: () => {
      t.pass()
      return Promise.resolve()
    },
    getServiceSettings: () => {
      t.pass()
      return Promise.resolve()
    }
  })
})

test('authenticate() should call log correct updates if blinkMobileIdentity functions throw errors', (t) => {
  t.plan(4)
  const deploy = t.context.getTestSubject({
    './utils/log-updates.js': (message) => {
      return (beforeStop) => {
        // Ensure stop function is called
        t.pass()
        beforeStop((symbol, str) => {
          // Ensure before stop is called with correct arguments
          t.is(symbol, logSymbols.error)
          t.is(str, 'Authenticating...')
        })
      }
    }
  })
  return deploy.authenticate({
    assumeAWSRole: () => Promise.reject(new Error('test error')),
    getServiceSettings: () => Promise.resolve()
  })
    .catch((err) => t.is(err.message, 'test error'))
})
