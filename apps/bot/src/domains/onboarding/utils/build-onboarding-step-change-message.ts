import type { OnboardingStepId } from '@one-piece/db';

export type OnboardingStepChange = { previousStep: OnboardingStepId | null; targetStep: OnboardingStepId | null; delta: number };

export function buildOnboardingStepChangeMessage(playerName: string, { targetStep, delta }: OnboardingStepChange): string {
  const targetLabel = targetStep ?? 'onboarding terminé';
  if (delta === 0) return `${playerName} est déjà sur \`${targetLabel}\`.`;
  const direction = delta > 0 ? 'avancé' : 'reculé';
  const stepCount = Math.abs(delta);
  return `${playerName} a ${direction} de ${stepCount} step${stepCount > 1 ? 's' : ''} → \`${targetLabel}\`.`;
}
