import { ETERNAL_POSE_NAMES } from '@one-piece/db';

import { hasAnyResource, hasCharacterInReserve, hasCharacterInReserveOrCrew, hasCrewSizeAtLeast } from '../predicates.js';
import type { TrialOfWillDefinition } from '../types.js';

export const nicoRobinTrialOfWill: TrialOfWillDefinition = {
  characterTemplateName: 'Nico Robin',
  criteria: [
    {
      condition: hasAnyResource(ETERNAL_POSE_NAMES),
      weight: 50,
      successText: 'Un Eternal Pose... Tu sembles vraiment savoir où tu veux aller.',
      failureText: "Tu n'as même pas de moyen de suivre cette route...",
    },
    {
      condition: hasCharacterInReserve('Monkey D. Luffy (Demalo Black)'),
      weight: 30,
      successText: 'Luffy... Il est avec toi ? Intéressant. Ton équipage est plus particulier que je ne pensais.',
      failureText: 'Je me demande quel genre de personnes composent ton équipage...',
    },
    {
      condition: hasCrewSizeAtLeast(3),
      weight: 10,
      successText: "Un équipage qui a déjà pris de l'ampleur. Vous avez dû vivre des choses ensemble.",
      failureText: 'Si peu de monde à bord... es-tu sûr de pouvoir me protéger ?',
    },
    {
      condition: hasCharacterInReserveOrCrew('Koby'),
      weight: 10,
      successText: "Un marine à bord d'un équipage de pirates... Voilà qui est audacieux.",
      failureText: 'Aucun marine repenti parmi vous, dommage.',
    },
  ],
};
