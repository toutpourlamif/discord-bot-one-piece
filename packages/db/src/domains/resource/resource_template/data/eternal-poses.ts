import type { ResourceSeed } from '../data.js';

export const ETERNAL_POSE_RESOURCES = [
  { name: 'Eternal Pose - Whisky Peak', path: null, isQuestItem: true },
  { name: 'Eternal Pose - Little Garden', path: null, isQuestItem: true },
  { name: 'Eternal Pose - Drum', path: null, isQuestItem: true },
  { name: 'Eternal Pose - Alabasta', path: null, isQuestItem: true },
] as const satisfies ReadonlyArray<ResourceSeed>;

export type EternalPoseName = (typeof ETERNAL_POSE_RESOURCES)[number]['name'];

export const ETERNAL_POSE_NAMES: Array<EternalPoseName> = ETERNAL_POSE_RESOURCES.map((resource) => resource.name);
