import type { Creditsafe, CreditsafeOptions, CreditsafeError } from './'

export interface CompanyAddress {
  type?: string;
  simpleValue: string;
  street: string;
  houseNumber?: string;
  city: string;
  postCode: string;
  province: string;
  country: string;
  telephone?: string;
  directMarketingOptOut?: boolean;
  directMarketingOptIn?: boolean;
}

export interface CompanyActivity {
  code: string;
  industrySector: string;
  description: string;
  classification: string;
}

export interface Company {
  id: string;
  id2: string;
  country: string;
  regNo?: string;
  vatNo?: string;
  safeNo?: string;
  name: string;
  address: CompanyAddress;
  activity?: CompanyActivity;
  officeType: string;
  type: string;
  status: string;
  legalForm?: string;
  dateOfLatestAccounts?: string;
  dateOfLatestChange?: string;
  onlineReports?: boolean;
  monitoring?: boolean;
  searchRanking?: string;
  additionalData?: any;
}

export interface CompanyList {
  correlationId: string;
  page: bigint;
  pageSize: bigint;
  totalSize: bigint;
  companies: Company[];
}

export interface CreditReport {
  companyId: string;
  language: string;
  companySummary: any;
  companyIdentification: any;
  creditScore: any;
  contactInformation: any;
  shareCapitalStructure?: any;
  directors: any;
  directorships?: any;
  otherInformation: any;
  groupStructure?: any;
  extendedGroupStructure?: any;
  financialStatements?: any;
  localFinancialStatements?: any;
  negativeInformation: any;
  negativeInformationExtra?: any;
  additionalInformation: any;
  directorsExtra?: any;
  extendedGroupStructureExtra?: any;
  paymentData?: any;
  paymentDataExtra?: any;
  alternateSummary?: any;
}

export class CompanyApi {
  client: Creditsafe;

  constructor(client: Creditsafe, _options?: CreditsafeOptions) {
    this.client = client
  }

  /*
   * Function to take a series of searchable fields, most of which are optional,
   * as input, and pass them to Creditsafe, and have them return a *paged* list
   * of companies that fit the search criteria - as closely as possible, in
   * descending order of accuracy of match. This means, the first page is likely
   * the "best page", but there's nothing that says you can't get every one.
   */
  async search(search: {
    countries: string[],
    page?: number,
    pageSize?: number,
    language?: string,
    id?: string,
    safeNo?: string,
    regNo?: string,
    vatNo?: string,
    name?: string,
    tradeName?: string,
    acronym?: string,
    exact?: boolean,
    address?: string,
    street?: string,
    houseNo?: string,
    city?: string,
    postCode?: string,
    province?: string,
    callRef?: string,
    officeType?: string,
    phoneNo?: string,
    status?: string,
    type?: string,
    website?: string,
    customData?: string,
  }): Promise<{
    success: boolean,
    data?: CompanyList,
    error?: CreditsafeError
  }> {
    const resp = await this.client.fire(
      'GET',
      'companies',
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
   * Function to take a Creditsafe connect Id, and some options, and get the
   * credit report, in JSON format, for that company from Creditsafe. This
   * has a very detailed and complex structure, but it's also a wealth of
   * information about the company.
   */
  async creditReport(connectId: string, options?: {
    language?: string,
    template?: string,
    customData?: string,
    callRef?: string,
  }): Promise<{
    success: boolean,
    data?: {
      correlationId: string,
      report: CreditReport,
      companyId: string,
      dateOfOrder: string,
      language: string,
      userId: string,
    },
    error?: CreditsafeError
  }> {
    const resp = await this.client.fire(
      'GET',
      `companies/${connectId}`,
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
   * set of search criteria that can be used to search for the Companies in
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
      'companies/searchcriteria',
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

  /*
   * Function similar to search() - but for a single Country, and with an
   * additional 'confidenceMatchScore' for how close the match was to the
   * search criteria.
   */
  async matchSearch(search: {
    country: string,
    page?: number,
    pageSize?: number,
    matchThreshold?: number,
    regNo?: string,
    vatNo?: string,
    name?: string,
    address?: string,
    street?: string,
    houseNo?: string,
    city?: string,
    postCode?: string,
    province?: string,
    state?: string,
    callRef?: string,
    officeType?: string,
    phoneNo?: string,
    status?: string,
    type?: string,
    website?: string,
    reference1?: string,
    reference2?: string,
    reference3?: string,
  }): Promise<{
    success: boolean,
    data?: CompanyList,
    error?: CreditsafeError
  }> {
    const resp = await this.client.fire(
      'GET',
      'companies/match',
      { ...search, country: search.country.toUpperCase() }
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
