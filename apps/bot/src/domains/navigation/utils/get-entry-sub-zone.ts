import { ISLAND_ENTRY_SUB_ZONE, type SubZone, type Zone } from '@one-piece/db';

import { isSea } from './is-sea.js';

export function getEntrySubZone(zone: Zone): SubZone | null {
  return isSea(zone) ? null : ISLAND_ENTRY_SUB_ZONE[zone];
}
