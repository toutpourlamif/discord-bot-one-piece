import type { Guild } from '@one-piece/db';

import type { Command } from '../types.js';

import { wrapInBackticks } from './index.js';

type FormatCommandOptions = {
  wrapInBackticks: boolean;
};

export function getFormattedCommand(guild: Guild, command: Command, options?: FormatCommandOptions): string {
  const formatted = `${guild.prefix}${command.names[guild.language]}`;
  return options?.wrapInBackticks ? wrapInBackticks(formatted) : formatted;
}
