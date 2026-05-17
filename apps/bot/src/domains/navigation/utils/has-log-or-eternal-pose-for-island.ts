import type { Island, ResourceName } from '@one-piece/db';

import type { Inventory } from '../../resource/types.js';

const ETERNAL_POSE_BY_ISLAND: Partial<Record<Island, ResourceName>> = {
  whisky_peak: 'Eternal Pose - Whisky Peak',
  little_garden: 'Eternal Pose - Little Garden',
  drum: 'Eternal Pose - Drum',
  alabasta: 'Eternal Pose - Alabasta',
};

export function hasLogOrEternalPoseForIsland(inventory: Inventory, island: Island): boolean {
  if (inventory.some((item) => item.name === 'Log Pose')) return true;
  const eternalPose = ETERNAL_POSE_BY_ISLAND[island];
  if (eternalPose === undefined) return false;
  return inventory.some((item) => item.name === eternalPose);
}
