# creditsafe-node-client

`creditsafe-node-client` is a Node/JS and TypeScript Client for
[Creditsafe](https://creditsafe.com) that allows you to use normal Node
syntax to look up Companies, Directors, Documents, and other data from the
Creditsafe
[Connect API](https://www.creditsafe.com/us/en/enterprise/integrations/api-documentation.html).

## Install

```bash
# with npm
$ npm install creditsafe-node-client
```

## Usage

This README isn't going to cover all the specifics of what Creditsafe is,
and how to use it - it's targeted as a _companion_ to the Creditsafe developer
[docs](https://www.creditsafe.com/us/en/enterprise/integrations/api-documentation.html)
that explain each of the endpoints and how the general Creditsafe
[Connect API](https://www.creditsafe.com/us/en/enterprise/integrations/api-documentation.html)
works.

However, we'll put in plenty of examples so that it's clear how to use this
library to interact with Creditsafe.

### Getting your API Credentials

As documented on the Creditsafe site, the first step is getting a set
of credentials (login and password) for the calls to Creditsafe. A demo
account is available on their website, and is suitable for exploring the
data in the Creditsafe `sandbox`. The `/authenticate` endpoint exchanges
these credentials for a standard JWT Bearer token that will be used in
all subsequent calls to Creditsafe.

Thankfully, this client handles all the exchanges for the JWT Bearer token
for you - when you don't have one, when it needs to be refreshed - all that.
You only need to create the `Creditsafe` client with the credientials, and
the rest is taken care of.

### Creating the Client

All Creditsafe functions are available from the client, and the basic
construction of the client is:

```typescript
import { Creditsafe } from 'creditsafe-node-client'
const client = new Creditsafe(username, password)
```

If you'd like to provide the base host in the constructor, for example,
if you wanted to point to the Creditsafe `sandbox`, you can do that
with:

```typescript
const client = new Creditsafe(
  'me@myplace.com',
  'sdajhurhckhsjkfheaskj',
  {
    host: 'connect.sandbox.creditsafe.com/v1',
  }
)
```

where the options can include:

* `host` - the hostname where all Creditsafe calls should be sent

### Company Calls

As stated in the Creditsafe
[Contact API](https://www.creditsafe.com/us/en/enterprise/integrations/api-documentation.html)
documentation:

> Endpoints to search for Companies in the Creditsafe Global Company
> Database. Companies are uniquely identified by the `connectId` - the
> identifier used to order a Company Credit Report. The Company Credit
> Report is a JSON object comprising of key business and financial data
> points such as Credit Score & Limit, Industry Code, Directors, Balance
> Sheet and Negative Information. A full list of Company data points can
> be found in the Data Matrix, in the help resources.

#### [Company Search](https://www.creditsafe.com/us/en/enterprise/integrations/api-documentation.html#operation/Company%20Search)

If you have the Creditsafe `connectId`, you can look up that one Company
with the call:

```typescript
const resp = await client.company.search({
  countries: ['us'],
  page: 1,
  pageSize: 50,
  id: 'US001-X-US150142676',
})
```

This will return  The response will be something like:

```javascript
{
  success: true,
  data: {
    correlationId: '53cafed7-f7a7-4b27-a833-d804dd4c4720',
    totalSize: 1,
    companies: [
      {
        id: 'US001-X-US150142676',
        id2: 'US-X-US150142676',
        country: 'US',
        regNo: '7212441',
        safeNo: 'US150142676',
        name: 'FLEXBASE',
        address: {
          simpleValue: '338 MAIN STREET, 12C, SAN FRANCISCO, CA, 94105',
          street: '338 MAIN STREET, 12C',
          city: 'SAN FRANCISCO',
          postCode: '94105',
          province: 'CA'
        },
        status: 'Active',
        officeType: 'HeadOffice',
        type: 'NotSet'
      }
    ]
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "error": {
    "type": "creditsafe",
    "error": "(Error message from Creditsafe...)"
  }
}
```

So looking at the `success` value of the response will quickly let you know the outcome of the call.

If you'd like to look up a Company by it's address, that call might look like:

```javascript
const resp = await client.company.search({
  countries: ['us'],
  page: 1,
  pageSize: 50,
  street: 'Main Street',
  city: 'SanFrancisco',
  province: 'CA',
  postCode: '94105',
})
```

and the response will look something like:

```javascript
{
  success: true,
  data: {
    correlationId: '1f11fb4d-96f0-4d6d-bd23-0c6e754a7c33',
    totalSize: 79704,
    companies: [
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object]
    ]
  }
}
```

where each of the entries in the `companies` array will look like the one
in the previous response.

#### [Company Credit Report](https://www.creditsafe.com/us/en/enterprise/integrations/api-documentation.html#operation/Company%20Credit%20Report)

```typescript
const rpt = await client.company.creditReport(id)
```

where `id` is the Creditsafe Connect ID, like `US001-X-US150142676`, in the
above example, and the response will be the Credit Report, and will look
something like:

```javascript
{
  success: true,
  data: {
    correlationId: 'af389239-2bda-4739-8026-84a311794064',
    report: {
      companyId: 'US001-X-US150142676',
      language: 'EN',
      companySummary: [Object],
      companyIdentification: [Object],
      creditScore: [Object],
      contactInformation: [Object],
      directors: [Object],
      otherInformation: [Object],
      negativeInformation: [Object],
      additionalInformation: [Object]
    },
    companyId: 'US001-X-US150142676',
    dateOfOrder: '2021-10-04T12:19:13.788Z',
    language: 'en',
    userId: '101645123'
  }
}
```

#### [Company Search Criteria](https://www.creditsafe.com/us/en/enterprise/integrations/api-documentation.html#operation/Company%20Search%20Criteria)

```typescript
const resp = await client.company.searchCriteria(['us', 'gb'])
```

This will list all the criteria for the listed ISO Country codes for the
searching of the companies, and will look something like:

```javascript
{
  success: true,
  data: {
    correlationId: '8b69c82d-b544-4638-8cc2-fdd13ac5e75c',
    countries: [ 'US', 'GB' ],
    languages: [ 'EN' ],
    criteriaSets: [
      { id: { required: true } },
      { safeNo: { required: true } },
      { regNo: { required: true } },
      { vatNo: { required: true } },
      {
        name: { required: false },
        status: { allowedValues: [Array], required: false },
        address: { street: [Object], city: [Object], postCode: [Object] },
        phoneNo: { required: false }
      }
    ]
  }
}
```

#### [Confidence Match Search](https://www.creditsafe.com/us/en/enterprise/integrations/api-documentation.html#operation/Confidence%20Match%20Search)

```typescript
const resp = await client.company.matchSearch({
  country: 'us',
  page: 1,
  pageSize: 50,
  street: 'Main Street',
  city: 'SanFrancisco',
  province: 'CA',
  postCode: '94105',
})
```

where we get a similar response as to the general Company Search, but this
includes the `confidenceMatchScore` to indicate Creditsafe's confidence
on the match, and the response will be something like:

```javascript
{
  success: true,
  data: {
    correlationId: '1f11fb4d-96f0-4d6d-bd23-0c6e754a7c33',
    totalSize: 79704,
    companies: [
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object]
    ]
  }
}
```

### People/Director Calls

As stated in the Creditsafe
[Contact API](https://www.creditsafe.com/us/en/enterprise/integrations/api-documentation.html)
documentation:

> Endpoints to find People/Directors and order Director Reports. A Director
> Report will contain a person's registered information and Active & Previous
> Directorships, where available. This endpoint is not advised to get a list
> of directors for a specific Company. Instead, order a Company Credit Report
> using the `/companies/{id}` endpoint, and use the `directors` section in the
> response.

#### [Director Search](https://www.creditsafe.com/us/en/enterprise/integrations/api-documentation.html#operation/Director%20Search)

The basic Director Search call for a single, specific, director looks
something like this:

```typescript
const who = await client.people.search({
  countries: ['us'],
  page: 1,
  pageSize: 50,
  peopleId: 'US-S340823369',
})
```

The response will be something like:

```javascript
{
  success: true,
  data: {
    correlationId: '9077ca80-1e7a-400c-a577-95f7fa96df2d',
    totalSize: 1,
    directors: [
      {
        peopleId: 'US-S340823369',
        firstName: 'DONNA',
        lastName: 'RICHARDS',
        title: 'DIRECTOR',
        country: 'US',
        company: {
          companyName: 'RIVER CITY BALLET INC.',
          safeNumber: 'US136302020',
          type: 'X',
          charterNumber: '0679634',
          rating: 39,
          limit: 1000,
          derogatoryCount: 0,
          derogatoryAmount: 0
        },
        address: { simpleValue: '' },
        source: 'S',
        taxCode: 'US-S340823369'
      }
    ]
  }
}
```

If there had been an error, the response would be:

```javascript
{
  "success": false,
  "error": {
    "type": "creditsafe",
    "error": "(Error message from Creditsafe...)"
  }
}
```

If the search is more general in nature, say, only the last name, then that
might look like:

```typescript
const who = await client.people.search({
  countries: ['us'],
  page: 1,
  pageSize: 50,
  lastName: 'Richards',
})
```

The response will be something like:

```javascript
{
  success: true,
  data: {
    correlationId: 'c08bb0bd-9777-44de-ad9a-de06e9dd6e79',
    totalSize: 69820,
    directors: [
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object], [Object], [Object],
      [Object], [Object]
    ]
  }
}
```

where each of the entries in the `directors` array will look like the one
in the previous response.

#### [Director Report](https://www.creditsafe.com/us/en/enterprise/integrations/api-documentation.html#operation/Director%20Report)

```typescript
const rpt = await client.people.directorReport(id)
```

where `id` is the People ID, like `US-S340823369`, in the
above example, and the response will be something like:

```javascript
{
  success: true,
  data: {
    correlationId: '9c40cab4-febe-4431-a9c7-7b9a618c8996',
    report: {
      directorId: 'US-S340823369',
      directorSummary: [Object],
      directorDetails: [Object],
      directorships: [Object]
    },
    directorId: 'US-S340823369',
    dateOfOrder: '2021-10-04T13:00:09.320Z',
    language: 'en',
    userId: '101645123'
  }
}
```

#### [People/Director Search Criteria](https://www.creditsafe.com/us/en/enterprise/integrations/api-documentation.html#operation/People/Director%20Search%20Criteria)

```typescript
const resp = await client.people.searchCriteria(['us', 'gb'])
```

This will list all the criteria for the listed ISO Country codes for searching
of the directors, and will look something like:

```javascript
{
  success: true,
  data: {
    correlationId: 'c88be664-5286-48a4-bc9b-a3bcbde61bb5',
    countries: [ 'US', 'GB' ],
    criteriaSets: [
      { peopleId: { required: true } },
      {
        firstName: { required: true },
        lastName: { required: false },
        company: { companyName: [Object], safeNumber: [Object] },
        address: {
          street: [Object],
          province: [Object],
          city: [Object],
          postCode: [Object]
        }
      },
      {
        firstName: { required: false },
        lastName: { required: true },
        company: { companyName: [Object], safeNumber: [Object] },
        address: {
          street: [Object],
          city: [Object],
          province: [Object],
          postCode: [Object]
        }
      },
      {
        firstName: { required: false },
        lastName: { required: false },
        company: { companyName: [Object], safeNumber: [Object] },
        address: {
          street: [Object],
          city: [Object],
          province: [Object],
          postCode: [Object]
        }
      },
      {
        firstName: { required: false },
        lastName: { required: false },
        company: { companyName: [Object], safeNumber: [Object] },
        address: {
          street: [Object],
          city: [Object],
          province: [Object],
          postCode: [Object]
        }
      },
      {
        firstName: { required: false },
        lastName: { required: false },
        company: { companyName: [Object], safeNumber: [Object] },
        address: {
          street: [Object],
          province: [Object],
          city: [Object],
          postCode: [Object]
        }
      },
      {
        firstName: { required: false },
        lastName: { required: false },
        company: { companyName: [Object], safeNumber: [Object] },
        address: {
          street: [Object],
          province: [Object],
          city: [Object],
          postCode: [Object]
        }
      }
    ]
  }
}
```

## Development

For those interested in working on the library, there are a few things that
will make that job a little simpler. The organization of the code is all in
`src/`, with one module per _section_ of the Client: `company`, `people`,
etc. This makes location of the function very easy.

Additionally, the main communication with the Creditsafe service is in the
`src/index.ts` module in the `fire()` function. In the constructor for the
Client, each of the _sections_ are created, and then they link back to the
main class for their communication work.

The retries based on an invalid token, typically expired, are handled in
`fire()`, and simply invalidate the JWT Bearer token, and then regenerate
another based on the in-memory, saved, credentials.

### Setup

In order to work with the code, the development dependencies include `dotenv`
so that each user can create a `.env` file with a single value for working
with Creditsafe:

* `CREDITSAFE_USERNAME` - this is the primary account, above, and can be
   created on the Creditsafe site
* `CREDITSAFE_PASSWORD` - this is the password for the primary account
* `CREDITSAFE_HOST` - this is optional, and can point to the Creditsafe
  `sandbox` by equalling: `connect.sandbox.creditsafe.com/v1`

### Testing

There are several test scripts that test, and validate, information on the
Creditsafe service exercising different parts of the API. Each is
self-contained, and can be run with:

```bash
$ npm run ts tests/companies.ts
attempting to look up Flexbase...
Success!
attempting to look up Main Street, San Fransicso, CA 94105...
Success! We found 79704 companies
fetching the credit report for Flexbase...
Success!
fetching the company search criteria...
Success!
attempting to match on Main Street, San Fransicso, CA 94105...
Error! I was not able to find the Main St. companies.
{ success: false, error: { type: 'creditsafe', error: 'Forbidden' } }
```

Each of the tests will run a series of calls through the Client, and check the
results to see that the operation succeeded. As shown, if the steps all
report back with `Success!` then things are working.

If there is an issue with one of the calls, then an `Error!` will be printed
out, and the data returned from the client will be dumped to the console -
as there is with the example, above on the Match Companies call.
