import { Creditsafe } from '../src/index'

(async () => {
  const client = new Creditsafe(
    process.env.CREDITSAFE_USERNAME!,
    process.env.CREDITSAFE_PASSWORD!,
    { host: process.env.CREDITSAFE_HOST! }
  )

  console.log('attempting to look up Donna Richards...')
  const one = await client.people.search({
    countries: ['us'],
    page: 1,
    pageSize: 50,
    peopleId: 'US-S340823369',
  })
  if (one.success) {
    console.log(`Success! We found the director Donna Richards`)
  } else {
    console.log('Error! I was not able to find Donna Richards, and I should.')
    console.log(one)
  }

  console.log('attempting to look up all directors Richards...')
  const two = await client.people.search({
    countries: ['us'],
    page: 1,
    pageSize: 50,
    lastName: 'Richards',
  })
  if (two.success) {
    console.log(`Success! We found ${two.data?.totalSize} directors`)
  } else {
    console.log('Error! I was not able to find Flexbase, and I should.')
    console.log(two)
  }

  console.log('fetching the director report for Donna Richards...')
  const tre = await client.people.directorReport('US-S340823369')
  if (tre.success) {
    console.log('Success!')
  } else {
    console.log('Error! I was not able to get the report for D. Richards, and I should.')
    console.log(tre)
  }

  console.log('fetching the director search criteria...')
  const fre = await client.people.searchCriteria(['us', 'gb'])
  if (fre.success) {
    console.log('Success!')
  } else {
    console.log('Error! I was not able to get the search criteria.')
    console.log(fre)
  }
})()
