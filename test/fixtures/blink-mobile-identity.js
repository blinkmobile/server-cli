/* @flow */
'use strict'

const BlinkMobileIdentity = require('@blinkmobile/bm-identity')

class BlinkMobileIdentityMock extends BlinkMobileIdentity {
  constructor () {
    super('')
  }

  assumeAWSRole () /* : Promise<Object> */ {
    return Promise.resolve({
      accessKeyId: 'access key id',
      secretAccessKey: 'secret access key',
      sessionToken: 'session token'
    })
  }

  getAccessToken () {
    return Promise.resolve('access token')
  }

  getServiceSettings (
    additionalParameters /* : Object */
  ) /* : Promise<Object> */ {
    return Promise.resolve({
      bucket: 's3 bucket',
      serviceOrigin: 'http service origin'
    })
  }
}

module.exports = BlinkMobileIdentityMock
