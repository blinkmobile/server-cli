'use strict'

const test = require('ava')

const values = require('../lib/values')
const getTenantData = require('../lib/getTenantData')

test.beforeEach(t => {
  t.context.logger = {
    log: () => {}
  }
})

test('Should get correct origin for ONEBLINK tenant', t => {
  const tenant = 'oneblink'
  const origin = getTenantData.getOrigin(tenant)
  t.is(origin, values.TENANTS.ONEBLINK.origin)
})

test('Should get correct origin for CIVICPLUS tenant', t => {
  const tenant = 'civicplus'
  const origin = getTenantData.getOrigin(tenant)
  t.is(origin, values.TENANTS.CIVICPLUS.origin)
})

test('Should get correct origin for NO tenant', t => {
  const tenant = null
  const origin = getTenantData.getOrigin(tenant)
  t.is(origin, values.TENANTS.ONEBLINK.origin)
})

test('Should get correct region for ONEBLINK tenant', t => {
  const tenant = 'oneblink'
  const region = getTenantData.getRegion(tenant)
  t.is(region, values.TENANTS.ONEBLINK.region)
})

test('Should get correct region for CIVICPLUS tenant', t => {
  const tenant = 'civicplus'
  const region = getTenantData.getRegion(tenant)
  t.is(region, values.TENANTS.CIVICPLUS.region)
})

test('Should get correct region for NO tenant', t => {
  const tenant = null
  const region = getTenantData.getRegion(tenant)
  t.is(region, values.TENANTS.ONEBLINK.region)
})
