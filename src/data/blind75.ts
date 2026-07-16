import { p, type Problem } from './types'

/**
 * The Blind 75 — the classic 75-problem interview prep list, grouped by the
 * original categories. Ids are LeetCode slugs and are reused by NeetCode 150
 * and the company lists so progress stays in sync.
 */
export const BLIND75: Problem[] = [
  // ── Array ────────────────────────────────────────────────────────────
  p('two-sum', 'Two Sum', 'Array', 'Easy'),
  p('best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock', 'Array', 'Easy'),
  p('contains-duplicate', 'Contains Duplicate', 'Array', 'Easy'),
  p('product-of-array-except-self', 'Product of Array Except Self', 'Array', 'Medium'),
  p('maximum-subarray', 'Maximum Subarray', 'Array', 'Medium'),
  p('maximum-product-subarray', 'Maximum Product Subarray', 'Array', 'Medium'),
  p('find-minimum-in-rotated-sorted-array', 'Find Minimum in Rotated Sorted Array', 'Array', 'Medium'),
  p('search-in-rotated-sorted-array', 'Search in Rotated Sorted Array', 'Array', 'Medium'),
  p('3sum', '3Sum', 'Array', 'Medium'),
  p('container-with-most-water', 'Container With Most Water', 'Array', 'Medium'),

  // ── Binary ───────────────────────────────────────────────────────────
  p('sum-of-two-integers', 'Sum of Two Integers', 'Binary', 'Medium'),
  p('number-of-1-bits', 'Number of 1 Bits', 'Binary', 'Easy'),
  p('counting-bits', 'Counting Bits', 'Binary', 'Easy'),
  p('missing-number', 'Missing Number', 'Binary', 'Easy'),
  p('reverse-bits', 'Reverse Bits', 'Binary', 'Easy'),

  // ── Dynamic Programming ───────────────────────────────────────────────
  p('climbing-stairs', 'Climbing Stairs', 'Dynamic Programming', 'Easy'),
  p('coin-change', 'Coin Change', 'Dynamic Programming', 'Medium'),
  p('longest-increasing-subsequence', 'Longest Increasing Subsequence', 'Dynamic Programming', 'Medium'),
  p('longest-common-subsequence', 'Longest Common Subsequence', 'Dynamic Programming', 'Medium'),
  p('word-break', 'Word Break', 'Dynamic Programming', 'Medium'),
  p('combination-sum', 'Combination Sum', 'Dynamic Programming', 'Medium'),
  p('house-robber', 'House Robber', 'Dynamic Programming', 'Medium'),
  p('house-robber-ii', 'House Robber II', 'Dynamic Programming', 'Medium'),
  p('decode-ways', 'Decode Ways', 'Dynamic Programming', 'Medium'),
  p('unique-paths', 'Unique Paths', 'Dynamic Programming', 'Medium'),
  p('jump-game', 'Jump Game', 'Dynamic Programming', 'Medium'),

  // ── Graph ─────────────────────────────────────────────────────────────
  p('clone-graph', 'Clone Graph', 'Graph', 'Medium'),
  p('course-schedule', 'Course Schedule', 'Graph', 'Medium'),
  p('pacific-atlantic-water-flow', 'Pacific Atlantic Water Flow', 'Graph', 'Medium'),
  p('number-of-islands', 'Number of Islands', 'Graph', 'Medium'),
  p('longest-consecutive-sequence', 'Longest Consecutive Sequence', 'Graph', 'Medium'),
  p('alien-dictionary', 'Alien Dictionary', 'Graph', 'Hard'),
  p('graph-valid-tree', 'Graph Valid Tree', 'Graph', 'Medium'),
  p('number-of-connected-components-in-an-undirected-graph', 'Number of Connected Components in an Undirected Graph', 'Graph', 'Medium'),

  // ── Interval ──────────────────────────────────────────────────────────
  p('insert-interval', 'Insert Interval', 'Interval', 'Medium'),
  p('merge-intervals', 'Merge Intervals', 'Interval', 'Medium'),
  p('non-overlapping-intervals', 'Non-overlapping Intervals', 'Interval', 'Medium'),
  p('meeting-rooms', 'Meeting Rooms', 'Interval', 'Easy'),
  p('meeting-rooms-ii', 'Meeting Rooms II', 'Interval', 'Medium'),

  // ── Linked List ───────────────────────────────────────────────────────
  p('reverse-linked-list', 'Reverse a Linked List', 'Linked List', 'Easy'),
  p('linked-list-cycle', 'Detect Cycle in a Linked List', 'Linked List', 'Easy'),
  p('merge-two-sorted-lists', 'Merge Two Sorted Lists', 'Linked List', 'Easy'),
  p('merge-k-sorted-lists', 'Merge K Sorted Lists', 'Linked List', 'Hard'),
  p('remove-nth-node-from-end-of-list', 'Remove Nth Node From End of List', 'Linked List', 'Medium'),
  p('reorder-list', 'Reorder List', 'Linked List', 'Medium'),

  // ── Matrix ────────────────────────────────────────────────────────────
  p('set-matrix-zeroes', 'Set Matrix Zeroes', 'Matrix', 'Medium'),
  p('spiral-matrix', 'Spiral Matrix', 'Matrix', 'Medium'),
  p('rotate-image', 'Rotate Image', 'Matrix', 'Medium'),
  p('word-search', 'Word Search', 'Matrix', 'Medium'),

  // ── String ────────────────────────────────────────────────────────────
  p('longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters', 'String', 'Medium'),
  p('longest-repeating-character-replacement', 'Longest Repeating Character Replacement', 'String', 'Medium'),
  p('minimum-window-substring', 'Minimum Window Substring', 'String', 'Hard'),
  p('valid-anagram', 'Valid Anagram', 'String', 'Easy'),
  p('group-anagrams', 'Group Anagrams', 'String', 'Medium'),
  p('valid-parentheses', 'Valid Parentheses', 'String', 'Easy'),
  p('valid-palindrome', 'Valid Palindrome', 'String', 'Easy'),
  p('longest-palindromic-substring', 'Longest Palindromic Substring', 'String', 'Medium'),
  p('palindromic-substrings', 'Palindromic Substrings', 'String', 'Medium'),
  p('encode-and-decode-strings', 'Encode and Decode Strings', 'String', 'Medium'),

  // ── Tree ──────────────────────────────────────────────────────────────
  p('maximum-depth-of-binary-tree', 'Maximum Depth of Binary Tree', 'Tree', 'Easy'),
  p('same-tree', 'Same Tree', 'Tree', 'Easy'),
  p('invert-binary-tree', 'Invert/Flip Binary Tree', 'Tree', 'Easy'),
  p('binary-tree-maximum-path-sum', 'Binary Tree Maximum Path Sum', 'Tree', 'Hard'),
  p('binary-tree-level-order-traversal', 'Binary Tree Level Order Traversal', 'Tree', 'Medium'),
  p('serialize-and-deserialize-binary-tree', 'Serialize and Deserialize Binary Tree', 'Tree', 'Hard'),
  p('subtree-of-another-tree', 'Subtree of Another Tree', 'Tree', 'Easy'),
  p('construct-binary-tree-from-preorder-and-inorder-traversal', 'Construct Binary Tree from Preorder and Inorder Traversal', 'Tree', 'Medium'),
  p('validate-binary-search-tree', 'Validate Binary Search Tree', 'Tree', 'Medium'),
  p('kth-smallest-element-in-a-bst', 'Kth Smallest Element in a BST', 'Tree', 'Medium'),
  p('lowest-common-ancestor-of-a-binary-search-tree', 'Lowest Common Ancestor of BST', 'Tree', 'Medium'),
  p('implement-trie-prefix-tree', 'Implement Trie (Prefix Tree)', 'Tree', 'Medium'),
  p('design-add-and-search-words-data-structure', 'Add and Search Word', 'Tree', 'Medium'),
  p('word-search-ii', 'Word Search II', 'Tree', 'Hard'),

  // ── Heap ──────────────────────────────────────────────────────────────
  p('top-k-frequent-elements', 'Top K Frequent Elements', 'Heap', 'Medium'),
  p('find-median-from-data-stream', 'Find Median from Data Stream', 'Heap', 'Hard'),
]
