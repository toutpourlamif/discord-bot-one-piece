import type { ButtonInteraction } from 'discord.js';

import { NotFoundError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, parseIntegerArg, parseOwnerDiscordId, parseStringArg } from '../../../discord/utils/index.js';
import { TAVERN_GAME_BUTTON_NAME } from '../constants.js';

import { findTavernGameById } from './registry.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);
  const tavernGameId = parseStringArg(args[2], 'Jeu de taverne manquant.');

  const tavernGame = findTavernGameById(tavernGameId);
  if (!tavernGame) throw new NotFoundError(`Jeu de taverne inconnu: ${tavernGameId}`);

  // Pas de defer ici : le jeu ouvre souvent un modal, qui doit être la première réponse à l'interaction.
  await tavernGame.open({ interaction, ownerDiscordId, playerId });
}

export const openTavernGameButtonHandler: ButtonHandler = {
  name: TAVERN_GAME_BUTTON_NAME,
  handle,
};
