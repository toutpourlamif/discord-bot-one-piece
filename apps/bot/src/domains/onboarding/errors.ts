import { AppError } from '../../discord/errors.js';
import type { View } from '../../discord/types.js';

export class OnboardingPendingError extends AppError {
  constructor(view: View) {
    super('Onboarding en cours.', 'warn', 'Onboarding en cours.', view);
    this.name = 'OnboardingPendingError';
  }
}
