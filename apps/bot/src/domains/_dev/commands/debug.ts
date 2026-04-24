import type { Command } from '../../../discord/types.js';
import { getTargetUser } from '../../../discord/utils/get-target-user.js';
import { wrapInCodeBlock } from '../../../shared/utils.js';
import { findById as findDevilFruitById } from '../../devil_fruit/repository.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { findById as findResourceById } from '../../resource/repository.js';
import { findByPlayerId } from '../../ship/repository.js';

const helpMessage = 'Sous-commandes supportées : player, ship, df, resource';

type DebugSubcommand = 'player' | 'ship' | 'df' | 'resource';
type DebugHandler = Command['handler'];
type DebugMessage = Parameters<DebugHandler>[0];
type DebugArgs = Parameters<DebugHandler>[1];

function isDebugSubcommand(value: string | undefined): value is DebugSubcommand {
  return value === 'player' || value === 'ship' || value === 'df' || value === 'resource';
}

function stringifyDebugData(data: unknown): string {
  const replaceBigInt = (_key: string, value: unknown): unknown => (typeof value === 'bigint' ? value.toString() : value);

  return JSON.stringify(data, replaceBigInt, 2);
}

async function replyDebugData(message: DebugMessage, data: unknown): Promise<void> {
  const json = stringifyDebugData(data);
  const codeBlock = wrapInCodeBlock(json, 'ts');

  await message.reply(codeBlock);
}

async function handlePlayer(message: DebugMessage, _args: DebugArgs): Promise<void> {
  const target = getTargetUser(message);
  const { player } = await findOrCreatePlayer(target.id, target.username);

  await replyDebugData(message, player);
}

async function handleShip(message: DebugMessage, _args: DebugArgs): Promise<void> {
  const target = getTargetUser(message);
  const { player } = await findOrCreatePlayer(target.id, target.username);
  const ship = await findByPlayerId(player.id);

  if (!ship) {
    await message.reply('Aucun ship trouvé pour ce player.');
    return;
  }

  await replyDebugData(message, ship);
}

async function handleDf(message: DebugMessage, args: DebugArgs): Promise<void> {
  const rawId = args[1];
  const id = Number(rawId);

  if (!Number.isInteger(id)) {
    await message.reply('Tu dois fournir un id de devil fruit valide.');
    return;
  }

  const devilFruit = await findDevilFruitById(id);

  if (!devilFruit) {
    await message.reply(`Aucun devil fruit trouvé avec l'id ${id}.`);
    return;
  }

  await replyDebugData(message, devilFruit);
}

async function handleResource(message: DebugMessage, args: DebugArgs): Promise<void> {
  const rawId = args[1];
  const id = Number(rawId);

  if (!Number.isInteger(id)) {
    await message.reply('Tu dois fournir un id de resource valide.');
    return;
  }

  const resource = await findResourceById(id);

  if (!resource) {
    await message.reply(`Aucune resource trouvée avec l'id ${id}.`);
    return;
  }

  await replyDebugData(message, resource);
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
