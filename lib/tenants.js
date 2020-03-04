'use strict'
// @flow

const values = require('./values')

const getTenantData = (
  tenant /* : ?string  */
) /* : { origin: string, bucket: string, region: string } */ => {
  if (!tenant) tenant = 'ONEBLINK'
  return values.TENANTS[tenant.toUpperCase()] || values.TENANTS.ONEBLINK
}

module.exports = {
  getTenantOrigin: (tenant /* : ?string */) /* : string */ =>
    getTenantData(tenant).origin,
  getTenantBucket: (tenant /* : ?string */) /* : string */ =>
    getTenantData(tenant).bucket,
  getTenantRegion: (tenant /* : ?string */) /* : string */ =>
    getTenantData(tenant).region
}
