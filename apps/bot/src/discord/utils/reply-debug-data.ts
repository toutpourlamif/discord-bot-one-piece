import type { Message } from 'discord.js';

import { wrapInCodeBlock } from '../../shared/utils.js';
import { ValidationError } from '../errors.js';

const DISCORD_MAX_MESSAGE_LENGTH = 2000;

function stringifyDebugData(data: unknown): string {
  const replaceBigInt = (_key: string, value: unknown): unknown => (typeof value === 'bigint' ? value.toString() : value);

  return JSON.stringify(data, replaceBigInt, 2);
}

export async function replyDebugData(message: Message, data: unknown): Promise<void> {
  const json = stringifyDebugData(data);
  const codeBlock = wrapInCodeBlock(json, 'ts');

  if (codeBlock.length > DISCORD_MAX_MESSAGE_LENGTH) {
    throw new ValidationError(`Données debug trop longues pour Discord (${codeBlock.length}/${DISCORD_MAX_MESSAGE_LENGTH} caractères).`);
  }

  await message.reply(codeBlock);
}
