import type { DevilFruitTemplateInsert } from './schema.js';

export const DEVIL_FRUIT_TEMPLATES_DATA = [
  {
    name: 'Gomu Gomu no Mi',
    types: ['CAOUTCHOUC'],
    hpBonus: 0,
    combatBonus: 20,
    imageUrl: 'devil-fruits/gomu-gomu-no-mi.webp',
    description:
      "Le Gomu Gomu no Mi est un fruit du démon de type Paramecia qui confère à son utilisateur la capacité de transformer son corps en caoutchouc. Cela lui permet d'étirer, de gonfler et de rebondir de manière élastique, offrant une grande résistance aux attaques physiques et la capacité d'effectuer des mouvements uniques en combat.",
  },
  {
    name: 'Mera Mera no Mi',
    types: ['FEU'],
    hpBonus: 0,
    combatBonus: 25,
    imageUrl: 'devil-fruits/mera-mera-no-mi.webp',
    description:
      "Le Mera Mera no Mi est un fruit du démon de type Logia qui confère à son utilisateur la capacité de créer et de contrôler le feu. Cela lui permet d'attacker avec une grande puissance et de se défendre contre les ennemis.",
  },
  {
    name: 'Hie Hie no Mi',
    types: ['GLACE'],
    hpBonus: 0,
    combatBonus: 25,
    imageUrl: 'devil-fruits/hie-hie-no-mi.webp',
  },
  {
    name: 'Magu Magu no Mi',
    types: ['MAGMA'],
    hpBonus: 0,
    combatBonus: 30,
  },
  {
    name: 'Yami Yami no Mi',
    types: ['TENEBRES'],
    hpBonus: -5,
    combatBonus: 35,
    imageUrl: 'devil-fruits/yami-yami-no-mi.webp',
  },
] as const satisfies ReadonlyArray<DevilFruitTemplateInsert>;

export type DevilFruitName = (typeof DEVIL_FRUIT_TEMPLATES_DATA)[number]['name'];
