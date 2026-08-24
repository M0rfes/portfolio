export function uniqueSortedTags(
  groups: Iterable<readonly string[]>,
): string[] {
  const tags = new Set<string>();
  for (const group of groups) {
    for (const tag of group) {
      const value = tag.trim();
      if (value) tags.add(value);
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}
