import type { Command } from '../../../discord/types.js';

import { introCommand } from './intro.js';

export const onboardingCommands: Array<Command> = [introCommand];
