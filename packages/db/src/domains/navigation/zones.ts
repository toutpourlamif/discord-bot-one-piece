const EAST_BLUE_ISLANDS = ['foosha', 'loguetown'] as const;
const PARADISE_ISLANDS = ['whisky_peak', 'little_garden', 'drum', 'alabasta'] as const;
const NEW_WORLD_ISLANDS = ['wano'] as const;
export const ISLANDS = [...EAST_BLUE_ISLANDS, 'reverse_mountain', ...PARADISE_ISLANDS, ...NEW_WORLD_ISLANDS] as const;

export const SEAS = ['sea_east_blue', 'sea_paradise', 'sea_new_world'] as const;

export const ZONES = [...ISLANDS, ...SEAS] as const;

export type Island = (typeof ISLANDS)[number];
export type Sea = (typeof SEAS)[number];
export type Zone = (typeof ZONES)[number];
