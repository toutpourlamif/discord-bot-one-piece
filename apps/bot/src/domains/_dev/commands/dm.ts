import type { Command } from '../../../discord/types.js';
import { getQuery } from '../../../discord/utils/get-query.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { resolveTargetUser } from '../../../discord/utils/resolve-target-user.js';
import { sendDirectMessage } from '../../../discord/utils/send-direct-message.js';

export const dmCommand: Command = {
  name: 'dm',
  async handler({ message, args }) {
    const target = resolveTargetUser(message);
    const queryArgs = message.mentions.users.first() ? args.slice(1) : args;
    const query = getQuery(queryArgs, { emptyMessage: 'Tu dois fournir un message.', minLength: 3 });

    const result = await sendDirectMessage({
      client: message.client,
      discordId: target.id,
      view: { embeds: [buildOpEmbed().setDescription(query)], components: [] },
    });

    if (result.delivered) {
      const embed = buildOpEmbed().setDescription(`Message envoyé à ${target.username}.`);
      await message.reply({ embeds: [embed] });
    } else {
      const embed = buildOpEmbed().setDescription(`Impossible d'envoyer un message à ${target.username}.`);
      await message.reply({ embeds: [embed] });
    }
  },
};
