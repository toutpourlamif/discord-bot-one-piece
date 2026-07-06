import type { DevilFruitTemplateInsert } from './schema.js';

// TODO: faire pointer vers un dossier, pas une url (car mnt on utilise des dossiers)
function buildDevilFruitImageUrl(slug: string): string {
  return `devil-fruits/${slug}/info.webp`;
}

export const DEVIL_FRUIT_TEMPLATES_DATA = [
  {
    name: 'Gomu Gomu no Mi',
    types: [],
    hpBonus: 0,
    combatBonus: 20,
    imageUrl: 'devil-fruits/gomu-gomu-no-mi.webp',
    description:
      "Le Gomu Gomu no Mi est un fruit du démon de type Paramecia qui confère à son utilisateur la capacité de transformer son corps en caoutchouc. Cela lui permet d'étirer, de gonfler et de rebondir de manière élastique, offrant une grande résistance aux attaques physiques et la capacité d'effectuer des mouvements uniques en combat.",
  },
  {
    name: 'Mera Mera no Mi',
    types: ['FIRE'],
    hpBonus: 0,
    combatBonus: 25,
    imageUrl: buildDevilFruitImageUrl('mera'),
    description:
      "Le Mera Mera no Mi est un fruit du démon de type Logia qui confère à son utilisateur la capacité de créer et de contrôler le feu. Cela lui permet d'attacker avec une grande puissance et de se défendre contre les ennemis.",
  },
  {
    name: 'Hie Hie no Mi',
    types: ['ICE'],
    hpBonus: 0,
    combatBonus: 25,
    imageUrl: 'devil-fruits/hie-hie-no-mi.webp',
  },
  {
    name: 'Magu Magu no Mi',
    types: [],
    hpBonus: 0,
    combatBonus: 30,
  },
  {
    name: 'Yami Yami no Mi',
    types: ['DARK'],
    hpBonus: -5,
    combatBonus: 35,
    imageUrl: buildDevilFruitImageUrl('yami'),
    description:
      "Le Yami Yami no Mi est un fruit du démon de type Logia qui permet à son utilisateur de manipuler les ténèbres. Il peut absorber tout ce qui l'entoure, attaques comme matière, et annuler les pouvoirs des autres fruits du démon par simple contact — au prix d'une vulnérabilité accrue aux dégâts qu'il subit.",
  },
  {
    name: 'Jiki Jiki no Mi',
    types: ['STEEL', 'ELECTRIC'],
    hpBonus: 0,
    combatBonus: 28,
    imageUrl: buildDevilFruitImageUrl('jiki'),
    description:
      'Le Jiki Jiki no Mi est un fruit du démon de type Paramecia qui confère à son utilisateur le contrôle du magnétisme. Il peut attirer ou repousser tout métal sur de longues distances, assemblant des amas de ferraille en armes massives ou détournant les projectiles ennemis.',
  },
  {
    name: 'Ope Ope no Mi',
    types: ['PSYCHIC'],
    hpBonus: 10,
    combatBonus: 30,
    imageUrl: buildDevilFruitImageUrl('ope'),
    description:
      "Le Ope Ope no Mi est un fruit du démon de type Paramecia, surnommé le fruit ultime. Il permet de créer une « Room », un espace sphérique dans lequel l'utilisateur manipule à sa guise tout ce qui s'y trouve : trancher, déplacer, échanger ou opérer sans causer de blessure mortelle.",
  },
  // TODO: ajouter assets/devil-fruits/sube/info.webp.
  {
    name: 'Sube Sube no Mi',
    types: [],
    hpBonus: 0,
    combatBonus: 8,
    imageUrl: buildDevilFruitImageUrl('sube'),
    description:
      "Le Sube Sube no Mi est un fruit du démon de type Paramecia qui rend la peau de son utilisateur parfaitement lisse. Tout glisse dessus sans y laisser de prise : coups, projectiles, et même les sentiments d'autrui.",
  },
] as const satisfies ReadonlyArray<DevilFruitTemplateInsert>;

export type DevilFruitName = (typeof DEVIL_FRUIT_TEMPLATES_DATA)[number]['name'];
