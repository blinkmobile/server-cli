'use strict'

const DEFAULT_HEADERS = [
  'Accept',
  'Authorization',
  'Content-Type',
  'If-None-Match',
  'X-Amz-Date',
  'X-Amz-Security-Token',
  'X-Api-Key'
]
const METHODS = [ 'DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT' ]

module.exports = {
  DEFAULT_HEADERS,
  METHODS
}
