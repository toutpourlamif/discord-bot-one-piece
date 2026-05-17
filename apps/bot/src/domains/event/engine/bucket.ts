import type { GeneratorContext } from '../types.js';

const BUCKET_DURATION_MIN = 15;

const BUCKET_DURATION_SEC = BUCKET_DURATION_MIN * 60;

export function getBucketIdFromDate(date: Date): number {
  return Math.floor(date.getTime() / 1000 / BUCKET_DURATION_SEC);
}

export function getNowBucketId(): number {
  return getBucketIdFromDate(new Date());
}

export function getStartDateOfBucket(bucketId: number): Date {
  return new Date(bucketId * BUCKET_DURATION_SEC * 1000);
}

export function getEndDateOfBucket(bucketId: number): Date {
  return new Date((bucketId + 1) * BUCKET_DURATION_SEC * 1000);
}

/** Dernier bucket complet (= courant - 1). Le bucket en cours n'est pas traité tant qu'il n'est pas terminé. */
export function getLatestProcessableBucket(): number {
  return getNowBucketId() - 1;
}

export function bucketsUntilEta(ctx: GeneratorContext): number {
  if (ctx.player.travelEtaBucket === null) return Number.POSITIVE_INFINITY;
  return ctx.player.travelEtaBucket - ctx.bucketId;
}

type Unit = 'm' | 'h' | 'd';
type Duration = `${number}${Unit}`;

const UNIT_TO_MINUTES = { m: 1, h: 60, d: 60 * 24 } as const;
const DURATION_REGEX = /^(?<value>\d+)(?<unit>[mhd])$/;

/** Convertit une durée ("30m", "5h", "2d") en nombre de buckets. Throw si illisible/ne donne pas un nombre de buckets ENTIERS et > 0 */
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
