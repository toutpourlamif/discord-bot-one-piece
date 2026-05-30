import type { ButtonHandler } from '../../../discord/types.js';

import { onboardingNextButtonHandler } from './onboarding-next-button.js';

export const onboardingButtonHandlers: Array<ButtonHandler> = [onboardingNextButtonHandler];
