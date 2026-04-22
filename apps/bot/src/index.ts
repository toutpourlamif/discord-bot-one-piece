import { Client, Events, GatewayIntentBits } from 'discord.js';

import { routeInteraction } from './discord/interactionRouter.js';
import { routeMessage } from './discord/router.js';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('DISCORD_TOKEN manquant dans apps/bot/.env.local');
}

const prefix = process.env.COMMAND_PREFIX;
if (!prefix) {
  throw new Error('COMMAND_PREFIX manquant dans apps/bot/.env.local');
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Bot connecté : ${c.user.tag}`);
});

client.on(Events.MessageCreate, (message) => routeMessage(message, prefix));
client.on(Events.InteractionCreate, (interaction) => routeInteraction(interaction));

await client.login(token);
