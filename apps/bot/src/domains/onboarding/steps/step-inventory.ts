import type { Guild, Transaction } from '@one-piece/db';
import type { EmbedBuilder } from 'discord.js';

import type { Command, View } from '../../../discord/types.js';
import { buildItemObtainedEmbed, buildOpEmbed, getFormattedCommand } from '../../../discord/utils/index.js';
import { inventaireCommand } from '../../resource/commands/inventaire.js';
import * as resourceRepository from '../../resource/repository.js';
import type { OnboardingStep } from '../scenario.js';

export const inventorySteps: ReadonlyArray<OnboardingStep> = [
  { id: 'boat-gifted', type: 'scene', embed: buildBoatGiftedEmbed },
  { id: 'boat-departure', type: 'scene', embed: buildBoatDepartureEmbed },
  { id: 'boat-search-supplies', type: 'scene', embed: buildBoatSearchSuppliesEmbed },
  {
    id: 'inventory-mission',
    type: 'mission',
    expects: 'inventaire',
    command: inventaireCommand,
    run: runInventoryMission,
    reminder: buildInventoryMissionReminder,
  },
];

function buildBoatGiftedEmbed(): EmbedBuilder {
  return buildOpEmbed().setDescription("Quelqu'un te confie ta première barque.");
}

function buildBoatDepartureEmbed(): EmbedBuilder {
  return buildOpEmbed().setDescription('Tu prends la mer.');
}

function buildBoatSearchSuppliesEmbed(): EmbedBuilder {
  return buildOpEmbed().setDescription('Tu fouilles les affaires laissées à bord...');
}

export async function runInventoryMission(playerId: number, tx: Transaction): Promise<View> {
  await resourceRepository.addResource({ playerId, name: 'Canne à pêche', quantity: 1, options: { client: tx } });
  return { embeds: [buildItemObtainedEmbed('Canne à pêche', 1)], components: [] };
}

export function buildInventoryMissionReminder(guild: Guild, command: Command): View {
  return {
    embeds: [
      buildOpEmbed('info')
        .setTitle("Qu'as-tu trouvé ?")
        .setDescription(`Vérifie ce que tu as ramené.\n\n\`${getFormattedCommand(guild, command)}\``),
    ],
    components: [],
  };
}
