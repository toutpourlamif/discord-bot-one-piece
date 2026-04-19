import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';

config({ path: '.env.local' });

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
    await message.reply('hello everyone');
  }
});

await client.login(token);
