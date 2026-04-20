import { Client, Events, GatewayIntentBits } from 'discord.js';

import { findOrCreatePlayer } from './domains/player/index.js';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('DISCORD_TOKEN manquant dans apps/bot/.env.local');
}

const prefix = process.env.COMMAND_PREFIX;
if (!prefix) {
  throw new Error('COMMAND_PREFIX manquant dans apps/bot/.env.local');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Bot connecté : ${c.user.tag}`);
});

// TODO: supprimer, c'est pour test
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  const content = message.content.trim();
  if (!content.startsWith(prefix)) return;
  const command = content.slice(prefix.length).trim().toLowerCase();
  if (command === 'one piece') {
    await message.reply('hello world');
  }
  // TODO: supprimer en prod
  if (command === 'debug') {
    const { player, created } = await findOrCreatePlayer(
      message.author.id,
      message.author.username,
    );
    await message.reply(
      `${created ? '🆕 Player créé' : '✅ Player existant'}\n\`\`\`json\n${JSON.stringify(player, null, 2)}\n\`\`\``,
    );
  }
});

await client.login(token);
