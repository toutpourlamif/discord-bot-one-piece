import type { Command } from '../../../shared/command.js';

import { debugCommand } from './debug.js';
import { karmaCommand } from './karma.js';

export const playerCommands: Array<Command> = [karmaCommand, debugCommand];
