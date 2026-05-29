import type { Island } from '@one-piece/db';

import { EMBED_COLORS } from '../../../../../discord/branding.js';
import { buildAssetUrl } from '../../../../../shared/build-asset-url.js';
import type { PassiveGenerator } from '../../../types.js';

import { buildArrivalGenerator } from './build-arrival-generator.js';

// TODO: remplacer par le vrai contenu d'arrivée par île (texte + image)
const TEMPLATE_ARRIVAL = {
  text: `Tu viens d'arrivé sur une île !`,
  imageUrl: 'https://placehold.co/600x400.png?text=Arrival+WIP',
};

export const arrivalByIsland: Record<Island, PassiveGenerator> = {
  satsuruzo: buildArrivalGenerator('satsuruzo', TEMPLATE_ARRIVAL),
  dawn: buildArrivalGenerator('dawn', TEMPLATE_ARRIVAL),
  goat: buildArrivalGenerator('goat', TEMPLATE_ARRIVAL),
  yotsuba: buildArrivalGenerator('yotsuba', TEMPLATE_ARRIVAL),
  mirrorball: buildArrivalGenerator('mirrorball', TEMPLATE_ARRIVAL),
  nagagutsu: buildArrivalGenerator('nagagutsu', TEMPLATE_ARRIVAL),
  organ: buildArrivalGenerator('organ', TEMPLATE_ARRIVAL),
  rare_animal: buildArrivalGenerator('rare_animal', TEMPLATE_ARRIVAL),
  kumate: buildArrivalGenerator('kumate', TEMPLATE_ARRIVAL),
  sixis: buildArrivalGenerator('sixis', TEMPLATE_ARRIVAL),
  tequila_wolf: buildArrivalGenerator('tequila_wolf', TEMPLATE_ARRIVAL),
  gecko: buildArrivalGenerator('gecko', TEMPLATE_ARRIVAL),
  baratie: buildArrivalGenerator('baratie', TEMPLATE_ARRIVAL),
  conomi: buildArrivalGenerator('conomi', TEMPLATE_ARRIVAL),
  cozia: buildArrivalGenerator('cozia', TEMPLATE_ARRIVAL),
  frauce: buildArrivalGenerator('frauce', TEMPLATE_ARRIVAL),
  oykot: buildArrivalGenerator('oykot', TEMPLATE_ARRIVAL),
  pole_star: buildArrivalGenerator('pole_star', TEMPLATE_ARRIVAL),
  reverse_mountain: buildArrivalGenerator('reverse_mountain', TEMPLATE_ARRIVAL),
  whisky_peak: buildArrivalGenerator('whisky_peak', TEMPLATE_ARRIVAL),
  little_garden: buildArrivalGenerator('little_garden', TEMPLATE_ARRIVAL),
  drum: buildArrivalGenerator('drum', TEMPLATE_ARRIVAL),
  alabasta: buildArrivalGenerator('alabasta', TEMPLATE_ARRIVAL),
  wano: buildArrivalGenerator('wano', {
    text: 'Vous êtes arrivés à destination : Le Pays des Wa',
    imageUrl: buildAssetUrl('events/arrival/wano.webp'),
    description: "Les pétales de cerisiers flottent dans l'air, quelle vue magnifique..",
    color: EMBED_COLORS.forest,
  }),
};

export const arrivalGenerators: Array<PassiveGenerator> = Object.values(arrivalByIsland);
