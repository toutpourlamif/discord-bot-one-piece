import { SHIP_MODULE_KEYS, SHIP_MODULE_LEVEL_COLUMNS, type ShipModuleKey } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { View } from '../../discord/types.js';
import { buildCustomId, buildOpEmbed } from '../../discord/utils/index.js';
import { formatBerry } from '../economy/utils/format-berry.js';

import { CONFIRM_SHIP_MODULE_UPGRADE_BUTTON_NAME, UPGRADE_SHIP_BUTTON_NAME, UPGRADE_SHIP_MODULE_BUTTON_NAME } from './constants.js';
import { SHIP_MODULE_LABELS } from './modules.js';
import { findByPlayerIdOrThrow } from './repository.js';
import { getShipModuleUpgradePreview } from './service.js';

export async function buildUpgradeShipView(playerId: number, ownerDiscordId: string): Promise<View> {
  const ship = await findByPlayerIdOrThrow(playerId);

  const embed = buildOpEmbed().setTitle(`⚙️ Améliorer ${ship.name}`).setDescription('Choisis un module à améliorer.');

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    ...SHIP_MODULE_KEYS.map((key) => {
      const level = ship[SHIP_MODULE_LEVEL_COLUMNS[key]];

      return new ButtonBuilder()
        .setCustomId(buildCustomId(UPGRADE_SHIP_MODULE_BUTTON_NAME, ownerDiscordId, playerId, key))
        .setLabel(`${SHIP_MODULE_LABELS[key]} (Lv ${level})`)
        .setStyle(ButtonStyle.Secondary);
    }),
  );

  return { embeds: [embed], components: [row] };
}

export async function buildUpgradeModuleView(playerId: number, ownerDiscordId: string, moduleKey: ShipModuleKey): Promise<View> {
  const preview = await getShipModuleUpgradePreview(playerId, moduleKey);

  const costLines: Array<string> = [];

  if (preview.berryCost > 0n) {
    costLines.push(`${preview.hasEnoughBerry ? '✅' : '❌'} ${formatBerry(preview.berryCost)} (${formatBerry(preview.ownedBerries)})`);
  }

  for (const resource of preview.resources) {
    costLines.push(`${resource.hasEnough ? '✅' : '❌'} ${resource.name} : ${resource.ownedQuantity}/${resource.requiredQuantity}`);
  }

  const embed = buildOpEmbed()
    .setTitle(`${SHIP_MODULE_LABELS[moduleKey]} — amélioration`)
    .setDescription(
      [
        `Niveau ${preview.level} → ${preview.nextLevel}`,
        `Bonus : ${preview.currentValue ?? '—'} → ${preview.nextValue ?? '—'}`,
        '',
        '🔒 Capacité requise (à venir)',
        '',
        '**Coût**',
        ...costLines,
      ].join('\n'),
    );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildCustomId(UPGRADE_SHIP_BUTTON_NAME, ownerDiscordId, playerId))
      .setLabel('← Retour')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(buildCustomId(CONFIRM_SHIP_MODULE_UPGRADE_BUTTON_NAME, ownerDiscordId, playerId, moduleKey, preview.level))
      .setLabel('Valider')
      .setStyle(ButtonStyle.Success)
      .setDisabled(!preview.canUpgrade),
  );

  return { embeds: [embed], components: [row] };
}
