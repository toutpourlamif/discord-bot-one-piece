import type { TavernKeeper } from '@one-piece/db';

import type { DialogueSpeaker } from '../../../discord/utils/index.js';

export function buildTavernKeeperDialogueSpeaker(tavernKeeper: TavernKeeper): DialogueSpeaker {
  return { name: tavernKeeper.name, path: tavernKeeper.assetPath };
}
