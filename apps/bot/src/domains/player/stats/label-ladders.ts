import type { PlayerStatKey } from '@one-piece/db';

type StatLabelLadder = {
  negative: Array<string>;
  positive: Array<string>;
};

export const STAT_LABEL_LADDERS: Record<PlayerStatKey, StatLabelLadder> = {
  karma: {
    negative: ['Suspect', 'Infâme', 'Tyrannique', 'Maudit', 'Démoniaque'],
    positive: ['Juste', 'Loyal', 'Honorable', 'Noble', 'Héroïque'],
  },
  intelligence: {
    negative: ['Distrait', 'Naïf', 'Étourdi', 'Borné', 'Insensé'],
    positive: ['Astucieux', 'Avisé', 'Perspicace', 'Brillant', 'Génial'],
  },
  charisme: {
    negative: ['Effacé', 'Maladroit', 'Agaçant', 'Repoussant', 'Détesté'],
    positive: ['Sympathique', 'Charismatique', 'Captivant', 'Admiré', 'Légendaire'],
  },
  gentillesse: {
    negative: ['Froid', 'Distant', 'Dur', 'Impitoyable', 'Cruel'],
    positive: ['Aimable', 'Généreux', 'Bienveillant', 'Dévoué', 'Altruiste'],
  },
  audace: {
    negative: ['Hésitant', 'Timide', 'Craintif', 'Peureux', 'Lâche'],
    positive: ['Assuré', 'Hardi', 'Intrépide', 'Casse-cou', 'Téméraire'],
  },
};
