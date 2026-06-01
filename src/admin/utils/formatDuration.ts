/**
 * Format milliseconds to human-readable duration.
 * Returns "Xh Ym" for hours >= 1, otherwise "Ym".
 */
export function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000)
  const hours = Math.floor(mins / 60)
  return hours > 0 ? `${hours}h ${mins % 60}m` : `${mins}m`
}
