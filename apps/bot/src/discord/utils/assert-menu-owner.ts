import type { ButtonInteraction } from 'discord.js';

export async function assertMenuOwner(interaction: ButtonInteraction, ownerDiscordId: string): Promise<boolean> {
  if (interaction.user.id === ownerDiscordId) return true;

  await interaction.reply({
    content: "Ce menu n'est pas pour toi.",
    ephemeral: true,
  });
  return false;
}
