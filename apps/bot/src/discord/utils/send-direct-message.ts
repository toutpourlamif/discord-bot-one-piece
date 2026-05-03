import type { Client } from 'discord.js';

import type { View } from '../types.js';

export async function sendDirectMessage(input: { client: Client; discordId: string; view: View }): Promise<{ delivered: boolean }> {
  try {
    const { client, discordId, view } = input;
    const user = await client.users.fetch(discordId);
    await user.send(view);
    return { delivered: true };
  } catch (error) {
    console.warn(error);
    return { delivered: false };
  }
}
