import { ALABASTA } from './alabasta.js';
import { DAWN_ISLAND } from './dawn-island.js';
import { DRUM } from './drum.js';
import { GOAT_ISLAND } from './goat-island.js';
import { LITTLE_GARDEN } from './little-garden.js';
import { LOGUETOWN } from './loguetown.js';
import { REVERSE_MOUNTAIN } from './reverse-mountain.js';
import { SATSURUZO_KINGDOM } from './satsuruzo-kingdom.js';
import { WANO } from './wano.js';
import { WHISKY_PEAK } from './whisky-peak.js';
import { YOTSUBA_ISLAND } from './yotsuba-island.js';

const ISLAND_REGISTRY = [
  SATSURUZO_KINGDOM,
  DAWN_ISLAND,
  GOAT_ISLAND,
  YOTSUBA_ISLAND,
  LOGUETOWN,
  REVERSE_MOUNTAIN,
  WHISKY_PEAK,
  LITTLE_GARDEN,
  DRUM,
  ALABASTA,
  WANO,
];

type IslandDefinitions = (typeof ISLAND_REGISTRY)[number];

export type Island = IslandDefinitions['key'];

// TODO: voir si c'est optimisable
// `keyof` sur l'union d'îles donnerait l'intersection des clés : un type
// générique est nécessaire pour distribuer le `keyof` sur chaque île.
type SubZonesOf<T> = T extends { subZones: infer S } ? keyof S : never;
export type SubZone = SubZonesOf<IslandDefinitions>;

export const ISLANDS = ISLAND_REGISTRY.map((island) => island.key) as [Island, ...Array<Island>];

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
