import type { TavernConfig } from '../../../tavern/types.js';

export function defineIsland<
  const Key extends string,
  const SubZones extends Record<string, string>,
  const Entry extends keyof SubZones,
>(island: { key: Key; name: string; subZones: SubZones; entrySubZone: Entry; tavern?: TavernConfig }) {
  return island;
}
