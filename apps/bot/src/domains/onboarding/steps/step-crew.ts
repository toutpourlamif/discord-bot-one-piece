import type { Transaction } from '@one-piece/db';
import type { EmbedBuilder } from 'discord.js';

import { InternalError } from '../../../discord/errors.js';
import type { View } from '../../../discord/types.js';
import { buildDialogueEmbed, buildOpEmbed, type DialogueSpeaker } from '../../../discord/utils/index.js';
import { buildAssetUrl } from '../../../shared/build-asset-url.js';
import * as characterRepository from '../../character/repository.js';
import * as crewRepository from '../../crew/repository.js';
import type { OnboardingStep } from '../scenario.js';

const KOBY: DialogueSpeaker = { name: 'Koby', path: 'characters/marines/koby-young', emotions: ['happy', 'crying', 'scared'] };

export const crewSteps: ReadonlyArray<OnboardingStep> = [
  { id: 'crew-koby-encounter', type: 'scene', embed: buildCrewKobyEncounterEmbed },
  { id: 'crew-koby-offer', type: 'scene', embed: buildCrewKobyOfferEmbed },
  { id: 'crew-mission', type: 'mission', expects: 'crew', run: runCrewMission, reminder: buildCrewMissionReminder },
];

function buildCrewKobyEncounterEmbed(): EmbedBuilder {
  return buildOpEmbed()
    .setDescription('Sur ton chemin, tu croises un jeune marine visiblement paumé.')
    .setImage(buildAssetUrl(`${KOBY.path}/dialogue-scared.webp`));
}

function buildCrewKobyOfferEmbed(): EmbedBuilder {
  return buildDialogueEmbed(KOBY, "S'il te plaît... je n'ai nulle part où aller. Tu voudrais bien de moi à bord ?", { emotion: 'scared' });
}

// TODO: mécanique de recrutement réelle (dressage) — pour l'instant on ajoute Koby directement au crew.
export async function runCrewMission(playerId: number, tx: Transaction): Promise<View> {
  const template = await characterRepository.findTemplateByName('Koby', tx);
  if (!template) throw new InternalError('Template "Koby" introuvable — vérifie CHARACTER_TEMPLATES_DATA.');
  const instance = await characterRepository.createCharacterInstance(playerId, template.id, tx);
  await crewRepository.setCharacterJoinedAt(instance.instanceId, new Date(), tx);
  return {
    embeds: [buildOpEmbed('success').setTitle('Koby rejoint ton équipage.').setDescription('Un premier compagnon de route.')],
    components: [],
  };
}

export function buildCrewMissionReminder(prefix: string, expects: string): View {
  return {
    embeds: [
      buildOpEmbed('info')
        .setTitle("Koby te regarde, plein d'espoir.")
        .setDescription(`Tape \`${prefix}${expects}\` pour l'accueillir à bord.`),
    ],
    components: [],
  };
}
