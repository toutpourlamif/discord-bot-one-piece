import type { ButtonHandler } from '../../../discord/types.js';

export const EMOJI_BUTTON_NAME = 'emojibtn';

export const emojiButtonHandler: ButtonHandler = {
  name: EMOJI_BUTTON_NAME,
  async handle(interaction, args) {
    const [emoji, name] = args;
    if (!emoji || !name) return;

    await interaction.reply({
      content: `${emoji} ${name}`,
    });
  },
};
