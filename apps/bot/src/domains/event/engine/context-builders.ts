import type { CharacterRow } from '../../character/types.js';
import type { HistoryEntry } from '../../history/repository.js';
import type { GeneratorContext } from '../types.js';

// TODO: renommer le champ `eventType` → `kind` quand history.event_type sera renommé (cf packages/db/src/domains/history/schema.ts)
export type HistoryRow = Pick<HistoryEntry, 'eventType' | 'bucketId'>;

export function buildCrewAccessor(members: Array<CharacterRow>): GeneratorContext['crew'] {
  function find(name: string): CharacterRow | undefined {
    return members.find((m) => m.name === name || m.nickname === name);
  }
  return {
    members,
    has: (name) => find(name) !== undefined,
    getByName: (name) => find(name),
  };
}

export function buildHistoryAccessor(historyLogs: Array<HistoryRow>, getCurrentBucketId: () => number): GeneratorContext['history'] {
  return {
    has: (type) => historyLogs.some((log) => log.eventType === type),
    lastResolutionOf: (prefix) => historyLogs.findLast((log) => log.eventType.startsWith(prefix))?.eventType,
    countSinceNBuckets: (type, nBuckets) => {
      const minBucket = getCurrentBucketId() - nBuckets;
      return historyLogs.filter((log) => log.eventType === type && log.bucketId !== null && log.bucketId > minBucket).length;
    },
  };
}
