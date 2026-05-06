import type { ShipModuleKey } from '@one-piece/db';
import type { EmbedBuilder, ActionRowBuilder } from 'discord.js';
import { ButtonBuilder, ButtonStyle } from 'discord.js';

import type { View } from '../../../discord/types.js';
import { buildBackAction, buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { formatBerry } from '../../economy/utils/format-berry.js';
import { CONFIRM_SHIP_MODULE_UPGRADE_BUTTON_NAME, UPGRADE_SHIP_BUTTON_NAME } from '../constants.js';
import { SHIP_MODULE_LABELS } from '../modules.js';
import { getShipModuleUpgradePreview } from '../service.js';
import type { ShipModuleUpgradePreview } from '../types.js';

import { buildMaxLevelView } from './build-max-level-view.js';

export async function buildUpgradeModuleView(playerId: number, ownerDiscordId: string, moduleKey: ShipModuleKey): Promise<View> {
  const preview = await getShipModuleUpgradePreview(playerId, moduleKey);
  if (preview === null) {
    return buildMaxLevelView(playerId, ownerDiscordId, moduleKey);
  }

  return {
    embeds: [buildUpgradeModuleEmbed(moduleKey, preview)],
    components: [buildUpgradeModuleActions(playerId, ownerDiscordId, moduleKey, preview)],
  };
}

function buildUpgradeModuleEmbed(moduleKey: ShipModuleKey, preview: ShipModuleUpgradePreview): EmbedBuilder {
  return buildOpEmbed()
    .setTitle(`${SHIP_MODULE_LABELS[moduleKey]} — amélioration`)
    .setDescription(
      [
        `Niveau ${preview.level} → ${preview.nextLevel}`,
        `Bonus : ${preview.currentValue ?? '—'} → ${preview.nextValue ?? '—'}`,
        '',
        // TODO: brancher le check capacity
        '🔒 Capacité requise (à venir)',
        '',
        '**Coût**',
        ...buildCostLines(preview),
      ].join('\n'),
    );
}

function buildCostLines(preview: ShipModuleUpgradePreview): Array<string> {
  const lines: Array<string> = [];

  if (preview.berryCost > 0n) {
    lines.push(`${preview.hasEnoughBerry ? '✅' : '❌'} ${formatBerry(preview.berryCost)} (${formatBerry(preview.ownedBerries)})`);
  }

  for (const resource of preview.resources) {
    lines.push(`${resource.hasEnough ? '✅' : '❌'} ${resource.name} : ${resource.ownedQuantity}/${resource.requiredQuantity}`);
  }

  return lines;
}

function buildUpgradeModuleActions(
  playerId: number,
  ownerDiscordId: string,
  moduleKey: ShipModuleKey,
  preview: ShipModuleUpgradePreview,
): ActionRowBuilder<ButtonBuilder> {
  return buildBackAction(buildCustomId(UPGRADE_SHIP_BUTTON_NAME, ownerDiscordId, playerId)).addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId(CONFIRM_SHIP_MODULE_UPGRADE_BUTTON_NAME, ownerDiscordId, playerId, moduleKey, preview.level))
      .setLabel('Valider')
      .setStyle(ButtonStyle.Success)
      .setDisabled(!preview.canUpgrade),
  );
}
