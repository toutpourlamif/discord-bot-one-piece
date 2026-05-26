import type { Player } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { ValidationError } from '../../../discord/errors.js';
import type { Command, CommandContext } from '../../../discord/types.js';
import { buildCancelButton, buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { findGeneratorByHistoryKindOrThrow } from '../../event/generators/registry.js';
import { wipeHistoryForPlayer } from '../../history/index.js';
import type { WipeHistoryMode } from '../../history/index.js';
import { findOrCreatePlayer } from '../../player/index.js';
import { CONFIRM_WIPE_HISTORY_BUTTON_NAME } from '../constants.js';
import { buildWipeHistoryMessage } from '../utils/build-wipe-history-message.js';

const USER_MENTION_REGEX = /^<@!?(\d+)>$/;

export const wipeHistoryCommand: Command = {
  name: ['wipeHistory', 'wipe-history', 'resetHistory', 'reset-history', 'rh'],
  async handler(ctx) {
    const { targetPlayer, rest } = await resolveWipeHistoryTargetPlayer(ctx);
    const { kind, mode } = parseWipeHistoryArgs(rest);
    if (mode === 'all') {
      await ctx.message.reply({
        embeds: [
          buildOpEmbed('warn')
            .setTitle("Confirmer la suppression de l'history ?")
            .setDescription(buildConfirmWipeHistoryMessage(targetPlayer.name, kind)),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            buildCancelButton(ctx.message.author.id),
            new ButtonBuilder()
              .setCustomId(buildCustomId(CONFIRM_WIPE_HISTORY_BUTTON_NAME, ctx.message.author.id, targetPlayer.id, ...(kind ? [kind] : [])))
              .setLabel('Confirmer')
              .setStyle(ButtonStyle.Danger),
          ),
        ],
      });
      return;
    }

    const result = await wipeHistoryForPlayer({
      targetPlayerId: targetPlayer.id,
      actorPlayerId: ctx.player.id,
      kind,
      mode,
    });

    await ctx.message.reply({
      embeds: [buildOpEmbed('success').setDescription(buildWipeHistoryMessage(targetPlayer.name, kind, mode, result))],
    });
  },
};

async function resolveWipeHistoryTargetPlayer(ctx: CommandContext): Promise<{ targetPlayer: Player; rest: Array<string> }> {
  const [firstArg, ...rest] = ctx.args;
  if (!firstArg) return { targetPlayer: ctx.player, rest: ctx.args };

  const mentionMatch = USER_MENTION_REGEX.exec(firstArg);
  if (!mentionMatch) {
    if (firstArg.startsWith('@')) {
      throw new ValidationError('Mention joueur invalide. Utilise une vraie mention Discord, pas du texte tapé à la main.');
    }

    return { targetPlayer: ctx.player, rest: ctx.args };
  }

  const mentionedDiscordId = mentionMatch[1];
  if (!mentionedDiscordId) {
    throw new ValidationError('Mention joueur invalide.');
  }

  const mentioned = ctx.message.mentions.users.get(mentionedDiscordId);
  if (!mentioned) {
    throw new ValidationError('Mention joueur introuvable.');
  }

  const { player } = await findOrCreatePlayer(mentioned.id, mentioned.username, ctx.guild.id);
  return { targetPlayer: player, rest };
}

function buildConfirmWipeHistoryMessage(playerName: string, kind: string | undefined): string {
  if (!kind) {
    return `Tu vas supprimer **tout** l'historique \`history\` de ${playerName}.`;
  }

  return `Tu vas supprimer **toutes** les lignes \`history\` de ${playerName} pour \`${kind}\`.`;
}

function parseWipeHistoryMode(raw: string | undefined): WipeHistoryMode {
  if (raw === undefined) return 'last';
  if (raw === 'last' || raw === 'all') return raw;

  throw new ValidationError('Mode invalide. Utilise `last` ou `all`.');
}

type ParsedWipeHistoryArgs = {
  kind?: string;
  mode: WipeHistoryMode;
};

function parseWipeHistoryArgs(args: Array<string>): ParsedWipeHistoryArgs {
  if (args.length === 0) {
    throw new ValidationError('Tu dois fournir un type de log ou `all`. Exemple: `wipeHistory @joueur seagullFlyby last`.');
  }

  if (args.length > 2) {
    throw new ValidationError(
      "Trop d'arguments. Exemples: `wipeHistory all`, `wipeHistory @joueur all`, `wipeHistory @joueur seagullFlyby all`.",
    );
  }

  const [kindOrAll, rawMode] = args;
  if (kindOrAll === 'all') {
    if (rawMode !== undefined) {
      throw new ValidationError("Pour supprimer tout l'historique, utilise seulement `all`.");
    }

    return { mode: 'all' };
  }

  if (!kindOrAll) {
    throw new ValidationError('Tu dois fournir un type de log ou `all`.');
  }

  findGeneratorByHistoryKindOrThrow(kindOrAll);
  return { kind: kindOrAll, mode: parseWipeHistoryMode(rawMode) };
}
