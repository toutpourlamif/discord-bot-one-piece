import type { ShipModuleKey } from '@one-piece/db';

import * as playerRepository from '../../player/repository.js';
import * as resourceRepository from '../../resource/repository.js';
import * as shipRepository from '../repository.js';
import type { ShipModuleUpgradePreview } from '../types.js';
import { buildShipModuleUpgradePreview } from '../utils/index.js';

export async function getShipModuleUpgradePreview(playerId: number, moduleKey: ShipModuleKey): Promise<ShipModuleUpgradePreview | null> {
  const [ship, player, inventory] = await Promise.all([
    shipRepository.findByPlayerIdOrThrow(playerId),
    playerRepository.findByIdOrThrow(playerId),
    resourceRepository.getInventory(playerId),
  ]);

  return buildShipModuleUpgradePreview({
    ship,
    moduleKey,
    ownedBerries: player.berries,
    inventory,
  });
}
