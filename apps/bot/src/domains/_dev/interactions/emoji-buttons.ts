import type { ButtonHandler } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';

export const EMOJI_BUTTON_NAME = 'emojibtn';

export const emojiButtonHandler: ButtonHandler = {
  name: EMOJI_BUTTON_NAME,
  async handle(interaction, args) {
    const [emoji, name] = args;
    if (!emoji || !name) return;

    const embed = buildOpEmbed().setTitle(name).setDescription(emoji);

    await interaction.reply({ embeds: [embed] });
  },
};
