import { p, type Problem } from './types'

/**
 * The NeetCode 150 — a superset-style roadmap grouped by pattern. Shares many
 * ids with the Blind 75 (progress syncs automatically) and adds ~75 more.
 */
export const NEETCODE150: Problem[] = [
  // ── Arrays & Hashing ──────────────────────────────────────────────────
  p('contains-duplicate', 'Contains Duplicate', 'Arrays & Hashing', 'Easy'),
  p('valid-anagram', 'Valid Anagram', 'Arrays & Hashing', 'Easy'),
  p('two-sum', 'Two Sum', 'Arrays & Hashing', 'Easy'),
  p('group-anagrams', 'Group Anagrams', 'Arrays & Hashing', 'Medium'),
  p('top-k-frequent-elements', 'Top K Frequent Elements', 'Arrays & Hashing', 'Medium'),
  p('product-of-array-except-self', 'Product of Array Except Self', 'Arrays & Hashing', 'Medium'),
  p('valid-sudoku', 'Valid Sudoku', 'Arrays & Hashing', 'Medium'),
  p('encode-and-decode-strings', 'Encode and Decode Strings', 'Arrays & Hashing', 'Medium'),
  p('longest-consecutive-sequence', 'Longest Consecutive Sequence', 'Arrays & Hashing', 'Medium'),

  // ── Two Pointers ──────────────────────────────────────────────────────
  p('valid-palindrome', 'Valid Palindrome', 'Two Pointers', 'Easy'),
  p('two-sum-ii-input-array-is-sorted', 'Two Sum II - Input Array Is Sorted', 'Two Pointers', 'Medium'),
  p('3sum', '3Sum', 'Two Pointers', 'Medium'),
  p('container-with-most-water', 'Container With Most Water', 'Two Pointers', 'Medium'),
  p('trapping-rain-water', 'Trapping Rain Water', 'Two Pointers', 'Hard'),

  // ── Sliding Window ────────────────────────────────────────────────────
  p('best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock', 'Sliding Window', 'Easy'),
  p('longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters', 'Sliding Window', 'Medium'),
  p('longest-repeating-character-replacement', 'Longest Repeating Character Replacement', 'Sliding Window', 'Medium'),
  p('permutation-in-string', 'Permutation in String', 'Sliding Window', 'Medium'),
  p('minimum-window-substring', 'Minimum Window Substring', 'Sliding Window', 'Hard'),
  p('sliding-window-maximum', 'Sliding Window Maximum', 'Sliding Window', 'Hard'),

  // ── Stack ─────────────────────────────────────────────────────────────
  p('valid-parentheses', 'Valid Parentheses', 'Stack', 'Easy'),
  p('min-stack', 'Min Stack', 'Stack', 'Medium'),
  p('evaluate-reverse-polish-notation', 'Evaluate Reverse Polish Notation', 'Stack', 'Medium'),
  p('generate-parentheses', 'Generate Parentheses', 'Stack', 'Medium'),
  p('daily-temperatures', 'Daily Temperatures', 'Stack', 'Medium'),
  p('car-fleet', 'Car Fleet', 'Stack', 'Medium'),
  p('largest-rectangle-in-histogram', 'Largest Rectangle in Histogram', 'Stack', 'Hard'),

  // ── Binary Search ─────────────────────────────────────────────────────
  p('binary-search', 'Binary Search', 'Binary Search', 'Easy'),
  p('search-a-2d-matrix', 'Search a 2D Matrix', 'Binary Search', 'Medium'),
  p('koko-eating-bananas', 'Koko Eating Bananas', 'Binary Search', 'Medium'),
  p('find-minimum-in-rotated-sorted-array', 'Find Minimum in Rotated Sorted Array', 'Binary Search', 'Medium'),
  p('search-in-rotated-sorted-array', 'Search in Rotated Sorted Array', 'Binary Search', 'Medium'),
  p('time-based-key-value-store', 'Time Based Key-Value Store', 'Binary Search', 'Medium'),
  p('median-of-two-sorted-arrays', 'Median of Two Sorted Arrays', 'Binary Search', 'Hard'),

  // ── Linked List ───────────────────────────────────────────────────────
  p('reverse-linked-list', 'Reverse Linked List', 'Linked List', 'Easy'),
  p('merge-two-sorted-lists', 'Merge Two Sorted Lists', 'Linked List', 'Easy'),
  p('reorder-list', 'Reorder List', 'Linked List', 'Medium'),
  p('remove-nth-node-from-end-of-list', 'Remove Nth Node From End of List', 'Linked List', 'Medium'),
  p('copy-list-with-random-pointer', 'Copy List with Random Pointer', 'Linked List', 'Medium'),
  p('add-two-numbers', 'Add Two Numbers', 'Linked List', 'Medium'),
  p('linked-list-cycle', 'Linked List Cycle', 'Linked List', 'Easy'),
  p('find-the-duplicate-number', 'Find the Duplicate Number', 'Linked List', 'Medium'),
  p('lru-cache', 'LRU Cache', 'Linked List', 'Medium'),
  p('merge-k-sorted-lists', 'Merge K Sorted Lists', 'Linked List', 'Hard'),
  p('reverse-nodes-in-k-group', 'Reverse Nodes in K-Group', 'Linked List', 'Hard'),

  // ── Trees ─────────────────────────────────────────────────────────────
  p('invert-binary-tree', 'Invert Binary Tree', 'Trees', 'Easy'),
  p('maximum-depth-of-binary-tree', 'Maximum Depth of Binary Tree', 'Trees', 'Easy'),
  p('diameter-of-binary-tree', 'Diameter of Binary Tree', 'Trees', 'Easy'),
  p('balanced-binary-tree', 'Balanced Binary Tree', 'Trees', 'Easy'),
  p('same-tree', 'Same Tree', 'Trees', 'Easy'),
  p('subtree-of-another-tree', 'Subtree of Another Tree', 'Trees', 'Easy'),
  p('lowest-common-ancestor-of-a-binary-search-tree', 'Lowest Common Ancestor of a Binary Search Tree', 'Trees', 'Medium'),
  p('binary-tree-level-order-traversal', 'Binary Tree Level Order Traversal', 'Trees', 'Medium'),
  p('binary-tree-right-side-view', 'Binary Tree Right Side View', 'Trees', 'Medium'),
  p('count-good-nodes-in-binary-tree', 'Count Good Nodes in Binary Tree', 'Trees', 'Medium'),
  p('validate-binary-search-tree', 'Validate Binary Search Tree', 'Trees', 'Medium'),
  p('kth-smallest-element-in-a-bst', 'Kth Smallest Element in a BST', 'Trees', 'Medium'),
  p('construct-binary-tree-from-preorder-and-inorder-traversal', 'Construct Binary Tree from Preorder and Inorder Traversal', 'Trees', 'Medium'),
  p('binary-tree-maximum-path-sum', 'Binary Tree Maximum Path Sum', 'Trees', 'Hard'),
  p('serialize-and-deserialize-binary-tree', 'Serialize and Deserialize Binary Tree', 'Trees', 'Hard'),

  // ── Tries ─────────────────────────────────────────────────────────────
  p('implement-trie-prefix-tree', 'Implement Trie (Prefix Tree)', 'Tries', 'Medium'),
  p('design-add-and-search-words-data-structure', 'Design Add and Search Words Data Structure', 'Tries', 'Medium'),
  p('word-search-ii', 'Word Search II', 'Tries', 'Hard'),

  // ── Heap / Priority Queue ─────────────────────────────────────────────
  p('kth-largest-element-in-a-stream', 'Kth Largest Element in a Stream', 'Heap / Priority Queue', 'Easy'),
  p('last-stone-weight', 'Last Stone Weight', 'Heap / Priority Queue', 'Easy'),
  p('k-closest-points-to-origin', 'K Closest Points to Origin', 'Heap / Priority Queue', 'Medium'),
  p('kth-largest-element-in-an-array', 'Kth Largest Element in an Array', 'Heap / Priority Queue', 'Medium'),
  p('task-scheduler', 'Task Scheduler', 'Heap / Priority Queue', 'Medium'),
  p('design-twitter', 'Design Twitter', 'Heap / Priority Queue', 'Medium'),
  p('find-median-from-data-stream', 'Find Median from Data Stream', 'Heap / Priority Queue', 'Hard'),

  // ── Backtracking ──────────────────────────────────────────────────────
  p('subsets', 'Subsets', 'Backtracking', 'Medium'),
  p('combination-sum', 'Combination Sum', 'Backtracking', 'Medium'),
  p('permutations', 'Permutations', 'Backtracking', 'Medium'),
  p('subsets-ii', 'Subsets II', 'Backtracking', 'Medium'),
  p('combination-sum-ii', 'Combination Sum II', 'Backtracking', 'Medium'),
  p('word-search', 'Word Search', 'Backtracking', 'Medium'),
  p('palindrome-partitioning', 'Palindrome Partitioning', 'Backtracking', 'Medium'),
  p('letter-combinations-of-a-phone-number', 'Letter Combinations of a Phone Number', 'Backtracking', 'Medium'),
  p('n-queens', 'N-Queens', 'Backtracking', 'Hard'),

  // ── Graphs ────────────────────────────────────────────────────────────
  p('number-of-islands', 'Number of Islands', 'Graphs', 'Medium'),
  p('clone-graph', 'Clone Graph', 'Graphs', 'Medium'),
  p('max-area-of-island', 'Max Area of Island', 'Graphs', 'Medium'),
  p('pacific-atlantic-water-flow', 'Pacific Atlantic Water Flow', 'Graphs', 'Medium'),
  p('surrounded-regions', 'Surrounded Regions', 'Graphs', 'Medium'),
  p('rotting-oranges', 'Rotting Oranges', 'Graphs', 'Medium'),
  p('walls-and-gates', 'Walls and Gates', 'Graphs', 'Medium'),
  p('course-schedule', 'Course Schedule', 'Graphs', 'Medium'),
  p('course-schedule-ii', 'Course Schedule II', 'Graphs', 'Medium'),
  p('redundant-connection', 'Redundant Connection', 'Graphs', 'Medium'),
  p('number-of-connected-components-in-an-undirected-graph', 'Number of Connected Components in an Undirected Graph', 'Graphs', 'Medium'),
  p('graph-valid-tree', 'Graph Valid Tree', 'Graphs', 'Medium'),
  p('word-ladder', 'Word Ladder', 'Graphs', 'Hard'),

  // ── Advanced Graphs ───────────────────────────────────────────────────
  p('reconstruct-itinerary', 'Reconstruct Itinerary', 'Advanced Graphs', 'Hard'),
  p('min-cost-to-connect-all-points', 'Min Cost to Connect All Points', 'Advanced Graphs', 'Medium'),
  p('network-delay-time', 'Network Delay Time', 'Advanced Graphs', 'Medium'),
  p('swim-in-rising-water', 'Swim in Rising Water', 'Advanced Graphs', 'Hard'),
  p('alien-dictionary', 'Alien Dictionary', 'Advanced Graphs', 'Hard'),
  p('cheapest-flights-within-k-stops', 'Cheapest Flights Within K Stops', 'Advanced Graphs', 'Medium'),

  // ── 1-D Dynamic Programming ───────────────────────────────────────────
  p('climbing-stairs', 'Climbing Stairs', '1-D Dynamic Programming', 'Easy'),
  p('min-cost-climbing-stairs', 'Min Cost Climbing Stairs', '1-D Dynamic Programming', 'Easy'),
  p('house-robber', 'House Robber', '1-D Dynamic Programming', 'Medium'),
  p('house-robber-ii', 'House Robber II', '1-D Dynamic Programming', 'Medium'),
  p('longest-palindromic-substring', 'Longest Palindromic Substring', '1-D Dynamic Programming', 'Medium'),
  p('palindromic-substrings', 'Palindromic Substrings', '1-D Dynamic Programming', 'Medium'),
  p('decode-ways', 'Decode Ways', '1-D Dynamic Programming', 'Medium'),
  p('coin-change', 'Coin Change', '1-D Dynamic Programming', 'Medium'),
  p('maximum-product-subarray', 'Maximum Product Subarray', '1-D Dynamic Programming', 'Medium'),
  p('word-break', 'Word Break', '1-D Dynamic Programming', 'Medium'),
  p('longest-increasing-subsequence', 'Longest Increasing Subsequence', '1-D Dynamic Programming', 'Medium'),
  p('partition-equal-subset-sum', 'Partition Equal Subset Sum', '1-D Dynamic Programming', 'Medium'),

  // ── 2-D Dynamic Programming ───────────────────────────────────────────
  p('unique-paths', 'Unique Paths', '2-D Dynamic Programming', 'Medium'),
  p('longest-common-subsequence', 'Longest Common Subsequence', '2-D Dynamic Programming', 'Medium'),
  p('best-time-to-buy-and-sell-stock-with-cooldown', 'Best Time to Buy and Sell Stock with Cooldown', '2-D Dynamic Programming', 'Medium'),
  p('coin-change-ii', 'Coin Change II', '2-D Dynamic Programming', 'Medium'),
  p('target-sum', 'Target Sum', '2-D Dynamic Programming', 'Medium'),
  p('interleaving-string', 'Interleaving String', '2-D Dynamic Programming', 'Medium'),
  p('longest-increasing-path-in-a-matrix', 'Longest Increasing Path in a Matrix', '2-D Dynamic Programming', 'Hard'),
  p('distinct-subsequences', 'Distinct Subsequences', '2-D Dynamic Programming', 'Hard'),
  p('edit-distance', 'Edit Distance', '2-D Dynamic Programming', 'Medium'),
  p('burst-balloons', 'Burst Balloons', '2-D Dynamic Programming', 'Hard'),
  p('regular-expression-matching', 'Regular Expression Matching', '2-D Dynamic Programming', 'Hard'),

  // ── Greedy ────────────────────────────────────────────────────────────
  p('maximum-subarray', 'Maximum Subarray', 'Greedy', 'Medium'),
  p('jump-game', 'Jump Game', 'Greedy', 'Medium'),
  p('jump-game-ii', 'Jump Game II', 'Greedy', 'Medium'),
  p('gas-station', 'Gas Station', 'Greedy', 'Medium'),
  p('hand-of-straights', 'Hand of Straights', 'Greedy', 'Medium'),
  p('merge-triplets-to-form-target-triplet', 'Merge Triplets to Form Target Triplet', 'Greedy', 'Medium'),
  p('partition-labels', 'Partition Labels', 'Greedy', 'Medium'),
  p('valid-parenthesis-string', 'Valid Parenthesis String', 'Greedy', 'Medium'),

  // ── Intervals ─────────────────────────────────────────────────────────
  p('insert-interval', 'Insert Interval', 'Intervals', 'Medium'),
  p('merge-intervals', 'Merge Intervals', 'Intervals', 'Medium'),
  p('non-overlapping-intervals', 'Non-overlapping Intervals', 'Intervals', 'Medium'),
  p('meeting-rooms', 'Meeting Rooms', 'Intervals', 'Easy'),
  p('meeting-rooms-ii', 'Meeting Rooms II', 'Intervals', 'Medium'),
  p('minimum-interval-to-include-each-query', 'Minimum Interval to Include Each Query', 'Intervals', 'Hard'),

  // ── Math & Geometry ───────────────────────────────────────────────────
  p('rotate-image', 'Rotate Image', 'Math & Geometry', 'Medium'),
  p('spiral-matrix', 'Spiral Matrix', 'Math & Geometry', 'Medium'),
  p('set-matrix-zeroes', 'Set Matrix Zeroes', 'Math & Geometry', 'Medium'),
  p('happy-number', 'Happy Number', 'Math & Geometry', 'Easy'),
  p('plus-one', 'Plus One', 'Math & Geometry', 'Easy'),
  p('powx-n', 'Pow(x, n)', 'Math & Geometry', 'Medium'),
  p('multiply-strings', 'Multiply Strings', 'Math & Geometry', 'Medium'),
  p('detect-squares', 'Detect Squares', 'Math & Geometry', 'Medium'),

  // ── Bit Manipulation ──────────────────────────────────────────────────
  p('single-number', 'Single Number', 'Bit Manipulation', 'Easy'),
  p('number-of-1-bits', 'Number of 1 Bits', 'Bit Manipulation', 'Easy'),
  p('counting-bits', 'Counting Bits', 'Bit Manipulation', 'Easy'),
  p('reverse-bits', 'Reverse Bits', 'Bit Manipulation', 'Easy'),
  p('missing-number', 'Missing Number', 'Bit Manipulation', 'Easy'),
  p('sum-of-two-integers', 'Sum of Two Integers', 'Bit Manipulation', 'Medium'),
  p('reverse-integer', 'Reverse Integer', 'Bit Manipulation', 'Medium'),
]
