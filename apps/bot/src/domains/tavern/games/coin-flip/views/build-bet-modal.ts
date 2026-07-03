import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

import { buildCustomId } from '../../../../../discord/utils/index.js';
import { BET_AMOUNT_FIELD_ID, COIN_FLIP_BET_MODAL_NAME } from '../constants.js';

export function buildBetModal(ownerDiscordId: string, playerId: number): ModalBuilder {
  const betAmountInput = new TextInputBuilder()
    .setCustomId(BET_AMOUNT_FIELD_ID)
    .setLabel('Montant de la mise (en berries)')
    .setPlaceholder('Exemple : 500')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const betAmountRow = new ActionRowBuilder<TextInputBuilder>().addComponents(betAmountInput);

  return new ModalBuilder()
    .setCustomId(buildCustomId(COIN_FLIP_BET_MODAL_NAME, ownerDiscordId, playerId))
    .setTitle('Combien souhaites-tu miser?')
    .addComponents(betAmountRow);
}
