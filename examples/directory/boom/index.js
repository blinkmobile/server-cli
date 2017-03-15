'use strict'

// https://www.npmjs.com/package/boom
const Boom = require('boom')

module.exports = function (request) {
  throw Boom.create(request.url.query.status || 500, request.url.query.message || null, request.url)
}
