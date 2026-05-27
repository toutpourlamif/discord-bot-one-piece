import { bucketsCommand } from './buckets.js';
import { buyCommand } from './buy.js';
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
import { showHistoryCommand } from './show-history.js';
import { upgradeShipCommand } from './upgrade-ship.js';

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
  buyCommand,
  sellCommand,
  upgradeShipCommand,
  dmCommand,
  showHistoryCommand,
  setBucketCommand,
].map((cmd) => ({ ...cmd, requiresOpAdmin: true, requiresSynchronization: false }));
