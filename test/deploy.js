'use strict'

const fs = require('fs')
const path = require('path')

const test = require('ava')
const proxyquire = require('proxyquire')
const logSymbols = require('log-symbols')
const yauzl = require('yauzl')

const TEST_SUBJECT = '../lib/deploy.js'

const UPLOAD_PATH = path.join(__dirname, 'fixtures', 'upload', 'project.zip')
const ZIP_PATH = path.join(__dirname, 'fixtures', 'zip')
const LOCATION = 'this is a location'
const SERVICE_SETTINGS = {
  region: 'this is a region',
  bucket: 'this is a bucket'
}

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

test('zip() should log correct updates and return an absolute path to a zip file', (t) => {
  t.plan(8)
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
  return deploy.zip(ZIP_PATH)
    .then(zipFilePath => {
      t.truthy(path.isAbsolute(zipFilePath))
      t.is(path.extname(zipFilePath), '.zip')
      t.truthy(fs.statSync(zipFilePath).isFile())
      return new Promise((resolve, reject) => {
        yauzl.open(zipFilePath, { lazyEntries: true }, (err, zip) => {
          if (err) {
            reject(err)
            return
          }
          const entries = []
          zip.on('entry', (entry) => {
            entries.push(entry.fileName)
            zip.readEntry()
          })
          zip.on('end', () => {
            t.deepEqual(entries, [
              'bm-server.json',
              'helloworld/index.js'
            ])
            resolve(entries)
          })
          zip.on('error', (err) => reject(err))
          zip.readEntry()
        })
      })
    })
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
          t.is(str, 'Compressing project...')
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
  return deploy.zip(ZIP_PATH)
    .catch((err) => t.is(err.message, 'test temp error'))
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
          t.is(str, 'Compressing project...')
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
  return deploy.zip(ZIP_PATH)
    .catch((err) => t.is(err.message, 'test archiver error'))
})

test('upload() should log correct updates and return location after upload', (t) => {
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
          t.is(params.Bucket, SERVICE_SETTINGS.bucket)
          t.is(params.Key, path.basename(UPLOAD_PATH))
          return {
            on: () => {},
            send: (fn) => fn(null, {Location: LOCATION})
          }
        }
      }
    }
  })
  return deploy.upload(UPLOAD_PATH, {}, SERVICE_SETTINGS)
    .then((location) => t.is(location, LOCATION))
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
          t.is(str, 'Transferring project: 0%')
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
  return deploy.upload(UPLOAD_PATH, {}, SERVICE_SETTINGS)
    .catch((err) => t.is(err.message, 'test upload error'))
})

