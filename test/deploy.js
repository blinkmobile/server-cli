'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')

const TEST_SUBJECT = '../lib/deploy.js'

test.beforeEach((t) => {
  t.context.getTestSubject = (overrides) => {
    overrides = overrides || {}
    return proxyquire(TEST_SUBJECT, Object.assign({
      'inquirer': {
        prompt: (questions) => Promise.resolve({
          confirmation: true
        })
      }
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
