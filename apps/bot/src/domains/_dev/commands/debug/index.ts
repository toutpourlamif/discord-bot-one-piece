import type { Command } from '../../../../discord/types.js';

import { handleDf } from './df.js';
import { handlePlayer } from './player.js';
import { handleResource } from './resource.js';
import { handleShip } from './ship.js';
import type { DebugHandler } from './utils.js';

const helpMessage = 'Sous-commandes supportées : player, ship, df, resource';

type DebugSubcommand = 'player' | 'ship' | 'df' | 'resource';

function isDebugSubcommand(value: string | undefined): value is DebugSubcommand {
  return value === 'player' || value === 'ship' || value === 'df' || value === 'resource';
}

const handlers: Record<DebugSubcommand, DebugHandler> = {
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

    await handlers[subcommand](message, args);
  },
};
