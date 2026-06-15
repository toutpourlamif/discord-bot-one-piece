import type { TavernConfig } from '../../tavern/types.js';

import { EAST_BLUE_ISLAND_REGISTRY } from './east-blue/island-registry.js';
import { PARADISE_ISLAND_REGISTRY } from './paradise/island-registry.js';
import type { Zone } from './zones.js';

const ISLAND_REGISTRY = [...EAST_BLUE_ISLAND_REGISTRY, ...PARADISE_ISLAND_REGISTRY];

type IslandDefinitions = (typeof ISLAND_REGISTRY)[number];

export type Island = IslandDefinitions['key'];

// TODO: voir si c'est optimisable
// `keyof` sur l'union d'îles donnerait l'intersection des clés : un type
// générique est nécessaire pour distribuer le `keyof` sur chaque île.
type SubZonesOf<T> = T extends { subZones: infer S } ? keyof S : never;
export type SubZone = SubZonesOf<IslandDefinitions>;

export const ISLANDS = ISLAND_REGISTRY.map((island) => island.key) as [Island, ...Array<Island>];

export const EAST_BLUE_ISLANDS: Array<Island> = EAST_BLUE_ISLAND_REGISTRY.map((island) => island.key);

/** Ordonnées d'ouest en est (l'ordre du registry suit la progression sur la Grand Line). */
export const PARADISE_ISLANDS: Array<Island> = PARADISE_ISLAND_REGISTRY.map((island) => island.key);

export const ISLAND_LABELS = Object.fromEntries(ISLAND_REGISTRY.map((island) => [island.key, island.name])) as Record<Island, string>;

export const SUB_ZONE_LABELS = Object.fromEntries(ISLAND_REGISTRY.flatMap((island) => Object.entries(island.subZones))) as Record<
  SubZone,
  string
>;

// Alimente l'enum Postgres `sub_zone`.
export const SUB_ZONES = Object.keys(SUB_ZONE_LABELS) as [SubZone, ...Array<SubZone>];

export const SUB_ZONES_BY_ISLAND = Object.fromEntries(
  ISLAND_REGISTRY.map((island) => [island.key, Object.keys(island.subZones) as ReadonlyArray<SubZone>]),
) as Record<Island, ReadonlyArray<SubZone>>;

// Sous-zone d'atterrissage quand le joueur arrive sur l'île.
export const ISLAND_ENTRY_SUB_ZONE = Object.fromEntries(ISLAND_REGISTRY.map((island) => [island.key, island.entrySubZone])) as Record<
  Island,
  SubZone
>;

// Tavernes déclarées au niveau de chaque île (champ optionnel de defineIsland) : une zone absente n'a pas de taverne.
export const TAVERN_CONFIG_BY_ZONE = Object.fromEntries(
  ISLAND_REGISTRY.filter((island) => island.tavernConfig).map((island) => [island.key, island.tavernConfig]),
) as Partial<Record<Zone, TavernConfig>>;
