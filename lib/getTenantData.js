'use strict'
// @flow

const values = require('./values')

module.exports = {
  getOrigin: (tenant /* : ?string */) /* : string */ => {
    if (!tenant) tenant = 'ONEBLINK'
    return Object.keys(values.TENANTS).includes(tenant.toUpperCase())
      ? values.TENANTS[tenant.toUpperCase()].origin
      : values.TENANTS.ONEBLINK.region
  },
  getRegion: (tenant /* : ?string */) /* : string */ => {
    if (!tenant) tenant = 'ONEBLINK'
    return Object.keys(values.TENANTS).includes(tenant.toUpperCase())
      ? values.TENANTS[tenant.toUpperCase()].region
      : values.TENANTS.ONEBLINK.region
  }
}
