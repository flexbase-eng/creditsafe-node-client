import fetch from 'node-fetch'
import FormData = require('formdata')
import path from 'path'
import camelCaseKeys from 'camelcase-keys'

import { AuthenticationApi } from './authentication'
import { CompanyApi } from './company'
import { PeopleApi } from './people'

const ClientVersion = require('../package.json').version
const PROTOCOL = 'https'
const CREDITSAFE_HOST = 'connect.creditsafe.com/v1'

/*
 * These are the acceptable options to the creation of the Client:
 *
 *   {
 *     host: "connect.sandbox.creditsafe.com/v1",
 *     username: "me@myplace.com",
 *     password: "pickle",
 *   }
 *
 * and the construction of the Client will use these credentials for
 * the generation of the access token .
 */
export interface CreditsafeOptions {
  host?: string;
  username?: string;
  password?: string;
}

/*
 * These are the standard error objects from Creditsafe - and will be returned
 * from Creditsafe for any bad condition. We will allow these - as well as just
 * strings in the errors being returned from the calls.
 */
export interface CreditsafeError {
  type: string;
  message?: string;
  error?: string;
}

/*
 * This is the main constructor of the Creditsafe Client, and will be called
 * with something like:
 *
 *   import { Creditsafe } from "creditsafe-node-client"
 *   const client = new Creditsafe('me@myplace.com', 'pickle')
 */
export class Creditsafe {
  host: string
  username: string
  password: string
  authentication: AuthenticationApi
  company: CompanyApi
  people: PeopleApi

  constructor (username: string, password: string, options?: CreditsafeOptions) {
    this.host = options?.host || CREDITSAFE_HOST
    this.username = options?.username || username
    this.password = options?.password || password
    // now construct all the specific domain objects
    this.authentication = new AuthenticationApi(this, options)
    this.company = new CompanyApi(this, options)
    this.people = new PeopleApi(this, options)
  }

  /*
   * Function to fire off a GET, PUT, POST, (method) to the uri, preceeded
   * by the host, with the optional query params, and optional body, and
   * puts the 'apiKey' into the headers for the call, and fires off the call
   * to the PostGrid host and returns the response.
   */
  async fire(
    method: string,
    uri: string,
    query?: { [index:string] : number | string | boolean },
    body?: object | object[] | FormData,
  ): Promise<{ response: any, payload?: any }> {
    // build up the complete url from the provided 'uri' and the 'host'
    let url = new URL(PROTOCOL+'://'+path.join(this.host, uri))
    if (query) {
      Object.keys(query).forEach(k => {
        if (something(query[k])) {
          url.searchParams.append(k, query[k].toString())
        }
      })
    }
    const isForm = isFormData(body)
    // make the appropriate headers
    let headers = {
      Accept: 'application/json',
      'X-Creditsafe-Client-Ver': ClientVersion,
    } as any
    if (!isForm) {
      headers = { ...headers, 'Content-Type': 'application/json' }
    }
    // allow a few retries on the authentication token expiration
    let response
    for (let cnt = 0; cnt < 3; cnt++) {
      if (uri !== 'authenticate' || method !== 'POST') {
        const auth = await this.authentication.checkToken()
        if (!auth?.success) {
          return { response: { payload: auth } }
        }
        headers = { ...headers, 'Authorization': this.authentication.token }
      }
      // now we can make the call... see if it's a JSON body or a FormData one...
      try {
        response = await fetch(url, {
          method: method,
          body: isForm ? (body as any) : (body ? JSON.stringify(body) : undefined),
          headers,
        })
        const payload = camelCaseKeys((await response?.json()), { deep: true })
        // check for an invalid token from the service
        if (response.status == 401 && payload?.error === 'Invalid token.') {
          const auth = await this.authentication.resetToken()
          if (!auth?.success) {
            return { response: { ...response, payload: auth } }
          }
          // ...and try it all again... :)
          continue
        }
        return { response, payload }
      } catch (err) {
        return { response }
      }
    }
    // this will mean we retried, and still failed
    return { response }
  }
}

/*
 * Simple function used to weed out undefined and null query params before
 * trying to place them on the call.
 */
function something(arg: any) {
  return arg || arg === false || arg === 0 || arg === ''
}

/*
 * Simple predicate function to return 'true' if the argument is a FormData
 * object - as that is one of the possible values of the 'body' in the fire()
 * function. We have to handle that differently on the call than when it's
 * a more traditional JSON object body.
 */
function isFormData(arg: any): boolean {
  let ans = false
  if (arg && typeof arg === 'object') {
    ans = (typeof arg._boundary === 'string' &&
           arg._boundary.length > 20 &&
           Array.isArray(arg._streams))
  }
  return ans
}

/*
 * Convenience function to create a CreditsafeError based on a simple message
 * from the Client code. This is an easy way to make CreditsafeError instances
 * from the simple error messages we have in this code.
 */
export function mkError(message: string): CreditsafeError {
  return {
    type: 'client',
    message,
  }
}
