export function getNormalizedGlobeScale(
  dimensions: [number, number, number],
  targetLargestDimension: number,
) {
  const largestDimension = Math.max(...dimensions)

  if (largestDimension <= 0) {
    return 1
  }

  return targetLargestDimension / largestDimension
}
