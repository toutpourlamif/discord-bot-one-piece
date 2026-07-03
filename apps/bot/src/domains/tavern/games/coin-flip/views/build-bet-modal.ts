import { LabelBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

import { buildCustomId } from '../../../../../discord/utils/index.js';
import { BET_AMOUNT_FIELD_ID, COIN_FLIP_BET_MODAL_NAME, COIN_SIDE_FIELD_ID, COIN_SIDES } from '../constants.js';

export function buildBetModal(ownerDiscordId: string, playerId: number): ModalBuilder {
  const betAmountLabel = new LabelBuilder()
    .setLabel('Montant de la mise (en berries)')
    .setTextInputComponent(
      new TextInputBuilder().setCustomId(BET_AMOUNT_FIELD_ID).setPlaceholder('500').setStyle(TextInputStyle.Short).setRequired(true),
    );

  const coinSideOptions = Object.entries(COIN_SIDES).map(([side, { label, emoji }]) => ({ label, value: side, emoji }));
  const coinSideLabel = new LabelBuilder()
    .setLabel('Pile ou Face ?')
    .setStringSelectMenuComponent(
      new StringSelectMenuBuilder()
        .setCustomId(COIN_SIDE_FIELD_ID)
        .setPlaceholder('Pile')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(coinSideOptions),
    );

  return new ModalBuilder()
    .setCustomId(buildCustomId(COIN_FLIP_BET_MODAL_NAME, ownerDiscordId, playerId))
    .setTitle('Combien souhaites-tu miser?')
    .addLabelComponents(betAmountLabel, coinSideLabel);
}
