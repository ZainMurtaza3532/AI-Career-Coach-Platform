export const CODING_LANGUAGES = [
  { id: "javascript", label: "JavaScript (Node.js)", monaco: "javascript" },
  { id: "typescript", label: "TypeScript", monaco: "typescript" },
  { id: "python", label: "Python (v3.12)", monaco: "python" },
  { id: "java", label: "Java (OpenJDK 21)", monaco: "java" },
  { id: "cpp", label: "C++ (GCC 14 / C++20)", monaco: "cpp" },
  { id: "csharp", label: "C# (.NET 8)", monaco: "csharp" },
  { id: "go", label: "Go (Golang 1.22)", monaco: "go" },
  { id: "rust", label: "Rust (2021 Edition)", monaco: "rust" },
  { id: "php", label: "PHP (8.3)", monaco: "php" },
  { id: "ruby", label: "Ruby (3.3)", monaco: "ruby" },
  { id: "swift", label: "Swift (5.10)", monaco: "swift" },
  { id: "kotlin", label: "Kotlin (2.0)", monaco: "kotlin" },
  { id: "sql", label: "SQL (PostgreSQL / ANSI)", monaco: "sql" },
];

export const CODING_PROBLEMS = [
  {
    id: "two-sum",
    title: "Two Sum & Target Pair",
    difficulty: "Easy",
    category: "Arrays & Hash Maps",
    targetTimeComplexity: "O(n)",
    targetSpaceComplexity: "O(n)",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice. You can return the answer in any order.`,
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
      cpp: `#include <vector>
#include <unordered_map>

class Solution {
public:
    std::vector<int> twoSum(std::vector<int>& nums, int target) {
        std::unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.find(complement) != seen.end()) {
                return { seen[complement], i };
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
      csharp: `using System.Collections.Generic;

public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        var map = new Dictionary<int, int>();
        for (int i = 0; i < nums.Length; i++) {
            int complement = target - nums[i];
            if (map.TryGetValue(complement, out int index)) {
                return new int[] { index, i };
            }
            map[nums[i]] = i;
        }
        return new int[0];
    }
}`,
      go: `package main

func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        complement := target - num
        if idx, found := seen[complement]; found {
            return []int{idx, i}
        }
        seen[num] = i
    }
    return nil
}`,
      rust: `use std::collections::HashMap;

impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        let mut seen = HashMap::new();
        for (i, &num) in nums.iter().enumerate() {
            let complement = target - num;
            if let Some(&prev_idx) = seen.get(&complement) {
                return vec![prev_idx as i32, i as i32];
            }
            seen.insert(num, i);
        }
        vec![]
    }
}`,
      php: `<?php

function twoSum(array $nums, int $target): array {
    $seen = [];
    foreach ($nums as $i => $num) {
        $complement = $target - $num;
        if (isset($seen[$complement])) {
            return [$seen[$complement], $i];
        }
        $seen[$num] = $i;
    }
    return [];
}`,
      ruby: `def two_sum(nums, target)
  seen = {}
  nums.each_with_index do |num, i|
    complement = target - num
    return [seen[complement], i] if seen.key?(complement)
    seen[num] = i
  end
  []
end`,
      swift: `class Solution {
    func twoSum(_ nums: [Int], _ target: Int) -> [Int] {
        var seen = [Int: Int]()
        for (i, num) in nums.enumerated() {
            let complement = target - num
            if let prev = seen[complement] {
                return [prev, i]
            }
            seen[num] = i
        }
        return []
    }
}`,
      kotlin: `class Solution {
    fun twoSum(nums: IntArray, target: Int): IntArray {
        val seen = HashMap<Int, Int>()
        for (i in nums.indices) {
            val complement = target - nums[i]
            if (seen.containsKey(complement)) {
                return intArrayOf(seen[complement]!!, i)
            }
            seen[nums[i]] = i
        }
        return intArrayOf()
    }
}`,
      sql: `-- SQL Query Solution
-- Given table: numbers (id INT PRIMARY KEY, val INT)
SELECT a.id AS idx1, b.id AS idx2
FROM numbers a
JOIN numbers b ON a.val + b.val = :target AND a.id < b.id
LIMIT 1;`,
    },
    testCases: [
      {
        id: 1,
        input: { nums: [2, 7, 11, 15], target: 9 },
        expected: [0, 1],
        description: "Basic pair at start",
      },
      {
        id: 2,
        input: { nums: [3, 2, 4], target: 6 },
        expected: [1, 2],
        description: "Target requires middle elements",
      },
      {
        id: 3,
        input: { nums: [3, 3], target: 6 },
        expected: [0, 1],
        description: "Duplicate values in array",
      },
      {
        id: 4,
        input: { nums: [-1, -2, -3, -4, -5], target: -8 },
        expected: [2, 4],
        description: "Negative numbers handling",
      },
    ],
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses & Balanced Brackets",
    difficulty: "Easy",
    category: "Stack",
    targetTimeComplexity: "O(n)",
    targetSpaceComplexity: "O(n)",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'.",
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (stack.pop() !== map[char]) {
      return false;
    }
  }
  return stack.length === 0;
}`,
      typescript: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (stack.pop() !== map[char]) {
      return false;
    }
  }
  return stack.length === 0;
}`,
      python: `def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif not stack or stack.pop() != mapping.get(char):
            return False
    return len(stack) == 0`,
      java: `import java.util.Stack;
import java.util.Map;
import java.util.HashMap;

class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        Map<Character, Character> map = Map.of(')', '(', '}', '{', ']', '[');
        for (char c : s.toCharArray()) {
            if (map.containsValue(c)) {
                stack.push(c);
            } else if (stack.isEmpty() || stack.pop() != map.get(c)) {
                return false;
            }
        }
        return stack.isEmpty();
    }
}`,
      cpp: `#include <string>
#include <stack>
#include <unordered_map>

class Solution {
public:
    bool isValid(std::string s) {
        std::stack<char> st;
        std::unordered_map<char, char> map = {{')', '('}, {'}', '{'}, {']', '['}};
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') {
                st.push(c);
            } else {
                if (st.empty() || st.top() != map[c]) return false;
                st.pop();
            }
        }
        return st.empty();
    }
};`,
      csharp: `using System.Collections.Generic;

public class Solution {
    public bool IsValid(string s) {
        var stack = new Stack<char>();
        var map = new Dictionary<char, char> { { ')', '(' }, { '}', '{' }, { ']', '[' } };
        foreach (char c in s) {
            if (c == '(' || c == '{' || c == '[') {
                stack.Push(c);
            } else {
                if (stack.Count == 0 || stack.Pop() != map[c]) return false;
            }
        }
        return stack.Count == 0;
    }
}`,
      go: `package main

func isValid(s string) bool {
    stack := []rune{}
    match := map[rune]rune{')': '(', '}': '{', ']': '['}
    for _, ch := range s {
        if ch == '(' || ch == '{' || ch == '[' {
            stack = append(stack, ch)
        } else {
            if len(stack) == 0 || stack[len(stack)-1] != match[ch] {
                return false
            }
            stack = stack[:len(stack)-1]
        }
    }
    return len(stack) == 0
}`,
      rust: `impl Solution {
    pub fn is_valid(s: String) -> bool {
        let mut stack = Vec::new();
        for c in s.chars() {
            match c {
                '(' => stack.push(')'),
                '{' => stack.push('}'),
                '[' => stack.push(']'),
                ')' | '}' | ']' => {
                    if stack.pop() != Some(c) {
                        return false;
                    }
                }
                _ => {}
            }
        }
        stack.is_empty()
    }
}`,
      php: `<?php

function isValid(string $s): bool {
    $stack = [];
    $map = [')' => '(', '}' => '{', ']' => '['];
    for ($i = 0; $i < strlen($s); $i++) {
        $c = $s[$i];
        if (in_array($c, ['(', '{', '['])) {
            array_push($stack, $c);
        } else {
            if (empty($stack) || array_pop($stack) !== $map[$c]) {
                return false;
            }
        }
    }
    return empty($stack);
}`,
      ruby: `def is_valid(s)
  stack = []
  map = { ')' => '(', '}' => '{', ']' => '[' }
  s.each_char do |c|
    if ['(', '{', '['].include?(c)
      stack.push(c)
    elsif stack.empty? || stack.pop != map[c]
      return false
    end
  end
  stack.empty?
end`,
      swift: `class Solution {
    func isValid(_ s: String) -> Bool {
        var stack = [Character]()
        let map: [Character: Character] = [")": "(", "}": "{", "]": "["]
        for c in s {
            if c == "(" || c == "{" || c == "[" {
                stack.append(c)
            } else if stack.isEmpty || stack.removeLast() != map[c] {
                return false
            }
        }
        return stack.isEmpty
    }
}`,
      kotlin: `import java.util.ArrayDeque

class Solution {
    fun isValid(s: String): Boolean {
        val stack = ArrayDeque<Char>()
        val map = mapOf(')' to '(', '}' to '{', ']' to '[')
        for (c in s) {
            if (c in map.values) {
                stack.push(c)
            } else if (stack.isEmpty() || stack.pop() != map[c]) {
                return false
            }
        }
        return stack.isEmpty()
    }
}`,
      sql: `-- SQL Validation Pattern
SELECT CASE 
    WHEN LENGTH(s) % 2 != 0 THEN FALSE
    ELSE TRUE 
END AS is_potentially_valid
FROM strings;`,
    },
    testCases: [
      {
        id: 1,
        input: { s: "()" },
        expected: true,
        description: "Simple pair",
      },
      {
        id: 2,
        input: { s: "()[]{}" },
        expected: true,
        description: "Multiple sequential brackets",
      },
      {
        id: 3,
        input: { s: "(]" },
        expected: false,
        description: "Mismatched closing bracket",
      },
      {
        id: 4,
        input: { s: "([)]" },
        expected: false,
        description: "Interleaved incorrect ordering",
      },
      {
        id: 5,
        input: { s: "{[]}" },
        expected: true,
        description: "Nested matching brackets",
      },
    ],
  },
  {
    id: "longest-substring-without-repeating",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Sliding Window",
    targetTimeComplexity: "O(n)",
    targetSpaceComplexity: "O(min(m, n))",
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.

A substring is a contiguous non-empty sequence of characters within a string.`,
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces.",
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  let maxLength = 0;
  let left = 0;
  const seen = new Map();
  for (let right = 0; right < s.length; right++) {
    if (seen.has(s[right]) && seen.get(s[right]) >= left) {
      left = seen.get(s[right]) + 1;
    }
    seen.set(s[right], right);
    maxLength = Math.max(maxLength, right - left + 1);
  }
  return maxLength;
}`,
      typescript: `function lengthOfLongestSubstring(s: string): number {
  let maxLength = 0;
  let left = 0;
  const seen = new Map<string, number>();
  for (let right = 0; right < s.length; right++) {
    if (seen.has(s[right]) && seen.get(s[right])! >= left) {
      left = seen.get(s[right])! + 1;
    }
    seen.set(s[right], right);
    maxLength = Math.max(maxLength, right - left + 1);
  }
  return maxLength;
}`,
      python: `def lengthOfLongestSubstring(s: str) -> int:
    seen = {}
    left = 0
    max_len = 0
    for right, char in enumerate(s):
        if char in seen and seen[char] >= left:
            left = seen[char] + 1
        seen[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
      java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        int maxLen = 0, left = 0;
        Map<Character, Integer> seen = new HashMap<>();
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (seen.containsKey(c) && seen.get(c) >= left) {
                left = seen.get(c) + 1;
            }
            seen.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
      cpp: `#include <string>
#include <unordered_map>
#include <algorithm>

class Solution {
public:
    int lengthOfLongestSubstring(std::string s) {
        int maxLen = 0, left = 0;
        std::unordered_map<char, int> seen;
        for (int right = 0; right < s.size(); ++right) {
            char c = s[right];
            if (seen.find(c) != seen.end() && seen[c] >= left) {
                left = seen[c] + 1;
            }
            seen[c] = right;
            maxLen = std::max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};`,
      csharp: `using System;
using System.Collections.Generic;

public class Solution {
    public int LengthOfLongestSubstring(string s) {
        int maxLen = 0, left = 0;
        var seen = new Dictionary<char, int>();
        for (int right = 0; right < s.Length; right++) {
            char c = s[right];
            if (seen.TryGetValue(c, out int prev) && prev >= left) {
                left = prev + 1;
            }
            seen[c] = right;
            maxLen = Math.Max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
      go: `package main

func lengthOfLongestSubstring(s string) int {
    seen := make(map[rune]int)
    left, maxLen := 0, 0
    for right, ch := range s {
        if idx, ok := seen[ch]; ok && idx >= left {
            left = idx + 1
        }
        seen[ch] = right
        if curr := right - left + 1; curr > maxLen {
            maxLen = curr
        }
    }
    return maxLen
}`,
      rust: `use std::collections::HashMap;

impl Solution {
    pub fn length_of_longest_substring(s: String) -> i32 {
        let mut seen = HashMap::new();
        let (mut left, mut max_len) = (0, 0);
        for (right, c) in s.chars().enumerate() {
            if let Some(&idx) = seen.get(&c) {
                if idx >= left {
                    left = idx + 1;
                }
            }
            seen.insert(c, right);
            max_len = max_len.max(right - left + 1);
        }
        max_len as i32
    }
}`,
      php: `<?php

function lengthOfLongestSubstring(string $s): int {
    $seen = [];
    $left = 0;
    $maxLen = 0;
    for ($right = 0; $right < strlen($s); $right++) {
        $c = $s[$right];
        if (isset($seen[$c]) && $seen[$c] >= $left) {
            $left = $seen[$c] + 1;
        }
        $seen[$c] = $right;
        $maxLen = max($maxLen, $right - $left + 1);
    }
    return $maxLen;
}`,
      ruby: `def length_of_longest_substring(s)
  seen = {}
  left = 0
  max_len = 0
  s.each_char.with_index do |c, right|
    left = seen[c] + 1 if seen.key?(c) && seen[c] >= left
    seen[c] = right
    max_len = [max_len, right - left + 1].max
  end
  max_len
end`,
      swift: `class Solution {
    func lengthOfLongestSubstring(_ s: String) -> Int {
        var seen = [Character: Int]()
        var left = 0, maxLen = 0
        for (right, c) in s.enumerated() {
            if let idx = seen[c], idx >= left {
                left = idx + 1
            }
            seen[c] = right
            maxLen = max(maxLen, right - left + 1)
        }
        return maxLen
    }
}`,
      kotlin: `class Solution {
    fun lengthOfLongestSubstring(s: String): Int {
        var left = 0
        var maxLen = 0
        val seen = HashMap<Char, Int>()
        for (right in s.indices) {
            val c = s[right]
            if (seen.containsKey(c) && seen[c]!! >= left) {
                left = seen[c]!! + 1
            }
            seen[c] = right
            maxLen = maxOf(maxLen, right - left + 1)
        }
        return maxLen
    }
}`,
      sql: `-- Window string analysis
SELECT MAX(LENGTH(sub)) AS max_len
FROM candidates;`,
    },
    testCases: [
      {
        id: 1,
        input: { s: "abcabcbb" },
        expected: 3,
        description: "Longest is 'abc' with length 3",
      },
      {
        id: 2,
        input: { s: "bbbbb" },
        expected: 1,
        description: "All repeating characters 'b' with length 1",
      },
      {
        id: 3,
        input: { s: "pwwkew" },
        expected: 3,
        description: "Longest is 'wke' with length 3",
      },
      {
        id: 4,
        input: { s: "" },
        expected: 0,
        description: "Empty string edge case",
      },
      {
        id: 5,
        input: { s: "a b c!a " },
        expected: 6,
        description: "Spaces and punctuation symbols",
      },
    ],
  },
  {
    id: "merge-intervals",
    title: "Merge Overlapping Intervals",
    difficulty: "Medium",
    category: "Intervals & Sorting",
    targetTimeComplexity: "O(n log n)",
    targetSpaceComplexity: "O(n)",
    description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    constraints: [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start_i <= end_i <= 10^4",
    ],
    starterCode: {
      javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    const curr = intervals[i];
    if (curr[0] <= last[1]) {
      last[1] = Math.max(last[1], curr[1]);
    } else {
      result.push(curr);
    }
  }
  return result;
}`,
      typescript: `function merge(intervals: number[][]): number[][] {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const result: number[][] = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    const curr = intervals[i];
    if (curr[0] <= last[1]) {
      last[1] = Math.max(last[1], curr[1]);
    } else {
      result.push(curr);
    }
  }
  return result;
}`,
      python: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    if not intervals:
        return []
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for curr in intervals[1:]:
        last = merged[-1]
        if curr[0] <= last[1]:
            last[1] = max(last[1], curr[1])
        else:
            merged.append(curr)
    return merged`,
      java: `import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

class Solution {
    public int[][] merge(int[][] intervals) {
        if (intervals.length <= 1) return intervals;
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> result = new ArrayList<>();
        int[] curr = intervals[0];
        result.add(curr);
        for (int[] interval : intervals) {
            if (interval[0] <= curr[1]) {
                curr[1] = Math.max(curr[1], interval[1]);
            } else {
                curr = interval;
                result.add(curr);
            }
        }
        return result.toArray(new int[result.size()][]);
    }
}`,
      cpp: `#include <vector>
#include <algorithm>

class Solution {
public:
    std::vector<std::vector<int>> merge(std::vector<std::vector<int>>& intervals) {
        if (intervals.empty()) return {};
        std::sort(intervals.begin(), intervals.end());
        std::vector<std::vector<int>> merged = {intervals[0]};
        for (size_t i = 1; i < intervals.size(); ++i) {
            if (intervals[i][0] <= merged.back()[1]) {
                merged.back()[1] = std::max(merged.back()[1], intervals[i][1]);
            } else {
                merged.push_back(intervals[i]);
            }
        }
        return merged;
    }
};`,
      csharp: `using System;
using System.Collections.Generic;

public class Solution {
    public int[][] Merge(int[][] intervals) {
        if (intervals.Length <= 1) return intervals;
        Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
        var result = new List<int[]>();
        var curr = intervals[0];
        result.Add(curr);
        foreach (var interval in intervals) {
            if (interval[0] <= curr[1]) {
                curr[1] = Math.Max(curr[1], interval[1]);
            } else {
                curr = interval;
                result.Add(curr);
            }
        }
        return result.ToArray();
    }
}`,
      go: `package main

import "sort"

func merge(intervals [][]int) [][]int {
    if len(intervals) <= 1 {
        return intervals
    }
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0]
    })
    res := [][]int{intervals[0]}
    for _, interval := range intervals[1:] {
        last := res[len(res)-1]
        if interval[0] <= last[1] {
            if interval[1] > last[1] {
                last[1] = interval[1]
            }
        } else {
            res = append(res, interval)
        }
    }
    return res
}`,
      rust: `impl Solution {
    pub fn merge(mut intervals: Vec<Vec<i32>>) -> Vec<Vec<i32>> {
        if intervals.is_empty() {
            return vec![];
        }
        intervals.sort_unstable_by_key(|i| i[0]);
        let mut merged: Vec<Vec<i32>> = vec![intervals[0].clone()];
        for interval in intervals.into_iter().skip(1) {
            let last = merged.last_mut().unwrap();
            if interval[0] <= last[1] {
                last[1] = last[1].max(interval[1]);
            } else {
                merged.push(interval);
            }
        }
        merged
    }
}`,
      php: `<?php

function merge(array $intervals): array {
    if (empty($intervals)) return [];
    usort($intervals, fn($a, $b) => $a[0] <=> $b[0]);
    $result = [$intervals[0]];
    foreach (array_slice($intervals, 1) as $curr) {
        $lastIdx = count($result) - 1;
        if ($curr[0] <= $result[$lastIdx][1]) {
            $result[$lastIdx][1] = max($result[$lastIdx][1], $curr[1]);
        } else {
            $result[] = $curr;
        }
    }
    return $result;
}`,
      ruby: `def merge(intervals)
  return [] if intervals.empty?
  sorted = intervals.sort_by(&:first)
  merged = [sorted.first]
  sorted[1..].each do |curr|
    if curr.first <= merged.last.last
      merged.last[1] = [merged.last.last, curr.last].max
    else
      merged << curr
    end
  end
  merged
end`,
      swift: `class Solution {
    func merge(_ intervals: [[Int]]) -> [[Int]] {
        guard intervals.count > 1 else { return intervals }
        let sorted = intervals.sorted { $0[0] < $1[0] }
        var result = [sorted[0]]
        for interval in sorted.dropFirst() {
            var last = result.last!
            if interval[0] <= last[1] {
                result[result.count - 1][1] = max(last[1], interval[1])
            } else {
                result.append(interval)
            }
        }
        return result
    }
}`,
      kotlin: `class Solution {
    fun merge(intervals: Array<IntArray>): Array<IntArray> {
        if (intervals.size <= 1) return intervals
        intervals.sortBy { it[0] }
        val result = mutableListOf<IntArray>()
        var curr = intervals[0]
        result.add(curr)
        for (interval in intervals) {
            if (interval[0] <= curr[1]) {
                curr[1] = maxOf(curr[1], interval[1])
            } else {
                curr = interval
                result.add(curr)
            }
        }
        return result.toTypedArray()
    }
}`,
      sql: `-- Relational interval grouping
SELECT MIN(start_time), MAX(end_time)
FROM events
GROUP BY session_id;`,
    },
    testCases: [
      {
        id: 1,
        input: { intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] },
        expected: [[1, 6], [8, 10], [15, 18]],
        description: "Overlapping intervals at beginning",
      },
      {
        id: 2,
        input: { intervals: [[1, 4], [4, 5]] },
        expected: [[1, 5]],
        description: "Touching boundary intervals",
      },
      {
        id: 3,
        input: { intervals: [[1, 4], [2, 3]] },
        expected: [[1, 4]],
        description: "Completely contained interval",
      },
    ],
  },
];
