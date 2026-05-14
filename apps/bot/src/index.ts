import { Client, Events, GatewayIntentBits } from 'discord.js';

import { setBotIconUrl } from './discord/branding.js';
import { routeInteraction } from './discord/interactionRouter.js';
import { routeMessage } from './discord/router.js';
import { validateGeneratorsPaths } from './domains/event/engine/validate-generators-paths.js';
import { interactiveGenerators } from './domains/event/generators/registry.js';

validateGeneratorsPaths(interactiveGenerators);

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('DISCORD_TOKEN manquant dans apps/bot/.env.local');
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once(Events.ClientReady, (c) => {
  setBotIconUrl(c.user.displayAvatarURL());
  console.log(`Bot connecté : ${c.user.tag}`);
});

client.on(Events.MessageCreate, (message) => routeMessage(message));
client.on(Events.InteractionCreate, (interaction) => routeInteraction(interaction));

await client.login(token);
