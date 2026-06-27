import { wrapInBackticks } from './index.js';

type FormatCommandOptions = {
  hasBackticks: boolean;
};

export function formatCommand(prefix: string, commandName: string, options?: FormatCommandOptions): string {
  const command = `${prefix}${commandName}`;
  return options?.hasBackticks ? wrapInBackticks(command) : command;
}
