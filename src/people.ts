import type { Creditsafe, CreditsafeOptions, CreditsafeError } from './'

export interface PeopleAddress {
  type?: string;
  simpleValue: string;
  street: string;
  houseNumber?: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
  telephone?: string;
  directMarketingOptOut?: boolean;
  directMarketingOptIn?: boolean;
}

export interface PeopleMessage {
  type: string;
  code: string;
  text: string;
}

export interface Director {
  peopleId: string;
  country: string;
  firstName: string;
  lastName: string;
  title?: string;
  dateOfLatestChange?: string;
  company?: {
    companyName: string;
    safeNumber: string;
    type: string;
    charterNumber: string;
    dbt: number;
    rating: number;
    limit: number;
    derogatoryCount: number;
    derogatoryAmount: number;
  };
  address?: {
    simpleValue: string;
    street: string;
    city: string;
    postCode: string;
    province: string;
  };
  source: string;
  taxCode: string;
}

export interface DirectorList {
  correlationId: string;
  page: bigint;
  pageSize: bigint;
  totalSize: bigint;
  directors: Director[];
  messages: PeopleMessage[];
}

export interface DirectorReport {
  directorId: string;
  directorSummary: any;
  directorDetails: any;
  otherAddresses: any;
  directorships: any;
}

export class PeopleApi {
  client: Creditsafe;

  constructor(client: Creditsafe, _options?: CreditsafeOptions) {
    this.client = client
  }

  /*
   * Function to take a series of searchable fields, most of which are optional,
   * as input, and pass them to Creditsafe, and have them return a *paged* list
   * of people (Directors) that fit the search criteria - as closely as possible,
   * in descending order of accuracy of match. This means, the first page is
   * likely the "best page", but there's nothing that says you can't get every
   * one.
   */
  async search(search: {
    countries: string[],
    page?: number,
    pageSize?: number,
    peopleId?: string,
    firstName?: string,
    lastName?: string,
    localDirectorNumber?: string,
    dateOfBirth?: string,
    callRef?: string,
  }): Promise<{
    success: boolean,
    data?: DirectorList,
    error?: CreditsafeError
  }> {
    const resp = await this.client.fire(
      'GET',
      'people',
      { ...search, countries: search.countries.join(',').toUpperCase() }
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
    return { success: (resp && !resp.payload?.error), data: resp.payload }
  }

  /*
   * Function to take a Creditsafe people Id, and some options, and get the
   * director report, in JSON format, for that person from Creditsafe. This
   * has a very detailed and complex structure, but it's also a wealth of
   * information about the person.
   */
  async directorReport(peopleId: string, options?: {
    language?: string,
    callRef?: string,
  }): Promise<{
    success: boolean,
    data?: {
      correlationId: string,
      report: DirectorReport,
      companyId: string,
      dateOfOrder: string,
      language: string,
      userId: string,
    },
    error?: CreditsafeError
  }> {
    const resp = await this.client.fire(
      'GET',
      `people/${peopleId}`,
      options
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
    return { success: (resp && !resp.payload?.error), data: resp.payload }
  }

  /*
   * Function to take an array of 2-character ISO country codes, and return a
   * set of search criteria that can be used to search for the People in
   * those countries.
   */
  async searchCriteria(countries: string[]): Promise<{
    success: boolean,
    data?: {
      correlationId: string,
      countries: string[],
      languages: string[],
      criteriaSets: any[]
    },
    error?: CreditsafeError
  }> {
    const resp = await this.client.fire(
      'GET',
      'people/searchcriteria',
      { countries: countries.join(',').toUpperCase() }
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
    return { success: (resp && !resp.payload?.error), data: resp.payload }
  }
}
