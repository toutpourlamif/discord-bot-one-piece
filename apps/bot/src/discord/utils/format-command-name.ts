import { wrapInBackticks } from './index.js';

type FormatCommandOptions = {
  wrapInBackticks: boolean;
};

export function formatCommand(prefix: string, commandName: string, options?: FormatCommandOptions): string {
  const command = `${prefix}${commandName}`;
  return options?.wrapInBackticks ? wrapInBackticks(command) : command;
}
