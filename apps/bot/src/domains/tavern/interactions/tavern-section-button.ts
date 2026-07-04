import type { ButtonInteraction } from 'discord.js';

import { NotFoundError } from '../../../discord/errors.js';
import type { ButtonHandler, View } from '../../../discord/types.js';
import {
  assertInteractorIsTheOwner,
  editReply,
  parseIntegerArg,
  parseOwnerDiscordId,
  parseStringArg,
} from '../../../discord/utils/index.js';
import * as playerRepository from '../../player/repository.js';
import { TAVERN_SECTION_BUTTON_NAME } from '../constants.js';
import { getReachableTavern } from '../utils/get-reachable-tavern.js';
import { buildTavernGamesView } from '../views/build-tavern-games-view.js';
import { buildTavernKeeperView } from '../views/build-tavern-keeper-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);
  const section = parseStringArg(args[2], 'Section de taverne manquante.');

  if (section !== 'talk' && section !== 'games') {
    await interaction.reply({ content: '🔜 Bientôt disponible', ephemeral: true });
    return;
  }

  await interaction.deferUpdate();
  const player = await playerRepository.findByIdOrThrow(playerId);
  const tavernConfig = getReachableTavern(player);
  if (!tavernConfig) throw new NotFoundError('Pas de taverne accessible depuis ta position.');

  const view: View =
    section === 'talk'
      ? buildTavernKeeperView({ tavernKeeper: tavernConfig.tavernKeeper, ownerDiscordId, playerId })
      : buildTavernGamesView({ tavernConfig, ownerDiscordId, playerId });

  await editReply(interaction, view);
}

export const tavernSectionButtonHandler: ButtonHandler = {
  name: TAVERN_SECTION_BUTTON_NAME,
  handle,
};
