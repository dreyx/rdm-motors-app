export function formatMileage(mileage: number): string {
  // Round to nearest thousand and display as "149,XXX" format
  const thousands = Math.floor(mileage / 1000)
  return `${thousands.toLocaleString()},XXX`
}
