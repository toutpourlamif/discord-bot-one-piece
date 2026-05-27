import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildCancelButton, buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { findGeneratorByHistoryKindOrThrow } from '../../event/generators/registry.js';
import type { WipeHistoryMode } from '../../history/services/index.js';
import { resolveTargetPlayer } from '../../player/index.js';
import { CONFIRM_WIPE_HISTORY_BUTTON_NAME } from '../constants.js';

const WIPE_HISTORY_USAGE = [
  'Usage : `!wh [@joueur] <all|last> [eventKey]`',
  '',
  '• `!wh all` — vide tout ton historique',
  '• `!wh all seagullFlyby` — vide tout ton historique `seagullFlyby`',
  '• `!wh @rayan last seagullFlyby` — supprime la dernière entrée `seagullFlyby` de @rayan',
].join('\n');

export const wipeHistoryCommand: Command = {
  name: ['wipeHistory', 'wh'],
  async handler(ctx) {
    const { targetPlayer, rest } = await resolveTargetPlayer(ctx);
    const { mode, kind } = parseWipeHistoryArgs(rest);

    const customId = buildCustomId(CONFIRM_WIPE_HISTORY_BUTTON_NAME, ctx.message.author.id, targetPlayer.id, mode, kind ?? '');

    await ctx.message.reply({
      embeds: [
        buildOpEmbed('warn')
          .setTitle("Confirmer la suppression de l'historique ?")
          .setDescription(buildConfirmMessage(targetPlayer.name, mode, kind)),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          buildCancelButton(ctx.message.author.id),
          new ButtonBuilder().setCustomId(customId).setLabel('Confirmer').setStyle(ButtonStyle.Danger),
        ),
      ],
    });
  },
};

type ParsedWipeHistoryArgs = {
  kind?: string;
  mode: WipeHistoryMode;
};

function parseWipeHistoryArgs(args: Array<string>): ParsedWipeHistoryArgs {
  if (args.length === 0 || args.length > 2) throwWipeHistoryUsage();

  const [rawMode, kind] = args;
  if (rawMode !== 'last' && rawMode !== 'all') throwWipeHistoryUsage();

  if (kind) findGeneratorByHistoryKindOrThrow(kind);
  return { mode: rawMode, kind };
}

function throwWipeHistoryUsage(): never {
  throw new ValidationError(WIPE_HISTORY_USAGE);
}

function buildConfirmMessage(playerName: string, mode: WipeHistoryMode, kind: string | undefined): string {
  const kindLabel = kind ? ` \`${kind}\`` : '';
  if (mode === 'last') return `Supprimer la **dernière entrée**${kindLabel} de **${playerName}** ?`;
  const scope = kind ? `\`${kind}\`` : "tout l'historique";
  return `Vider **${scope}** de **${playerName}** ?`;
}
