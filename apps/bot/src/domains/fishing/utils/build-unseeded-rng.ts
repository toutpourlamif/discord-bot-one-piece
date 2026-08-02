import type { Rng } from '../../event/types.js';

/** Rng non-seedé (vrai `Math.random`) — la pêche est une action à la demande, pas rejouée, donc pas besoin de déterminisme par seed. */
export function buildUnseededRng(): Rng {
  return { next: Math.random };
}
