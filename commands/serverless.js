'use strict'

/**
bm serve serverless --input . --output /tmp/foobar
*/

const lib = require('../lib/serverless')

module.exports = function (input, flags, logger, options) {
  const cwd = options.cwd
  const out = flags.out

  if (!out) {
    logger.error(new Error('"--out" is mandatory'))
    process.exit(1)
  }

  return lib.copyRecursive(cwd, out)
    .then(() => lib.applyTemplate(out))
}
