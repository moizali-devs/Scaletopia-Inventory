/** Shared ordering for list/export queries: most recently updated first,
 * with id as a stable tiebreaker (including for null `last_updated`). */
export function sortByLastUpdatedDesc<T extends { last_updated: string | null; id: string }>(
  rows: T[]
): T[] {
  return [...rows].sort((a, b) => {
    const aTime = a.last_updated ? Date.parse(a.last_updated) : -Infinity;
    const bTime = b.last_updated ? Date.parse(b.last_updated) : -Infinity;
    if (bTime !== aTime) return bTime - aTime;
    return a.id.localeCompare(b.id);
  });
}
