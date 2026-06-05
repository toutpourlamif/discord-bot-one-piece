export function formatCommand(prefix: string, command: string, options?: FormatCommandOptions): string {
  if (options?.backticks === false) {
    return `${prefix}${command}`;
  }
  return `\`${prefix}${command}\``;
}

type FormatCommandOptions = {
  backticks: boolean;
};
