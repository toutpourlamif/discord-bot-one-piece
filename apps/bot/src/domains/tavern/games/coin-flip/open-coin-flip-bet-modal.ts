import type { ButtonInteraction } from 'discord.js';

import { buildBetModal } from './views/build-bet-modal.js';

type OpenCoinFlipBetModalParams = { interaction: ButtonInteraction; ownerDiscordId: string; playerId: number };

export async function openCoinFlipBetModal({ interaction, ownerDiscordId, playerId }: OpenCoinFlipBetModalParams): Promise<void> {
  await interaction.showModal(buildBetModal(ownerDiscordId, playerId));
}
