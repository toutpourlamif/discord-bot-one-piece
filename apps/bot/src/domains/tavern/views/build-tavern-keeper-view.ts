import type { TavernKeeper } from '@one-piece/db';
import sample from 'lodash/sample.js';

import type { View } from '../../../discord/types.js';
import { buildBackAction, buildCustomId, buildDialogueEmbed } from '../../../discord/utils/index.js';
import { TAVERN_BUTTON_NAME } from '../constants.js';
import { buildTavernKeeperDialogueSpeaker } from '../utils/build-tavern-keeper-dialogue-speaker.js';

type BuildTavernKeeperViewParams = {
  tavernKeeper: TavernKeeper;
  ownerDiscordId: string;
  playerId: number;
};

export function buildTavernKeeperView({ tavernKeeper, ownerDiscordId, playerId }: BuildTavernKeeperViewParams): View {
  const dialogueSpeaker = buildTavernKeeperDialogueSpeaker(tavernKeeper);
  const greetingLine = sample(tavernKeeper.greetingLines)!;
  const greetingEmbed = buildDialogueEmbed(dialogueSpeaker, greetingLine);

  const tavernButtonId = buildCustomId(TAVERN_BUTTON_NAME, ownerDiscordId, playerId);
  const backRow = buildBackAction(tavernButtonId);

  return { embeds: [greetingEmbed], components: [backRow] };
}
