import { buyCommand } from './buy.js';
import { colorCommand } from './color.js';
import { debugCommand } from './debug/index.js';
import { embedCommand } from './embed.js';
import { emojiCommand } from './emoji.js';
import { giveCharacterCommand } from './givecharacter.js';
import { moiCommand } from './moi.js';
import { nombreCommand } from './nombre.js';
import { onePieceCommand } from './onepiece.js';
import { randomCommand } from './random.js';
import { randomCatCommand } from './randomcat.js';
import { repeatCommand } from './repeat.js';
import { sellCommand } from './sell.js';
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
  debugCommand,
  emojiCommand,
  buyCommand,
  sellCommand,
  upgradeShipCommand,
].map((cmd) => ({ ...cmd, adminOnly: true }));
