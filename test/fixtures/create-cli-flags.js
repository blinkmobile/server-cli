/* @flow */
'use strict'

/* ::
import type {CLIFlags} from '../../types.js'
*/

function createCLIFlags (
  overrides /* : { [id:string]: string | boolean } | void */
) /* : CLIFlags */ {
  return Object.assign({
    bmServerVersion: '1.0.0',
    cwd: '.',
    force: false,
    env: 'dev',
    region: 'ap-southeast-2',
    tail: false
  }, overrides || {})
}

module.exports = createCLIFlags
