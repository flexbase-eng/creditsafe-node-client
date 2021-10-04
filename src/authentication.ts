import type { Creditsafe, CreditsafeOptions, CreditsafeError } from './'

export interface CreditsafeAuth {
  success: boolean,
  token?: string,
  error?: CreditsafeError
}

export class AuthenticationApi {
  client: Creditsafe;
  token?: string;

  constructor(client: Creditsafe, _options?: CreditsafeOptions) {
    this.client = client
    this.token = undefined
  }

  /*
   * Function to look and see if we already have a token for this instance,
   * and if so, then return it successfully, but if not, then let's fetch
   * one from the Creditsafe service for the provided credentials, and then
   * save it.
   */
  async checkToken(): Promise<CreditsafeAuth> {
    // if we already have a token, use it - we can't check it's expiration
    if (this.token) {
      return { success: true, token: this.token }
    }
    // ...at this point, we know there is no token, so get one
    const resp = await this.getToken()
    if (!resp?.success) {
      return { ...resp, success: false }
    }
    // save the token we just got, and return the response
    this.token = resp.token
    return resp
  }

  /*
   * Function to force a refetching of the access token. Maybe it's expired,
   * or the credentials have changed, but for whatever reason, we need to
   * force a token refresh, and this function does just that.
   */
  async resetToken(): Promise<CreditsafeAuth> {
    this.token = undefined
    return (await this.checkToken())
  }

  /*
   * Function to take a Contact id and return the Contact object in the
   * response. If the contact isn't in the system, then we will return
   * the appropriate error.
   */
  async getToken(): Promise<CreditsafeAuth> {
    const resp = await this.client.fire(
      'POST',
      'authenticate',
      undefined,
      {
        username: this.client.username,
        password: this.client.password,
      }
    )
    if (resp?.response?.status >= 400) {
      return {
        success: false,
        error: {
          type: 'creditsafe',
          error: resp?.payload?.error || resp?.payload?.message,
        },
      }
    }
    return { ...resp.payload, success: true }
  }
}
