import { SHIP_MODULE_LEVEL_COLUMNS } from '@one-piece/db';
import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { assertInteractorIsTheOwner, parseIntegerArg, parseOwnerDiscordId } from '../../../discord/utils/index.js';
import { CONFIRM_SHIP_MODULE_UPGRADE_BUTTON_NAME } from '../constants.js';
import { SHIP_MODULE_LABELS } from '../modules.js';
import { upgradeShipModule } from '../service.js';
import { parseShipModuleKey } from '../utils/index.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);
  const moduleKey = parseShipModuleKey(args[2]);
  const expectedUpgradeLevel = parseIntegerArg(args[3]);

  await interaction.deferUpdate();
  const upgradedShip = await upgradeShipModule(playerId, moduleKey, expectedUpgradeLevel);
  const upgradedLevel = upgradedShip[SHIP_MODULE_LEVEL_COLUMNS[moduleKey]];

  const embed = buildOpEmbed('success')
    .setTitle('Module amélioré !')
    .setDescription(`**${SHIP_MODULE_LABELS[moduleKey]}** est maintenant niveau ${upgradedLevel}.`);

  await interaction.editReply({ embeds: [embed], components: [] });
}

export const confirmShipModuleUpgradeButtonHandler: ButtonHandler = {
  name: CONFIRM_SHIP_MODULE_UPGRADE_BUTTON_NAME,
  handle,
};
