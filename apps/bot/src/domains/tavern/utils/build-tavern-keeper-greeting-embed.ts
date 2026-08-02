import type { TavernKeeper } from '@one-piece/db';
import type { EmbedBuilder } from 'discord.js';
import sample from 'lodash/sample.js';

import { buildDialogueEmbed } from '../../../discord/utils/index.js';

import { buildTavernKeeperDialogueSpeaker } from './build-tavern-keeper-dialogue-speaker.js';

export function buildTavernKeeperGreetingEmbed(tavernKeeper: TavernKeeper): EmbedBuilder {
  const dialogueSpeaker = buildTavernKeeperDialogueSpeaker(tavernKeeper);
  const greetingLine = sample(tavernKeeper.greetingLines)!;
  return buildDialogueEmbed(dialogueSpeaker, greetingLine);
}
