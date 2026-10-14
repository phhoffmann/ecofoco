// Local calendar date, matching the local-midnight window steps are summed over.
// toISOString() would give the UTC date and roll over early west of UTC.
export function localDateKey(d: Date = new Date()): string {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}
