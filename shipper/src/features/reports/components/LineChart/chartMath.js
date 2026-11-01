/** Round tick values from 0 up to the first "nice" step that covers `max`: niceTicks(22000) → [0, 5000 … 25000]. */
export function niceTicks(max, intervals = 5) {
  const rawStep = Math.max(max, 1) / intervals
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rawStep)
  const count = Math.ceil(max / step)
  return Array.from({ length: count + 1 }, (_, index) => index * step)
}

/**
 * Smooth path through `points` ({ x, y }) that never overshoots the data (monotone cubic, Fritsch–Carlson),
 * so a curve cannot dip below a low day or peak above a high one.
 */
export function monotonePath(points) {
  const count = points.length
  if (count === 0) return ''
  if (count === 1) return `M${points[0].x},${points[0].y}`

  const widths = []
  const slopes = []
  for (let i = 0; i < count - 1; i += 1) {
    widths[i] = points[i + 1].x - points[i].x
    slopes[i] = (points[i + 1].y - points[i].y) / widths[i]
  }
  const tangents = [slopes[0]]
  for (let i = 1; i < count - 1; i += 1) {
    tangents[i] = slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2
  }
  tangents[count - 1] = slopes[count - 2]

  for (let i = 0; i < count - 1; i += 1) {
    if (slopes[i] === 0) {
      tangents[i] = 0
      tangents[i + 1] = 0
      continue
    }
    const a = tangents[i] / slopes[i]
    const b = tangents[i + 1] / slopes[i]
    const magnitude = a * a + b * b
    if (magnitude > 9) {
      const scale = 3 / Math.sqrt(magnitude)
      tangents[i] = scale * a * slopes[i]
      tangents[i + 1] = scale * b * slopes[i]
    }
  }

  let path = `M${points[0].x},${points[0].y}`
  for (let i = 0; i < count - 1; i += 1) {
    const third = widths[i] / 3
    path += ` C${points[i].x + third},${points[i].y + tangents[i] * third} ${points[i + 1].x - third},${points[i + 1].y - tangents[i + 1] * third} ${points[i + 1].x},${points[i + 1].y}`
  }
  return path
}

/** Which x-axis labels to print: every day for a short range, otherwise the 5th, 10th … plus the first and last. */
export function axisLabelIndexes(count) {
  if (count <= 10) return Array.from({ length: count }, (_, index) => index)
  const step = count <= 35 ? 5 : Math.ceil(count / 6)
  const indexes = [0]
  for (let index = step - 1; index < count - 1; index += step) indexes.push(index)
  if (count - 1 - indexes[indexes.length - 1] < Math.ceil(step / 2)) indexes.pop()
  indexes.push(count - 1)
  return indexes
}
