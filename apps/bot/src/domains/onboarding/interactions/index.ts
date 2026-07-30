import type { ButtonHandler } from '../../../discord/types.js';

import { onboardingFlavorButtonHandler } from './onboarding-flavor-button.js';
import { onboardingNextButtonHandler } from './onboarding-next-button.js';

export const onboardingButtonHandlers: Array<ButtonHandler> = [onboardingNextButtonHandler, onboardingFlavorButtonHandler];
