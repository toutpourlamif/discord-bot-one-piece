import type { Command } from '../../../discord/types.js';
import { getQuery } from '../../../discord/utils/get-query.js';
import { getTargetUser } from '../../../discord/utils/get-target-user.js';
import { buildOpEmbed } from '../../../discord/utils/index.js';
import { sendDirectMessage } from '../../../discord/utils/send-direct-message.js';

export const dmCommand: Command = {
  name: 'dm',
  async handler(message, args) {
    const target = getTargetUser(message);
    const query = getQuery(args, { emptyMessage: 'Tu dois fournir un message.' });

    const result = await sendDirectMessage({
      client: message.client,
      discordId: target.id,
      view: { embeds: [buildOpEmbed().setDescription(query)], components: [] },
    });

    if (result.delivered) {
      await message.reply(`Message envoyé à ${target.username}.`);
    } else {
      await message.reply(`Impossible d'envoyer un message à ${target.username}.`);
    }
  },
};
