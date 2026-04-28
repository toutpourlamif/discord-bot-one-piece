import type { Command } from '../../../../discord/types.js';

import { handleDf } from './df.js';
import { handlePlayer } from './player.js';
import { handleResource } from './resource.js';
import { handleShip } from './ship.js';

const DEBUG_SUBCOMMANDS = ['player', 'ship', 'df', 'resource'] as const;

type DebugSubcommand = (typeof DEBUG_SUBCOMMANDS)[number];

const helpMessage = `Sous-commandes supportées : ${DEBUG_SUBCOMMANDS.join(', ')}`;

function isDebugSubcommand(value: string | undefined): value is DebugSubcommand {
  return value !== undefined && DEBUG_SUBCOMMANDS.includes(value as DebugSubcommand);
}

const handlers: Record<DebugSubcommand, Command['handler']> = {
  player: handlePlayer,
  ship: handleShip,
  df: handleDf,
  resource: handleResource,
};

export const debugCommand: Command = {
  name: 'debug',
  async handler(message, args) {
    const subcommand = args[0];

    if (!isDebugSubcommand(subcommand)) {
      await message.reply(helpMessage);
      return;
    }

    await handlers[subcommand](message, args.slice(1));
  },
};
