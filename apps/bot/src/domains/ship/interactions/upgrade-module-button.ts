import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertMenuOwner, parseIntegerArg, parseMenuOwnerDiscordId } from '../../../discord/utils/index.js';
import { buildUpgradeModuleView } from '../build-upgrade-ship-view.js';
import { UPGRADE_SHIP_MODULE_BUTTON_NAME } from '../constants.js';
import { parseShipModuleKey } from '../parse-ship-module-key.js';
import { assertPlayerOwnsShip } from '../utils/index.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseMenuOwnerDiscordId(args[0]);
  assertMenuOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);
  const moduleKey = parseShipModuleKey(args[2]);

  await assertPlayerOwnsShip(playerId, interaction.user.id);
  await interaction.deferUpdate();
  await interaction.editReply(await buildUpgradeModuleView(playerId, ownerDiscordId, moduleKey));
}

export const upgradeShipModuleButtonHandler: ButtonHandler = {
  name: UPGRADE_SHIP_MODULE_BUTTON_NAME,
  handle,
};
