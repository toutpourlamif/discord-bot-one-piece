import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';

import { ForbiddenError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { CANCEL_SET_PREFIX_BUTTON_NAME, CONFIRM_SET_PREFIX_BUTTON_NAME } from '../constants.js';
import { encodeGuildPrefix, parseGuildPrefixArg } from '../service.js';

export const setPrefixCommand: Command = {
  name: 'setprefix',
  async handler({ message, args, guild }) {
    if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
      throw new ForbiddenError('Cette commande est réservée aux admins du serveur.');
    }

    const prefix = parseGuildPrefixArg(args);
    const encodedPrefix = encodeGuildPrefix(prefix);

    const embed = buildOpEmbed('warn')
      .setTitle('Changer le préfixe ?')
      .setDescription(`Es-tu sûr de vouloir changer le préfixe de \`${guild.prefix}\` en \`${prefix}\` ?`);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(buildCustomId(CONFIRM_SET_PREFIX_BUTTON_NAME, message.author.id, encodedPrefix))
        .setLabel('Confirmer')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(buildCustomId(CANCEL_SET_PREFIX_BUTTON_NAME, message.author.id))
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary),
    );

    await message.reply({ embeds: [embed], components: [row] });
  },
};
