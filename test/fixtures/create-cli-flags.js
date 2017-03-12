/* @flow */
'use strict'

/* ::
import type {CLIFlags} from '../../types.js'
*/

function createCLIFlags (
  overrides /* : { [id:string]: string | boolean } | void */
) /* : CLIFlags */ {
  return Object.assign({
    cwd: '.',
    force: false,
    env: 'dev',
    region: 'ap-southeast-2'
  }, overrides || {})
}

module.exports = createCLIFlags
