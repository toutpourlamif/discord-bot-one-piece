import type { Client } from 'discord.js';

import type { View } from '../types.js';

export async function sendDirectMessage(input: { client: Client; discordId: string; view: View }): Promise<{ delivered: boolean }> {
  const { client, discordId, view } = input;
  try {
    const user = await client.users.fetch(discordId);
    await user.send(view);
    return { delivered: true };
    // eslint-disable-next-line unused-imports/no-unused-vars -- obligé d'avoir error
  } catch (error) {
    console.warn(`Impossible d'envoyer un message au discordId : ${discordId}`);
    return { delivered: false };
  }
}
