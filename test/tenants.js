// @flow
'use strict'

const test = require('ava')

const values = require('../lib/values')
const {
  getTenantOrigin,
  getTenantRegion,
  getTenantBucket
} = require('../lib/tenants')

test.beforeEach(t => {
  t.context.logger = {
    log: () => {}
  }
})

test('Should get correct origin for ONEBLINK tenant', t => {
  const tenant = 'oneblink'
  const origin = getTenantOrigin(tenant)
  t.is(origin, values.TENANTS.ONEBLINK.origin)
})

test('Should get correct origin for CIVICPLUS tenant', t => {
  const tenant = 'civicplus'
  const origin = getTenantOrigin(tenant)
  t.is(origin, values.TENANTS.CIVICPLUS.origin)
})

test('Should get correct origin for NO tenant', t => {
  const tenant = null
  const origin = getTenantOrigin(tenant)
  t.is(origin, values.TENANTS.ONEBLINK.origin)
})

test('Should get correct region for ONEBLINK tenant', t => {
  const tenant = 'oneblink'
  const region = getTenantRegion(tenant)
  t.is(region, values.TENANTS.ONEBLINK.region)
})

test('Should get correct region for CIVICPLUS tenant', t => {
  const tenant = 'civicplus'
  const region = getTenantRegion(tenant)
  t.is(region, values.TENANTS.CIVICPLUS.region)
})

test('Should get correct region for NO tenant', t => {
  const tenant = null
  const region = getTenantRegion(tenant)
  t.is(region, values.TENANTS.ONEBLINK.region)
})

test('Should get correct bucket for ONEBLINK tenant', t => {
  const tenant = 'oneblink'
  const bucket = getTenantBucket(tenant)
  t.is(bucket, values.TENANTS.ONEBLINK.bucket)
})

test('Should get correct bucket for CIVICPLUS tenant', t => {
  const tenant = 'civicplus'
  const bucket = getTenantBucket(tenant)
  t.is(bucket, values.TENANTS.CIVICPLUS.bucket)
})

test('Should get correct bucket for NO tenant', t => {
  const tenant = null
  const bucket = getTenantBucket(tenant)
  t.is(bucket, values.TENANTS.ONEBLINK.bucket)
})
