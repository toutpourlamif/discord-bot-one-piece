import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { buildDevilFruitInfoEmbed } from '../build-info-embed.js';
import { findById } from '../repository.js';
import { INFO_BUTTON_NAME } from '../ui.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const id = Number(args[0]);
  // TODO: Ajouter un helper qui valide les identifiants
  if (!Number.isInteger(id)) return;

  await interaction.deferReply();

  const fruit = await findById(id);
  if (!fruit) {
    await interaction.editReply({ content: "Ce fruit n'existe plus.", embeds: [], components: [] });
    return;
  }
  await interaction.editReply({ content: '', embeds: [buildDevilFruitInfoEmbed(fruit)], components: [] });
}

export const infoButtonHandler: ButtonHandler = {
  name: INFO_BUTTON_NAME,
  handle,
};
