import { pgEnum } from 'drizzle-orm/pg-core';

export const ISLANDS = ['foosha', 'loguetown', 'reverse_mountain', 'whisky_peak', 'little_garden', 'drum', 'alabasta'] as const;

export const SEAS = ['sea_east_blue', 'sea_paradise', 'sea_new_world'] as const;

export const ZONES = [...ISLANDS, ...SEAS] as const;

export type Island = (typeof ISLANDS)[number];
export type Sea = (typeof SEAS)[number];
export type Zone = (typeof ZONES)[number];

export const zoneEnum = pgEnum('zone', ZONES);
