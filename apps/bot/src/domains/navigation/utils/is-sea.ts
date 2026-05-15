import type { Zone, Sea } from '@one-piece/db';
import { SEAS } from '@one-piece/db';

export function isSea(zone: Zone): zone is Sea {
  return (SEAS as ReadonlyArray<Zone>).includes(zone);
}
