import type { ButtonInteraction, InteractionEditReplyOptions } from 'discord.js';

/** À utiliser à la place de `interaction.editReply` : purge les pièces jointes du message précédent.
 * Sans ça, Discord les conserve à l'édition et les affiche hors embed dès qu'elles ne sont plus référencées. */
export async function editReply(interaction: ButtonInteraction, options: InteractionEditReplyOptions): Promise<void> {
  await interaction.editReply({ attachments: [], ...options });
}
