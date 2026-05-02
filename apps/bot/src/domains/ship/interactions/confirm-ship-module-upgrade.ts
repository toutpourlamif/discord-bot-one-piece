import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertMenuOwner, parseIntegerArg, parseMenuOwnerDiscordId } from '../../../discord/utils/index.js';
import { assertShipPlayerOwner } from '../assert-ship-player-owner.js';
import { CONFIRM_SHIP_MODULE_UPGRADE_BUTTON_NAME } from '../constants.js';
import { parseShipModuleKey } from '../parse-ship-module-key.js';
import { upgradeShipModule } from '../service.js';
import { buildUpgradeModuleView } from '../upgrade-ship-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseMenuOwnerDiscordId(args[0]);
  assertMenuOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);
  const moduleKey = parseShipModuleKey(args[2]);
  const expectedLevel = parseIntegerArg(args[3]);

  await assertShipPlayerOwner(playerId, interaction.user.id);
  await interaction.deferUpdate();
  await upgradeShipModule(playerId, moduleKey, expectedLevel);
  await interaction.editReply(await buildUpgradeModuleView(playerId, ownerDiscordId, moduleKey));
}

export const confirmShipModuleUpgradeButtonHandler: ButtonHandler = {
  name: CONFIRM_SHIP_MODULE_UPGRADE_BUTTON_NAME,
  handle,
};
