const values = require('./values')

module.exports = tenant => {
  return Object.keys(values.TENANT_ORIGINS).includes(tenant.toUpperCase())
    ? values.TENANT_ORIGINS[tenant].origin
    : null
}
