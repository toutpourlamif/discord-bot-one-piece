import type { Message } from 'discord.js';

import { wrapInCodeBlock } from '../../../../shared/utils.js';

function stringifyDebugData(data: unknown): string {
  const replaceBigInt = (_key: string, value: unknown): unknown => (typeof value === 'bigint' ? value.toString() : value);

  return JSON.stringify(data, replaceBigInt, 2);
}

export async function replyDebugData(message: Message, data: unknown): Promise<void> {
  const json = stringifyDebugData(data);
  const codeBlock = wrapInCodeBlock(json, 'ts');

  await message.reply(codeBlock);
}
