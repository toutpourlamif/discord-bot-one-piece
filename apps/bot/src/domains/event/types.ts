import type { Player, Ship, Zone } from '@one-piece/db';
import type { EmbedBuilder } from 'discord.js';

import type { CharacterRow } from '../character/types.js';
import type { Inventory } from '../resource/types.js';

import type { EventEffect } from './effects/types.js';

type SeedScope = 'zone' | 'player';

export type Rng = { next: () => number };

export type GeneratorContext = {
  player: Player;
  crew: {
    members: Array<CharacterRow>;
    has: (name: string) => boolean;
    getByName: (name: string) => CharacterRow | undefined;
  };
  ship: Ship;
  inventory: Inventory;
  history: {
    has: (type: string) => boolean;
    lastResolutionOf: (prefix: string) => string | undefined;
    countSinceBuckets: (type: string, buckets: number) => number;
  };
  bucketId: number;
  zone: Zone;
  othersInZone: Array<Player>;
};

type GeneratorBase = {
  key: string;
  isInteractive: boolean;
  seedScope: SeedScope;
  conditions?: (ctx: GeneratorContext) => boolean;
  cooldownBuckets?: number;
  oneTime?: boolean;
  probability: (ctx: GeneratorContext) => number;
};

export type PassiveGenerator = GeneratorBase & {
  isInteractive: false;
  compute: (ctx: GeneratorContext, rng: Rng) => { effects: Array<EventEffect>; state: Record<string, unknown> };
  render: (state: Record<string, unknown>) => EmbedBuilder;
};

export type Resolution = {
  embed: EmbedBuilder;
  effects: Array<EventEffect>;
  resolutionType: string;
};

type Choice =
  | { id: string; label: string; goTo: string }
  | { id: string; label: string; resolve: (ctx: GeneratorContext, rng: Rng) => Resolution };

type InteractiveStep = {
  embed: (state: Record<string, unknown>, ctx: GeneratorContext) => EmbedBuilder;
  choices: (state: Record<string, unknown>, ctx: GeneratorContext) => Array<Choice>;
};

export type InteractiveGenerator = GeneratorBase & {
  isInteractive: true;
  initial: string;
  steps: Record<string, InteractiveStep>;
};

export type EventGenerator = PassiveGenerator | InteractiveGenerator;
