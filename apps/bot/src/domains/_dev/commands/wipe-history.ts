import type { Player } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { ValidationError } from '../../../discord/errors.js';
import type { Command, CommandContext } from '../../../discord/types.js';
import { buildCancelButton, buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { findGeneratorByHistoryKindOrThrow } from '../../event/generators/registry.js';
import * as historyService from '../../history/services/index.js';
import { resolveTargetPlayer } from '../../player/index.js';
import { CONFIRM_WIPE_ALL_HISTORY_BUTTON_NAME } from '../constants.js';
import { buildWipeHistoryMessage } from '../utils/build-wipe-history-message.js';

const WIPE_HISTORY_USAGE = [
  'Forme: `wipeHistory @joueur? all|last eventKey?`.',
  'Exemples: `wipeHistory all`, `wh all seagullFlyby`, `wipeHistory @joueur last seagullFlyby`.',
].join('\n');

export const wipeHistoryCommand: Command = {
  name: ['wipeHistory', 'wh'],
  async handler(ctx) {
    const { targetPlayer, rest } = await resolveTargetPlayer(ctx);
    const args = parseWipeHistoryArgs(rest);

    if (args.mode === 'all') return handleAllMode(ctx, targetPlayer, args.kind);
    return handleLastMode(ctx, targetPlayer, args.kind);
  },
};

async function handleAllMode(ctx: CommandContext, targetPlayer: Player, kind: string | undefined): Promise<void> {
  await ctx.message.reply({
    embeds: [
      buildOpEmbed('warn')
        .setTitle("Confirmer la suppression de l'history ?")
        .setDescription(buildConfirmWipeAllHistoryMessage(targetPlayer.name, kind)),
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        buildCancelButton(ctx.message.author.id),
        new ButtonBuilder()
          .setCustomId(buildCustomId(CONFIRM_WIPE_ALL_HISTORY_BUTTON_NAME, ctx.message.author.id, targetPlayer.id, kind ?? ''))
          .setLabel('Confirmer')
          .setStyle(ButtonStyle.Danger),
      ),
    ],
  });
}

async function handleLastMode(ctx: CommandContext, targetPlayer: Player, kind: string | undefined): Promise<void> {
  const result = await historyService.wipeHistoryForPlayer({
    targetPlayerId: targetPlayer.id,
    actorPlayerId: ctx.player.id,
    kind,
    mode: 'last',
  });

  await ctx.message.reply({
    embeds: [buildOpEmbed('success').setDescription(buildWipeHistoryMessage(targetPlayer.name, kind, 'last', result))],
  });
}

type ParsedWipeHistoryArgs = {
  kind?: string;
  mode: historyService.WipeHistoryMode;
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

function buildConfirmWipeAllHistoryMessage(playerName: string, kind: string | undefined): string {
  const scope = kind
    ? `**toutes** les lignes \`history\` de ${playerName} pour \`${kind}\``
    : `**tout** l'historique \`history\` de ${playerName}`;
  return `Tu vas supprimer ${scope}.`;
}
