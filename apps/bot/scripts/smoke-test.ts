import { Client, Events, GatewayIntentBits } from 'discord.js';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('DISCORD_TOKEN manquant');
}

const READY_TIMEOUT_MS = 30_000;

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const timeout = setTimeout(() => {
  console.error(`ClientReady non déclenché en ${READY_TIMEOUT_MS}ms`);
  process.exit(1);
}, READY_TIMEOUT_MS);

client.once(Events.ClientReady, async (client) => {
  clearTimeout(timeout);
  console.log(`Bot connecté : ${client.user.tag}`);
  await client.destroy();
  process.exit(0);
});

await client.login(token);
