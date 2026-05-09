import { SEAS, type Sea, type Zone } from '@one-piece/db';

export function computeNothing() {
  return { effects: [], state: {} };
}

export function isSea(zone: Zone): zone is Sea {
  return (SEAS as ReadonlyArray<Zone>).includes(zone);
}
