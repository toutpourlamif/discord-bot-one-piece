import { buildCharacterPath } from './build-character-path.js';
import type { CharacterTemplateSeed } from './types.js';

export const ALABASTA_DATA: Array<CharacterTemplateSeed> = [
  {
    name: 'Crocodile',
    hp: 18,
    combat: 24,
    race: 'HUMAN',
    rarity: 'B',
    path: buildCharacterPath('alabasta', 'crocodile'),
    description: "Ancien Grand Corsaire, stratège froid et maître d'Alabasta.",
  },
  {
    name: 'Nico Robin',
    hp: 67,
    combat: 69,
    race: 'HUMAN',
    rarity: 'A',
    path: buildCharacterPath('alabasta', 'nico-robin'),
    description: 'Archéologue de renom capable de déchiffrer les Ponéglyphes avec aise',
  },
  {
    name: 'Portgas D. Ace',
    hp: 22,
    combat: 26,
    race: 'HUMAN',
    rarity: 'A',
    skills: ['CONQUERORS_HAKI'],
    path: buildCharacterPath('alabasta', 'portgas-d-ace'),
    devilFruitName: 'Mera Mera no Mi',
    description: 'Commandant de la 2e flotte de Barbe Blanche, frère de Luffy et fils du légendaire Gol D. Roger.',
  },
];
