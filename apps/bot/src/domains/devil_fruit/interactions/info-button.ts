import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { findById } from '../repository.js';
import { buildInfoEmbed, INFO_CUSTOM_ID_PREFIX } from '../ui.js';

async function handle(interaction: ButtonInteraction): Promise<void> {
  const id = Number(interaction.customId.slice(INFO_CUSTOM_ID_PREFIX.length));
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
  customIdPrefix: INFO_CUSTOM_ID_PREFIX,
  handle,
};
