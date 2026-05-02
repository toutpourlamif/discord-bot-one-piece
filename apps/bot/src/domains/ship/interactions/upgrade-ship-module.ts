import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertMenuOwner, parseIntegerArg, parseMenuOwnerDiscordId } from '../../../discord/utils/index.js';
import { assertShipPlayerOwner } from '../assert-ship-player-owner.js';
import { UPGRADE_SHIP_MODULE_BUTTON_NAME } from '../constants.js';
import { parseShipModuleKey } from '../parse-ship-module-key.js';
import { buildUpgradeModuleView } from '../upgrade-ship-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseMenuOwnerDiscordId(args[0]);
  assertMenuOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);
  const moduleKey = parseShipModuleKey(args[2]);

  await assertShipPlayerOwner(playerId, interaction.user.id);
  await interaction.deferUpdate();
  await interaction.editReply(await buildUpgradeModuleView(playerId, ownerDiscordId, moduleKey));
}

export const upgradeShipModuleButtonHandler: ButtonHandler = {
  name: UPGRADE_SHIP_MODULE_BUTTON_NAME,
  handle,
};
