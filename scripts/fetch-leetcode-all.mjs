// Fetches every problem in LeetCode's "Algorithms" set from its public
// GraphQL API (no SQL / Pandas / JavaScript / Shell / Concurrency drills).
// Each problem gets one pattern-style category derived from its topic tags.
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

/** First matching tag wins, so more specific patterns come first. */
const CATEGORY_RULES = [
  ['Tries', ['Trie']],
  ['Advanced Graphs', ['Shortest Path', 'Minimum Spanning Tree', 'Eulerian Circuit', 'Strongly Connected Component', 'Biconnected Component']],
  ['Graphs', ['Graph Theory', 'Graph', 'Topological Sort', 'Union-Find', 'Union Find']],
  ['Dynamic Programming', ['Dynamic Programming', 'Memoization']],
  ['Backtracking', ['Backtracking']],
  ['Heap / Priority Queue', ['Heap (Priority Queue)']],
  ['Trees', ['Tree', 'Binary Tree', 'Binary Search Tree', 'Segment Tree', 'Binary Indexed Tree']],
  ['Linked List', ['Linked List', 'Doubly-Linked List']],
  ['Sliding Window', ['Sliding Window']],
  ['Binary Search', ['Binary Search']],
  ['Stack', ['Stack', 'Monotonic Stack', 'Queue', 'Monotonic Queue']],
  ['Graphs', ['Breadth-First Search', 'Depth-First Search']],
  ['Two Pointers', ['Two Pointers']],
  ['Greedy', ['Greedy']],
  ['Bit Manipulation', ['Bit Manipulation', 'Bitmask']],
  ['Math & Geometry', ['Math', 'Geometry', 'Matrix', 'Number Theory', 'Combinatorics']],
  ['Design', ['Design', 'Data Stream', 'Iterator']],
]
const FALLBACK = 'Arrays & Hashing'

function categoryOf(tags) {
  const names = new Set(tags.map((t) => t.name))
  for (const [category, match] of CATEGORY_RULES) {
    if (match.some((m) => names.has(m))) return category
  }
  return FALLBACK
}

const first = await page(0)
const all = [...first.data]
for (let skip = PAGE; skip < first.totalNum; skip += PAGE) {
  all.push(...(await page(skip)).data)
}
all.sort((a, b) => Number(a.questionFrontendId) - Number(b.questionFrontendId))

const counts = {}
for (const q of all) {
  const category = categoryOf(q.topicTags)
  counts[category] = (counts[category] ?? 0) + 1
}
console.log(`Fetched ${all.length} problems`, counts)
