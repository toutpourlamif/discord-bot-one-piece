import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, parseIntegerArg, parseOwnerDiscordId } from '../../../discord/utils/index.js';
import { UPGRADE_SHIP_BUTTON_NAME } from '../constants.js';
import { assertPlayerOwnsShip } from '../utils/index.js';
import { buildUpgradeShipView } from '../views/build-upgrade-ship-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);

  await assertPlayerOwnsShip(playerId, interaction.user.id);
  await interaction.deferUpdate();
  await interaction.editReply(await buildUpgradeShipView(playerId, ownerDiscordId));
}

export const upgradeShipButtonHandler: ButtonHandler = {
  name: UPGRADE_SHIP_BUTTON_NAME,
  handle,
};
