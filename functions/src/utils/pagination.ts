/**
 * Returns the total number of pages based on the total number of entries and the number of entries per page.
 */
export function getTotalPages(
  totalEntries: number,
  entriesPerPage: number
): number {
  return Math.ceil(totalEntries / entriesPerPage);
}
