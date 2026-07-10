import { pgEnum } from 'drizzle-orm/pg-core';

// TODO: Double check que tout est bien et remplacer Koby
export const ONBOARDING_STEP_IDS = [
  'intro',
  'gold-roger-distant-march',
  'gold-roger-close-march',
  'gold-roger-chained-hands',
  'gold-roger-climbs-stairs',
  'gold-roger-blade-view',
  'gold-roger-accepts-fate',
  'gold-roger-blades-rise',
  'gold-roger-blade-view-behind',
  'gold-roger-crowd-reaction',
  'gold-roger-laughs',
  'gold-roger-treasure-reveal',
  'gold-roger-legacy-begins',
  'gold-roger-pirate-era',
  'storyteller-square',
  'storyteller-turns-to-you',
  'storyteller-question',
  'storyteller-coin-flip',
  'storyteller-encyclopedia',
  'info-mission',
  'crew-koby-encounter',
  'crew-koby-offer',
  'crew-mission',
  'boat-gifted',
  'boat-departure',
  'boat-search-supplies',
  'inventory-mission',
  'fish-mission',
  'after-fish',
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[number];

export const onboardingStepEnum = pgEnum('onboarding_step', ONBOARDING_STEP_IDS);
