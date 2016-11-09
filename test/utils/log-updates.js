'use strict'

const test = require('ava')

const logUpdates = require('../../lib/utils/log-updates.js')

test.cb('Should log the correct amount of times and run beforeStop()', (t) => {
  t.plan(3)
  const waitTime = 300
  // t.pass() Should run once for each 100 ms
  const stopUpdates = logUpdates(() => {
    t.pass()
    return 'Testing log updates'
  })

  setTimeout(() => {
    stopUpdates((logUpdater) => {
      t.pass()
    })
    t.end()
  }, waitTime)
})
