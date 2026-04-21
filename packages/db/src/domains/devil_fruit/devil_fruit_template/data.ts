import type { DevilFruitTemplateInsert } from './schema.js';

export const DEVIL_FRUIT_TEMPLATES_DATA: Array<DevilFruitTemplateInsert> = [
  {
    name: 'Gomu Gomu no Mi',
    types: ['CAOUTCHOUC'],
    hpBonus: 0,
    combatBonus: 20,
    imageUrl: 'devil-fruits/gomu-gomu-no-mi.webp',
  },
  {
    name: 'Mera Mera no Mi',
    types: ['FEU'],
    hpBonus: 0,
    combatBonus: 25,
    imageUrl: 'devil-fruits/mera-mera-no-mi.webp',
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
];
