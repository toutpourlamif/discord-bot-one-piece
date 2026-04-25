import type { Command } from '../../../../discord/types.js';
import { wrapInCodeBlock } from '../../../../shared/utils.js';

export type DebugHandler = Command['handler'];
export type DebugMessage = Parameters<DebugHandler>[0];
export type DebugArgs = Parameters<DebugHandler>[1];

function stringifyDebugData(data: unknown): string {
  const replaceBigInt = (_key: string, value: unknown): unknown => (typeof value === 'bigint' ? value.toString() : value);

  return JSON.stringify(data, replaceBigInt, 2);
}

export async function replyDebugData(message: DebugMessage, data: unknown): Promise<void> {
  const json = stringifyDebugData(data);
  const codeBlock = wrapInCodeBlock(json, 'ts');

  await message.reply(codeBlock);
}
