'use strict'

const fs = require('fs')
const path = require('path')

const test = require('ava')
const proxyquire = require('proxyquire')
const logSymbols = require('log-symbols')
const yauzl = require('yauzl')

const values = require('../lib/values.js')
const pkg = require('../package.json')

const TEST_SUBJECT = '../lib/deploy.js'

const ACCESS_TOKEN = 'this is an access token'
const UPLOAD_PATH = path.join(__dirname, 'fixtures', 'upload', 'project.zip')
const ZIP_PATH = path.join(__dirname, 'fixtures', 'zip')
const BUNDLE_KEY = 'this is a file key'
const ENV = 'test'

test.beforeEach((t) => {
  t.context.getTestSubject = (overrides) => {
    overrides = overrides || {}
    return proxyquire(TEST_SUBJECT, Object.assign({}, overrides))
  }
})

test('confirm() should not prompt or log if force is true', (t) => {
  const deploy = t.context.getTestSubject({
    'inquirer': {
      prompt: (questions) => t.fail('Should not call prompt')
    }
  })
  return deploy.confirm({log: () => t.fail('Should not log')}, true)
    .then(() => t.pass())
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
    './assume-aws-roles.js': {
      assumeAWSRoleToDeploy: () => {
        t.pass()
        return Promise.resolve({})
      }
    },
    './utils/log-updates.js': (message) => {
      // Check for correct message
      t.is(message(), 'Authenticating...')
      return (beforeStop) => {
        // Ensure stop function is called
        t.pass()
        beforeStop((symbol, str) => {
          // Ensure before stop is called with correct arguments
          t.is(symbol, logSymbols.success)
          t.is(str, 'Authentication complete!')
        })
      }
    }
  })
  return deploy.authenticate({}, {
    getAccessToken: () => {
      t.pass()
      return Promise.resolve()
    }
  }, ENV)
})

test('authenticate() should call log correct updates if blinkMobileIdentity functions throw errors', (t) => {
  t.plan(4)
  const deploy = t.context.getTestSubject({
    './assume-aws-roles.js': {
      assumeAWSRoleToDeploy: () => Promise.reject(new Error('test error'))
    },
    './utils/log-updates.js': (message) => {
      return (beforeStop) => {
        // Ensure stop function is called
        t.pass()
        beforeStop((symbol, str) => {
          // Ensure before stop is called with correct arguments
          t.is(symbol, logSymbols.error)
          t.is(str, 'Authentication failed...')
        })
      }
    }
  })
  return deploy.authenticate({}, {
    getAccessToken: () => Promise.resolve()
  }, ENV)
    .catch((err) => t.is(err.message, 'test error'))
})

test.cb('zip() should log correct updates and return an absolute path to a zip file', (t) => {
  t.plan(10)
  const deploy = t.context.getTestSubject({
    './utils/log-updates.js': (message) => {
      // Check for correct message
      t.is(message(), 'Compressing project...')
      return (beforeStop) => {
        // Ensure stop function is called
        t.pass()
        beforeStop((symbol, str) => {
          // Ensure before stop is called with correct arguments
          t.is(symbol, logSymbols.success)
          t.is(str, 'Compression complete!')
        })
      }
    }
  })
  deploy.zip(ZIP_PATH)
    .then(zipFilePath => {
      t.truthy(path.isAbsolute(zipFilePath))
      t.is(path.extname(zipFilePath), '.zip')
      t.truthy(fs.statSync(zipFilePath).isFile())
      yauzl.open(zipFilePath, { lazyEntries: true }, (err, zip) => {
        if (err) {
          t.end()
          return
        }
        const entries = []
        zip.on('entry', (entry) => {
          entries.push(entry.fileName)
          zip.readEntry()
        })
        zip.on('end', () => {
          t.truthy(entries.some((entry) => entry === '.blinkmrc.json'))
          t.truthy(entries.some((entry) => entry === 'bm-server.json'))
          t.truthy(entries.some((entry) => entry === 'helloworld/index.js'))
          t.end()
        })
        zip.on('error', () => t.end())
        zip.readEntry()
      })
    })
    .catch(() => t.end())
})

test('zip() should log correct updates and reject if an temp emits an error', (t) => {
  t.plan(5)
  const deploy = t.context.getTestSubject({
    './utils/log-updates.js': (message) => {
      return (beforeStop) => {
        // Ensure stop function is called
        t.pass()
        beforeStop((symbol, str) => {
          // Ensure before stop is called with correct arguments
          t.is(symbol, logSymbols.error)
          t.is(str, 'Compression failed...')
        })
      }
    },
    'archiver': {
      create: () => ({
        on: () => {},
        pipe: () => {},
        glob: () => {},
        finalize: () => {}
      })
    },
    'temp': {
      track: () => ({
        createWriteStream: (options) => {
          t.deepEqual(options, {suffix: '.zip'})
          return {
            on: (str, fn) => {
              if (str === 'error') {
                fn(new Error('test temp error'))
              }
            }
          }
        }
      })
    }
  })
  return t.throws(deploy.zip(ZIP_PATH), 'test temp error')
})

test('zip() should log correct updates and reject if an archiver emits an error', (t) => {
  t.plan(4)
  const deploy = t.context.getTestSubject({
    './utils/log-updates.js': (message) => {
      return (beforeStop) => {
        // Ensure stop function is called
        t.pass()
        beforeStop((symbol, str) => {
          // Ensure before stop is called with correct arguments
          t.is(symbol, logSymbols.error)
          t.is(str, 'Compression failed...')
        })
      }
    },
    'archiver': {
      create: () => ({
        on: (str, fn) => {
          if (str === 'error') {
            fn(new Error('test archiver error'))
          }
        },
        pipe: () => {},
        glob: () => {},
        finalize: () => {}
      })
    },
    'temp': {
      track: () => ({
        createWriteStream: () => ({
          on: () => {}
        })
      })
    }
  })
  return t.throws(deploy.zip(ZIP_PATH), 'test archiver error')
})

test('upload() should log correct updates and return bundle key after upload', (t) => {
  t.plan(7)
  const deploy = t.context.getTestSubject({
    './utils/log-updates.js': (message) => {
      // Check for correct message
      t.is(message(), 'Transferring project: 0%')
      return (beforeStop) => {
        // Ensure stop function is called
        t.pass()
        beforeStop((symbol, str) => {
          // Ensure before stop is called with correct arguments
          t.is(symbol, logSymbols.success)
          t.is(str, 'Transfer complete!')
        })
      }
    },
    'aws-sdk': {
      config: {},
      S3: function () {
        this.upload = (params) => {
          t.is(params.Bucket, values.SERVER_CLI_SERVICE_S3_BUCKET)
          t.is(params.Key, `bundles/${path.basename(UPLOAD_PATH)}`)
          return {
            on: () => {},
            send: (fn) => fn(null, {Key: BUNDLE_KEY})
          }
        }
      }
    }
  })
  return deploy.upload(UPLOAD_PATH, {}, {})
    .then((bundleKey) => t.is(bundleKey, BUNDLE_KEY))
})

test('upload() should log correct updates and reject if upload returns an error', (t) => {
  t.plan(4)
  const deploy = t.context.getTestSubject({
    './utils/log-updates.js': (message) => {
      return (beforeStop) => {
        // Ensure stop function is called
        t.pass()
        beforeStop((symbol, str) => {
          // Ensure before stop is called with correct arguments
          t.is(symbol, logSymbols.error)
          t.is(str, 'Transfer failed: 0%')
        })
      }
    },
    'aws-sdk': {
      config: {},
      S3: function () {
        this.upload = (params) => ({
          on: () => {},
          send: (fn) => fn(new Error('test upload error'))
        })
      }
    }
  })
  return t.throws(deploy.upload(UPLOAD_PATH, {}, {}), 'test upload error')
})

test('deploy() should log correct updates', (t) => {
  t.plan(7)
  const deploy = t.context.getTestSubject({
    './utils/log-updates.js': (message) => {
      // Check for correct message
      t.is(message(), 'Deploying project - this may take several minutes...')
      return (beforeStop) => {
        // Ensure stop function is called
        t.pass()
        beforeStop((symbol, str) => {
          // Ensure before stop is called with correct arguments
          t.is(symbol, logSymbols.success)
          t.is(str, 'Deployment complete - Origin: https://example.com')
        })
      }
    },
    'request': {
      defaults: () => ({
        post: (url, params, cb) => {
          t.is(url, '/deployments')
          t.deepEqual(params, {
            json: {
              bmServerVersion: pkg.version,
              bundleBucket: values.SERVER_CLI_SERVICE_S3_BUCKET,
              bundleKey: BUNDLE_KEY,
              env: ENV
            }
          })
          cb(null, {statusCode: 202}, {id: '123'})
        },
        get: (url, cb) => {
          t.is(url, '/deployments/123')
          cb(null, {statusCode: 200}, { result: { baseUrl: 'https://example.com' } })
        }
      })
    }
  })
  return deploy.deploy(BUNDLE_KEY, ACCESS_TOKEN, ENV, {})
})

test('deploy() should log correct updates and reject if request() returns an error', (t) => {
  t.plan(4)
  const deploy = t.context.getTestSubject({
    './utils/log-updates.js': (message) => {
      return (beforeStop) => {
        // Ensure stop function is called
        t.pass()
        beforeStop((symbol, str) => {
          // Ensure before stop is called with correct arguments
          t.is(symbol, logSymbols.error)
          t.is(str, 'Deployment failed...')
        })
      }
    },
    'request': {
      defaults: () => ({
        post: (url, params, cb) => cb(new Error('test error'))
      })
    }
  })
  return t.throws(deploy.deploy(BUNDLE_KEY, ACCESS_TOKEN, ENV, {}), 'test error')
})

test('deploy() should log correct updates and reject if request() returns an non 200 status code', (t) => {
  t.plan(4)
  const deploy = t.context.getTestSubject({
    './utils/log-updates.js': (message) => {
      return (beforeStop) => {
        // Ensure stop function is called
        t.pass()
        beforeStop((symbol, str) => {
          // Ensure before stop is called with correct arguments
          t.is(symbol, logSymbols.error)
          t.is(str, 'Deployment failed - 500 ERROR')
        })
      }
    },
    'request': {
      defaults: () => ({
        post: (url, params, cb) => cb(null, {}, {
          message: 'error message',
          error: 'ERROR',
          statusCode: 500
        })
      })
    }
  })
  return t.throws(deploy.deploy(BUNDLE_KEY, ACCESS_TOKEN, ENV, {}), 'error message')
})
