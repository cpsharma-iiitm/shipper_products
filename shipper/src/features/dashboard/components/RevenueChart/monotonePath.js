/**
 * SVG path through `points` ([[x, y], …], x ascending) as a monotone cubic curve: smooth, but it never
 * overshoots between samples, so a smoothed revenue line cannot dip below a day's real value.
 */
export function monotonePath(points) {
  const count = points.length
  if (count === 0) return ''
  if (count === 1) return `M${points[0][0]},${points[0][1]}`

  const slopes = points.slice(1).map(([x, y], index) => (y - points[index][1]) / (x - points[index][0]))
  const tangents = points.map((_, index) => {
    if (index === 0) return slopes[0]
    if (index === count - 1) return slopes[count - 2]
    return slopes[index - 1] * slopes[index] <= 0 ? 0 : (slopes[index - 1] + slopes[index]) / 2
  })

  slopes.forEach((slope, index) => {
    if (slope === 0) {
      tangents[index] = 0
      tangents[index + 1] = 0
      return
    }
    const a = tangents[index] / slope
    const b = tangents[index + 1] / slope
    const magnitude = a * a + b * b
    if (magnitude > 9) {
      const scale = 3 / Math.sqrt(magnitude)
      tangents[index] = scale * a * slope
      tangents[index + 1] = scale * b * slope
    }
  })

  return points.slice(1).reduce((path, [x, y], index) => {
    const [fromX, fromY] = points[index]
    const third = (x - fromX) / 3
    return `${path} C${fromX + third},${fromY + tangents[index] * third} ${x - third},${y - tangents[index + 1] * third} ${x},${y}`
  }, `M${points[0][0]},${points[0][1]}`)
}
