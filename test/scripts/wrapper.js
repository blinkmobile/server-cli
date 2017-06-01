'use strict'

const path = require('path')

const test = require('ava')
const proxyquire = require('proxyquire')

const TEST_SUBJECT = '../../scripts/wrapper.js'
const CONFIG_PATH = path.join(__dirname, '..', '..', 'scripts', 'bm-server.json')

const CORS = {
  origins: [
    'valid'
  ],
  headers: [
    'Accept',
    'Authorization',
    'Content-Type',
    'If-None-Match',
    'X-Amz-Date',
    'X-Amz-Security-Token',
    'X-Api-Key'
  ],
  exposedHeaders: [
    'Server-Authorization',
    'WWW-Authenticate'
  ],
  credentials: true,
  maxAge: 86400
}

const EVENT = {
  httpMethod: 'GET',
  pathParameters: null,
  path: 'this is the path',
  queryStringParameters: null,
  body: '{"test": 123}',
  headers: {
    Host: 'this is the host'
  }
}

test.beforeEach((t) => {
  t.context.getTestSubject = (overrides) => {
    overrides = overrides || {}
    return proxyquire(TEST_SUBJECT, overrides || {})
  }
})

test('normaliseLambdaRequest()', (t) => {
  const lib = t.context.getTestSubject()
  const request = lib.normaliseLambdaRequest(EVENT)

  t.deepEqual(request, {
    body: {'test': 123},
    headers: {
      host: 'this is the host'
    },
    method: 'get',
    route: 'this is the path',
    url: {
      host: 'this is the host',
      hostname: 'this is the host',
      params: {},
      pathname: 'this is the path',
      protocol: 'http:',
      query: {}
    }
  })
})

test('handler() should return correct response', (t) => {
  t.plan(2)
  const lib = t.context.getTestSubject()
  const event = Object.assign({}, EVENT, {path: '/response'})

  return lib.handler(event, null, (err, result) => {
    t.falsy(err)
    t.deepEqual(result, {
      body: JSON.stringify({ handler: 123 }, null, 2),
      headers: {
        'content-type': 'application/json',
        'custom': '123'
      },
      statusCode: 202
    })
  })
})

test('handler() should return correct boom response', (t) => {
  t.plan(2)
  const lib = t.context.getTestSubject()
  const event = Object.assign({}, EVENT, {path: '/boom'})

  return lib.handler(event, null, (err, result) => {
    t.falsy(err)
    t.deepEqual(result, {
      body: JSON.stringify({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Testing boom errors'
      }, null, 2),
      headers: {
        'content-type': 'application/json'
      },
      statusCode: 400
    })
  })
})

test('handler() should return 404 status code if route is not found', (t) => {
  t.plan(2)
  const route = '/missing'
  const lib = t.context.getTestSubject()
  const event = Object.assign({}, EVENT, {path: route})

  return lib.handler(event, null, (err, result) => {
    t.falsy(err)
    t.deepEqual(result, {
      body: JSON.stringify({
        error: 'Not Found',
        message: `Route has not been implemented: ${route}`,
        statusCode: 404
      }, null, 2),
      headers: {
        'content-type': 'application/json'
      },
      statusCode: 404
    })
  })
})

// Must run with 'serial' as it changes process.chdir()
test.serial('handler() should return 500 status code if current working directory cannot be changed', (t) => {
  t.plan(2)
  const chdir = process.chdir
  process.chdir = () => {
    throw new Error('test chdir error')
  }
  const lib = t.context.getTestSubject()
  const event = Object.assign({}, EVENT, {path: '/response'})

  return lib.handler(event, null, (err, result) => {
    t.falsy(err)
    t.deepEqual(result, {
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'An internal server error occurred',
        statusCode: 500
      }, null, 2),
      headers: {
        'content-type': 'application/json'
      },
      statusCode: 500
    })
    process.chdir = chdir
  })
})

test('handler() should return 405 status code if method is not found', (t) => {
  t.plan(2)
  const lib = t.context.getTestSubject()
  const event = Object.assign({}, EVENT, {
    httpMethod: 'POST',
    path: '/response'
  })

  return lib.handler(event, null, (err, result) => {
    t.falsy(err)
    t.deepEqual(result, {
      body: JSON.stringify({
        error: 'Method Not Allowed',
        message: 'POST method has not been implemented',
        statusCode: 405
      }, null, 2),
      headers: {
        'content-type': 'application/json'
      },
      statusCode: 405
    })
  })
})

test('handler() should return 405 for options requests with no CORS', (t) => {
  t.plan(2)
  const lib = t.context.getTestSubject()
  const event = Object.assign({}, EVENT, {
    httpMethod: 'OPTIONS',
    path: '/response',
    headers: {
      host: 'host',
      origin: 'valid'
    }
  })

  return lib.handler(event, null, (err, result) => {
    t.falsy(err)
    t.deepEqual(result, {
      body: JSON.stringify({
        error: 'Method Not Allowed',
        message: 'OPTIONS method has not been implemented',
        statusCode: 405
      }, null, 2),
      headers: {
        'content-type': 'application/json'
      },
      statusCode: 405
    })
  })
})

test('handler() should return 200 for options requests with CORS and valid origin', (t) => {
  t.plan(2)
  const lib = t.context.getTestSubject({
    [CONFIG_PATH]: {
      cors: CORS,
      routes: [{
        module: './project/test-response.js',
        route: '/response'
      }]
    }
  })
  const event = Object.assign({}, EVENT, {
    headers: {
      host: 'host',
      origin: 'valid',
      'Access-Control-Request-Method': 'GET'
    },
    httpMethod: 'OPTIONS',
    path: '/response'
  })

  return lib.handler(event, null, (err, result) => {
    t.falsy(err)
    t.deepEqual(result, {
      body: undefined,
      headers: {
        'access-control-allow-credentials': true,
        'access-control-allow-headers': CORS.headers.join(','),
        'access-control-allow-methods': 'GET',
        'access-control-allow-origin': 'valid',
        'access-control-expose-headers': 'Server-Authorization,WWW-Authenticate',
        'access-control-max-age': CORS.maxAge,
        'content-type': 'application/json'
      },
      statusCode: 200
    })
  })
})

test('handler() should return 200 for requests with CORS and invalid origin', (t) => {
  t.plan(2)
  const lib = t.context.getTestSubject({
    [CONFIG_PATH]: {
      cors: Object.assign({}, CORS, {origins: ['invalid']})
    }
  })
  const event = Object.assign({}, EVENT, {
    headers: {
      host: 'host',
      origin: 'valid'
    },
    httpMethod: 'OPTIONS',
    path: '/response'
  })

  return lib.handler(event, null, (err, result) => {
    t.falsy(err)
    t.deepEqual(result, {
      body: undefined,
      headers: {
        'content-type': 'application/json'
      },
      statusCode: 200
    })
  })
})
