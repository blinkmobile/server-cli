/* @flow */
'use strict'

const CREDENTIALS /* : boolean */ = false
const HEADERS /* : Array<string> */ = [
  'Accept',
  'Authorization',
  'Content-Type',
  'If-None-Match',
  'X-Amz-Date',
  'X-Amz-Security-Token',
  'X-Api-Key'
]
const EXPOSED_HEADERS /* : Array<string> */ = [
  'Server-Authorization',
  'WWW-Authenticate'
]
const MAX_AGE /* : number */ = 86400 // 1 Day
const ORIGINS /* : Array<string> */ = ['*']

const METHODS /* : Array<string> */ = [
  'DELETE',
  'GET',
  'OPTIONS',
  'PATCH',
  'POST',
  'PUT'
]

const DEFAULT_TIMEOUT_SECONDS /* : number */ = 15
const SERVER_CLI_SERVICE_DOMAIN = 'auth-api.blinkm.io'

const ANALYTICS_ORIGIN =
  process.env.ANALYTICS_ORIGIN || 'https://analytics.blinkm.io'
const SERVER_CLI_SERVICE_ORIGIN =
  process.env.SERVER_CLI_SERVICE_ORIGIN ||
  `https://${SERVER_CLI_SERVICE_DOMAIN}`
const SERVER_CLI_SERVICE_S3_BUCKET =
  process.env.SERVER_CLI_SERVICE_S3_BUCKET ||
  'server-cli-service-bundles-multitenant'

const TENANTS = {
  ONEBLINK: {
    origin: 'https://auth-api.blinkm.io',
    region: 'ap-southeast-2'
  },
  CIVICPLUS: {
    origin: 'https://auth-api.transform.civicplus.com',
    region: 'us-east-2'
  }
}

module.exports = {
  DEFAULT_CORS: {
    CREDENTIALS,
    EXPOSED_HEADERS,
    HEADERS,
    MAX_AGE,
    ORIGINS
  },
  DEFAULT_TIMEOUT_SECONDS,
  METHODS,
  ANALYTICS_ORIGIN,
  SERVER_CLI_SERVICE_DOMAIN,
  SERVER_CLI_SERVICE_ORIGIN,
  SERVER_CLI_SERVICE_S3_BUCKET,
  TENANTS
}
