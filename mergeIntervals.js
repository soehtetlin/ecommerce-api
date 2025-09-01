/**
 * Explanation of the Approach:
 * 
 * The goal is to merge all overlapping intervals from a given array.
 *
 * 1.  **Sort:** The key insight is to first sort the intervals based on their starting points.
 *     This allows us to process them sequentially and
 *     only compare an interval with the most recently merged one.
 *
 * 2.  **Iterate and Merge:** After sorting, we initialize a 'merged' result array with the very first interval. 
 *     We then loop through the remaining intervals.
 *     For each interval, we check if it overlaps with the last interval in 'merged'.
 *       - If it overlaps (current start <= last merged end), we merge them by 
 *         updating the end of the last merged interval to the maximum of the two ends.
 *       - If it does not overlap, we add the current interval as a new, separate 
 *         entry in our 'merged' array.
 *
 * 3.  **Return:** The 'merged' array is the final result.
 *
 * **Time Complexity: O(n log n)**
 * The most time-consuming part of this algorithm is the initial sort, which has 
 * a time complexity of O(n log n), where 'n' is the number of intervals. 
 * The linear scan afterwards is O(n). Thus, the overall complexity is 
 * dominated by the sort: O(n log n).
 *
 * **Space Complexity: O(n)**
 * In the worst-case scenario, where no intervals overlap, the 'mergedIntervals' 
 * array will store all 'n' original intervals. Therefore, the space required 
 * is proportional to the number of intervals, resulting in O(n) space complexity.
 * (Note: Some platforms consider this O(1) or O(log n) if the space for the output
 * is not counted against the algorithm, but O(n) is the safer, more common answer).
 */

/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
const merge = function(intervals) {
  // Edge case: if there are no intervals or only one, no merging is needed.
  if (intervals.length <= 1) {
    return intervals;
  }

  // 1. Sort the intervals based on their start time (the first element in each sub-array).
  intervals.sort((a, b) => a[0] - b[0]);

  // Initialize the result array with the first interval.
  const mergedIntervals = [intervals[0]];

  // 2. Iterate through the rest of the intervals.
  for (let i = 1; i < intervals.length; i++) {
    const currentInterval = intervals[i];
    const lastMergedInterval = mergedIntervals[mergedIntervals.length - 1];

    // 3. Check for overlap.
    if (currentInterval[0] <= lastMergedInterval[1]) {
      // If there is an overlap, merge the intervals by updating the end time of the last merged interval.
      lastMergedInterval[1] = Math.max(lastMergedInterval[1], currentInterval[1]);
    } else {
      // If there is no overlap, add the current interval to the result.
      mergedIntervals.push(currentInterval);
    }
  }

  return mergedIntervals;
};

// Example Usage:
console.log(merge([[1,3],[2,6],[8,10],[15,18]])); // Output: [[1,6],[8,10],[15,18]]
console.log(merge([[1,4],[4,5]]));                   // Output: [[1,5]]