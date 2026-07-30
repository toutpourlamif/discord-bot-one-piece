export const ETERNAL_POSE_RESOURCES = [
  { name: 'Eternal Pose - Whisky Peak', path: null },
  { name: 'Eternal Pose - Little Garden', path: null },
  { name: 'Eternal Pose - Drum', path: null },
  { name: 'Eternal Pose - Alabasta', path: null },
] as const;

export type EternalPoseName = (typeof ETERNAL_POSE_RESOURCES)[number]['name'];

export const ETERNAL_POSE_NAMES: Array<EternalPoseName> = ETERNAL_POSE_RESOURCES.map((resource) => resource.name);
