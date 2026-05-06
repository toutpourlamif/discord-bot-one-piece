import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, parseIntegerArg, parseOwnerDiscordId } from '../../../discord/utils/index.js';
import { UPGRADE_SHIP_MODULE_BUTTON_NAME } from '../constants.js';
import { parseShipModuleKey } from '../utils/index.js';
import { buildUpgradeModuleView } from '../views/index.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);
  const moduleKey = parseShipModuleKey(args[2]);

  await interaction.deferUpdate();
  await interaction.editReply(await buildUpgradeModuleView(playerId, ownerDiscordId, moduleKey));
}

export const upgradeShipModuleButtonHandler: ButtonHandler = {
  name: UPGRADE_SHIP_MODULE_BUTTON_NAME,
  handle,
};
