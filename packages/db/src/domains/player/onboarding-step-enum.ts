import { pgEnum } from 'drizzle-orm/pg-core';

export const ONBOARDING_STEP_IDS = ['intro', 'fish-mission', 'after-fish'] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[number];

export const onboardingStepEnum = pgEnum('onboarding_step', ONBOARDING_STEP_IDS);
