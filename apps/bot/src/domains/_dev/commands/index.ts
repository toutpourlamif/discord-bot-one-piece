import { bucketsCommand } from './buckets.js';
import { buyCommand } from './buy.js';
import { clearEventsCommand } from './clear-events.js';
import { colorCommand } from './color.js';
import { debugCommand } from './debug/index.js';
import { dmCommand } from './dm.js';
import { embedCommand } from './embed.js';
import { emojiCommand } from './emoji.js';
import { forceEventCommand } from './force-event.js';
import { giveCharacterCommand } from './givecharacter.js';
import { moiCommand } from './moi.js';
import { nombreCommand } from './nombre.js';
import { onePieceCommand } from './onepiece.js';
import { randomCommand } from './random.js';
import { randomCatCommand } from './randomcat.js';
import { repeatCommand } from './repeat.js';
import { sellCommand } from './sell.js';
import { setBucketCommand } from './set-bucket.js';
import { setEtaCommand } from './set-eta.js';
import { setShipTemplateCommand } from './set-ship-template.js';
import { showHistoryCommand } from './show-history.js';
import { skipOnboardingCommand } from './skip-onboarding.js';
import { upgradeShipCommand } from './upgrade-ship.js';
import { wipeHistoryCommand } from './wipe-history.js';

export const devCommands = [
  onePieceCommand,
  repeatCommand,
  embedCommand,
  giveCharacterCommand,
  moiCommand,
  nombreCommand,
  colorCommand,
  randomCatCommand,
  randomCommand,
  forceEventCommand,
  debugCommand,
  emojiCommand,
  bucketsCommand,
  clearEventsCommand,
  buyCommand,
  sellCommand,
  upgradeShipCommand,
  setShipTemplateCommand,
  dmCommand,
  showHistoryCommand,
  wipeHistoryCommand,
  skipOnboardingCommand,
  setBucketCommand,
  setEtaCommand,
].map((cmd) => ({ ...cmd, requiresOpAdmin: true, requiresSynchronization: false, requiresOnboardingFinished: false }));
