import { devCommands } from '../domains/_dev/index.js';
import { infoCommands } from '../domains/_info/index.js';
import { crewCommands } from '../domains/crew/index.js';
import { eventCommands } from '../domains/event/index.js';
import { fishingCommands } from '../domains/fishing/index.js';
import { guildCommands } from '../domains/guild/index.js';
import { onboardingCommands } from '../domains/onboarding/index.js';
import { playerCommands } from '../domains/player/index.js';
import { resourceCommands } from '../domains/resource/index.js';
import { shipCommands } from '../domains/ship/commands/index.js';
import { tavernCommands } from '../domains/tavern/index.js';

import { buildCommandRegistry, resolveCommand } from './routing/registry.js';

const allCommands = [
  ...playerCommands,
  ...infoCommands,
  ...devCommands,
  ...shipCommands,
  ...resourceCommands,
  ...fishingCommands,
  ...crewCommands,
  ...guildCommands,
  ...eventCommands,
  ...onboardingCommands,
  ...tavernCommands,
];

buildCommandRegistry(allCommands);

export { resolveCommand };
