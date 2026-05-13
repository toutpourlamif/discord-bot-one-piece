import type { Player, Ship, Zone } from '@one-piece/db';

import type { Inventory } from '../../resource/types.js';
import type { GeneratorContext, InteractiveGenerator } from '../types.js';

// Besoin de créer un faux contexte sinon certaines fonctions s'éxecutent pas
const fakeCtx: GeneratorContext = {
  player: {} as Player,
  crew: {
    members: [],
    has: () => false,
    getByName: () => undefined,
  },
  ship: {} as Ship,
  inventory: [] as Inventory,
  history: {
    has: () => false,
    lastResolutionOf: () => undefined,
    countSinceNBuckets: () => 0,
  },
  bucketId: 0,
  zone: 'sea_east_blue' as Zone,
  othersInZone: [],
};

/** Parcours chaque générateur interactif et valide que chaque goTo mène à un step qui existe réellement */
export function validateGeneratorsPaths(generators: Array<InteractiveGenerator>): void {
  for (const gen of generators) {
    const stepNames = Object.keys(gen.steps);
    for (const [stepName, step] of Object.entries(gen.steps)) {
      for (const choice of step.choices({}, fakeCtx)) {
        if ('goTo' in choice && !stepNames.includes(choice.goTo)) {
          throw new Error(`Generator ${gen.key}, step ${stepName}, choice ${choice.id}: goTo '${choice.goTo}' n'existe pas`);
        }
      }
    }
  }
}
