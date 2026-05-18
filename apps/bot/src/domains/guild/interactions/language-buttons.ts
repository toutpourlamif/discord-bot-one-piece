import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import {
  assertGuildMemberIsAdmin,
  assertInteractorIsTheOwner,
  buildCustomId,
  buildOpEmbed,
  parseOwnerDiscordId,
} from '../../../discord/utils/index.js';
import {
  CANCEL_SET_LANGUAGE_BUTTON_NAME,
  CONFIRM_SET_LANGUAGE_BUTTON_NAME,
  EN_BUTTON_NAME,
  FR_BUTTON_NAME,
  type SupportedLanguage,
} from '../constants.js';

function createHandle(language: SupportedLanguage) {
  return async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
    const ownerDiscordId = parseOwnerDiscordId(args[0]);
    assertInteractorIsTheOwner(interaction, ownerDiscordId);
    assertGuildMemberIsAdmin(interaction.member);
    await interaction.deferUpdate();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(buildCustomId(CONFIRM_SET_LANGUAGE_BUTTON_NAME, interaction.user.id, language))
        .setLabel('Confirmer')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(buildCustomId(CANCEL_SET_LANGUAGE_BUTTON_NAME, interaction.user.id))
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary),
    );
    const embed = buildOpEmbed('warn').setTitle('Es-tu sûr ?');
    await interaction.editReply({ embeds: [embed], components: [row] });
  };
}
export const frButtonHandler: ButtonHandler = {
  name: FR_BUTTON_NAME,
  handle: createHandle('fr'),
};

export const enButtonHandler: ButtonHandler = {
  name: EN_BUTTON_NAME,
  handle: createHandle('en'),
};
