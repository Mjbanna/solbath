// Mirror of normalize() in the frontend's src/lib/utils.ts (the CMS can't import
// across its rootDir). The category page matches filter options with it, so
// scripts/import-tiles.ts uses the same function to reject clashing options.
// Keep the two in sync.
export function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
