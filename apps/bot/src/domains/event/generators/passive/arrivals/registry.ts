import type { Island } from '@one-piece/db';

import type { PassiveGenerator } from '../../../types.js';

import { buildArrivalGenerator } from './build-arrival-generator.js';

// TODO: remplacer par le vrai contenu d'arrivée par île (texte + image)
const TEMPLATE_ARRIVAL = {
  text: `Tu viens d'arrivé sur une île !`,
  imageUrl: 'https://placehold.co/600x400.png?text=Arrival+WIP',
};

export const arrivalByIsland: Record<Island, PassiveGenerator> = {
  foosha: buildArrivalGenerator('foosha', TEMPLATE_ARRIVAL),
  loguetown: buildArrivalGenerator('loguetown', TEMPLATE_ARRIVAL),
  reverse_mountain: buildArrivalGenerator('reverse_mountain', TEMPLATE_ARRIVAL),
  whisky_peak: buildArrivalGenerator('whisky_peak', TEMPLATE_ARRIVAL),
  little_garden: buildArrivalGenerator('little_garden', TEMPLATE_ARRIVAL),
  drum: buildArrivalGenerator('drum', TEMPLATE_ARRIVAL),
  alabasta: buildArrivalGenerator('alabasta', TEMPLATE_ARRIVAL),
};

export const arrivalGenerators: Array<PassiveGenerator> = Object.values(arrivalByIsland);
