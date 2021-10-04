import { Creditsafe } from '../src/index'

(async () => {
  const client = new Creditsafe(
    process.env.CREDITSAFE_USERNAME!,
    process.env.CREDITSAFE_PASSWORD!,
    { host: process.env.CREDITSAFE_HOST! }
  )

  console.log('attempting to look up Flexbase...')
  const one = await client.company.search({
    countries: ['us'],
    page: 1,
    pageSize: 50,
    id: 'US001-X-US150142676',
  })
  if (one.success) {
    console.log('Success!')
  } else {
    console.log('Error! I was not able to find Flexbase, and I should.')
    console.log(one)
  }

  console.log('attempting to look up Main Street, San Fransicso, CA 94105...')
  const two = await client.company.search({
    countries: ['us'],
    page: 1,
    pageSize: 50,
    street: 'Main Street',
    city: 'SanFrancisco',
    province: 'CA',
    postCode: '94105',
  })
  if (two.success) {
    console.log(`Success! We found ${two.data?.totalSize} companies`)
  } else {
    console.log('Error! I was not able to find the Main St. companies.')
    console.log(two)
  }

  console.log('fetching the credit report for Flexbase...')
  const tre = await client.company.creditReport('US001-X-US150142676')
  if (tre.success) {
    console.log('Success!')
  } else {
    console.log('Error! I was not able to get the report for Flexbase, and I should.')
    console.log(tre)
  }

  console.log('fetching the company search criteria...')
  const fre = await client.company.searchCriteria(['us', 'gb'])
  if (fre.success) {
    console.log('Success!')
  } else {
    console.log('Error! I was not able to get the search criteria.')
    console.log(fre)
  }

  console.log('attempting to match on Main Street, San Fransicso, CA 94105...')
  const fiv = await client.company.matchSearch({
    country: 'us',
    page: 1,
    pageSize: 50,
    street: 'Main Street',
    city: 'SanFrancisco',
    province: 'CA',
    postCode: '94105',
  })
  if (fiv.success) {
    console.log('Success!')
  } else {
    console.log('Error! I was not able to find the Main St. companies.')
    console.log(fiv)
  }
})()
