/* @flow */
'use strict'

/* ::
import type {Headers} from './wrapper.js'
*/

const privateVars = new WeakMap()

class BmResponse {
  constructor () {
    privateVars.set(this, {
      headers: {},
      payload: undefined,
      statusCode: 200
    })
  }

  get headers () /* : Headers */ {
    return Object.assign({}, privateVars.get(this).headers)
  }

  get payload () /* : any */ {
    return privateVars.get(this).payload
  }

  get statusCode () /* : number */ {
    return privateVars.get(this).statusCode
  }

  setHeader (
    key /* : string */,
    value /* : string */
  ) /* : BmResponse */ {
    key = key.toLowerCase()
    privateVars.get(this).headers[key] = value
    return this
  }

  setPayload (
    payload /* : any */
  ) /* : BmResponse */ {
    privateVars.get(this).payload = payload
    return this
  }

  setStatusCode (
    code /* : number */
  ) /* : BmResponse */ {
    privateVars.get(this).statusCode = code
    return this
  }
}

module.exports = BmResponse
