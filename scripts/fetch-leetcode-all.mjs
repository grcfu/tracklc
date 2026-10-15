// Fetches every problem in LeetCode's "Algorithms" set from its public
// GraphQL API (no SQL / Pandas / JavaScript / Shell / Concurrency drills).
//
//   node scripts/fetch-leetcode-all.mjs

const PAGE = 100

const QUERY = `query q($skip: Int, $limit: Int) {
  questionList(categorySlug: "algorithms", limit: $limit, skip: $skip, filters: {}) {
    totalNum
    data {
      questionFrontendId
      title
      titleSlug
      difficulty
      isPaidOnly
      topicTags { name }
    }
  }
}`

async function page(skip) {
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Referer: 'https://leetcode.com/problemset/',
      'User-Agent': 'Mozilla/5.0',
    },
    body: JSON.stringify({ query: QUERY, variables: { skip, limit: PAGE } }),
  })
  if (!res.ok) throw new Error(`LeetCode responded ${res.status}`)
  return (await res.json()).data.questionList
}

const first = await page(0)
const all = [...first.data]
for (let skip = PAGE; skip < first.totalNum; skip += PAGE) {
  all.push(...(await page(skip)).data)
}
all.sort((a, b) => Number(a.questionFrontendId) - Number(b.questionFrontendId))

console.log(`Fetched ${all.length} problems`)
