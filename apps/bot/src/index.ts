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

// TODO: supprimer avant la PROD (j'ai fussioner les 2 tests)
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();
  if (!content.startsWith(prefix)) return;

  const withoutPrefix = content.slice(prefix.length).trim();
  const normalized = withoutPrefix.toLowerCase();

  if (normalized === 'one piece') {
    await message.reply('hello everyone');
    return;
  }

  const [command, ...args] = withoutPrefix.split(/\s+/);

  if (command?.toLowerCase() === 'repeat') {
    const repeatText = args.join(' ');

    if (!repeatText) {
      await message.reply('Tu dois fournir un texte.');
      return;
    }

    await message.reply(repeatText);
  }
});

await client.login(token);
