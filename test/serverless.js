/* @flow */
'use strict'

const path = require('path')

const test = require('ava')
const BlinkMobileIdentity = require('@blinkmobile/bm-identity')
const pify = require('pify')
const temp = require('temp').track()

const readYamlFile = require('../lib/utils/yaml.js').readYamlFile
const serverless = require('../commands/serverless.js')
const createCliFlags = require('./fixtures/create-cli-flags.js')

const mkdir = pify(temp.mkdir)
const CONFIGURATION_DIR = path.join(__dirname, '../examples/configuration')
const DIRECTORY_DIR = path.join(__dirname, '../examples/directory')

test('should produce the expected serverless.yml for configuration example project', (t) => {
  return mkdir('serverless-test')
    .then((tempDir) => {
      return serverless([], createCliFlags({
        cwd: CONFIGURATION_DIR,
        deploymentBucket: 'deployment-bucket',
        env: 'prod',
        executionRole: 'execution-role',
        out: tempDir,
        vpcSecurityGroups: '123, 456',
        vpcSubnets: 'abc, def'
      }), console, {
        cwd: CONFIGURATION_DIR,
        blinkMobileIdentity: new BlinkMobileIdentity()
      })
        .then(() => {
          return Promise.all([
            readYamlFile(path.join(tempDir, 'serverless.yml')),
            readYamlFile(path.join(__dirname, './fixtures/serverless/examples/configuration.yml'))
          ])
        })
        .then((results) => t.deepEqual(results[0], results[1]))
    })
})

test('should produce the expected serverless.yml for directory example project', (t) => {
  return mkdir('serverless-test')
    .then((tempDir) => {
      return serverless([], createCliFlags({
        cwd: DIRECTORY_DIR,
        env: 'test',
        out: tempDir
      }), console, {
        cwd: DIRECTORY_DIR,
        blinkMobileIdentity: new BlinkMobileIdentity()
      })
        .then(() => {
          return Promise.all([
            readYamlFile(path.join(tempDir, 'serverless.yml')),
            readYamlFile(path.join(__dirname, './fixtures/serverless/examples/directory.yml'))
          ])
        })
        .then((results) => t.deepEqual(results[0], results[1]))
    })
})

test('should reject if --out flag is falsey', (t) => {
  t.throws(serverless([], createCliFlags(), console, {
    cwd: CONFIGURATION_DIR,
    blinkMobileIdentity: new BlinkMobileIdentity()
  }), '"--out" is mandatory')
})
