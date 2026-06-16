import { wrapInBackticks } from './index.js';

export function formatCommand(prefix: string, commandName: string, options?: FormatCommandOptions): string {
  const command = `${prefix}${commandName}`;
  return options?.hasBackticks ? wrapInBackticks(command) : command;
}

type FormatCommandOptions = {
  hasBackticks: boolean;
};
