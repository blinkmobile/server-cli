/* @flow */
'use strict'

/* ::
import type {
  CLIFlags,
  CLIOptions
} from '../types.js'
*/

const path = require('path')

const test /* : Function */ = require('ava')
const proxyquire /* : (string, { [id:string]: any }) => (Array<string>, CLIFlags, typeof console, CLIOptions) => Promise<void> */ = require('proxyquire')

const BlinkMobileIdentityMock = require('./fixtures/blink-mobile-identity.js')
const createCliFlags = require('./fixtures/create-cli-flags.js')

const DIRECTORY_DIR = path.join(__dirname, '../examples/directory')
const CLI_OPTIONS = {
  blinkMobileIdentity: new BlinkMobileIdentityMock()
}

test('should call "serverless logs" with correct arguments and options', (t) => {
  t.plan(5)
  const logs = proxyquire('../commands/logs.js', {
    '../lib/logs.js': {
      authenticate: () => CLI_OPTIONS.blinkMobileIdentity.assumeAWSRole()
    },
    '../lib/serverless.js': {
      executeSLSCommand: (args, options) => {
        t.deepEqual(args, [
          'logs',
          '--function',
          'bm-example-api-blinkm-io-prod',
          '--region',
          'ap-southeast-2',
          '--stage',
          'prod',
          '--tail',
          '--filter',
          'my custom filter',
          '--startTime',
          '2016'
        ])
        t.is(options.stdio, 'inherit')
        t.is(options.env.AWS_ACCESS_KEY_ID, 'access key id')
        t.is(options.env.AWS_SECRET_ACCESS_KEY, 'secret access key')
        t.is(options.env.AWS_SESSION_TOKEN, 'session token')
        return Promise.resolve()
      }
    }
  })
  // $FlowFixMe
  return logs([], createCliFlags({
    cwd: DIRECTORY_DIR,
    env: 'prod',
    tail: true,
    filter: 'my custom filter',
    startTime: '2016'
  }), console, CLI_OPTIONS)
})

test('should reject if "serverless logs" fails', (t) => {
  const logs = proxyquire('../commands/logs.js', {
    '../lib/logs.js': {
      authenticate: () => CLI_OPTIONS.blinkMobileIdentity.assumeAWSRole()
    },
    '../lib/serverless.js': {
      executeSLSCommand: (args, options) => Promise.reject(new Error('error message'))
    }
  })
  // $FlowFixMe
  return t.throwsAsync(() =>
    logs([], createCliFlags({
      cwd: DIRECTORY_DIR,
      env: 'prod'
    }), console, CLI_OPTIONS),
  'See Serverless Error above for more details.'
  )
})
