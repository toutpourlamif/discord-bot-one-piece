import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { findById } from '../repository.js';
import { buildInfoEmbed, INFO_BUTTON_NAME } from '../ui.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const id = Number(args[0]);
  if (!Number.isInteger(id)) return;

  await interaction.deferReply();

  const fruit = await findById(id);
  if (!fruit) {
    await interaction.editReply({ content: "Ce fruit n'existe plus.", embeds: [], components: [] });
    return;
  }
  await interaction.editReply({ content: '', embeds: [buildInfoEmbed(fruit)], components: [] });
}

export const infoButtonHandler: ButtonHandler = {
  name: INFO_BUTTON_NAME,
  handle,
};
