// Duplicata de apps/bot/src/domains/event/engine/bucket.ts — packages/db ne peut pas importer apps/bot
// (dépendance inverse). À factoriser dans un @one-piece/core le jour où on a d'autres utils à partager.

const BUCKET_DURATION_MIN = 15;

type Unit = 'm' | 'h' | 'd';
type Duration = `${number}${Unit}`;

const UNIT_TO_MINUTES = { m: 1, h: 60, d: 60 * 24 } as const;
const DURATION_REGEX = /^(?<value>\d+)(?<unit>[mhd])$/;

export function inBuckets(duration: Duration): number {
  const match = DURATION_REGEX.exec(duration);
  if (!match) throw new Error(`Durée invalide: "${duration}"`);
  const { value, unit } = match.groups as { value: string; unit: Unit };
  const minutes = Number(value) * UNIT_TO_MINUTES[unit];
  if (minutes === 0 || minutes % BUCKET_DURATION_MIN !== 0) {
    throw new Error(`"${duration}" ne fait pas un nombre entier de buckets`);
  }
  return minutes / BUCKET_DURATION_MIN;
}
