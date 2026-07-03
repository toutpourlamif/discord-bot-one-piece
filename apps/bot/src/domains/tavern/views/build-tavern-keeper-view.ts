import type { TavernKeeper } from '@one-piece/db';

import type { View } from '../../../discord/types.js';
import { buildBackAction, buildCustomId } from '../../../discord/utils/index.js';
import { TAVERN_BUTTON_NAME } from '../constants.js';
import { buildTavernKeeperGreetingEmbed } from '../utils/build-tavern-keeper-greeting-embed.js';

type BuildTavernKeeperViewParams = {
  tavernKeeper: TavernKeeper;
  ownerDiscordId: string;
  playerId: number;
};

export function buildTavernKeeperView({ tavernKeeper, ownerDiscordId, playerId }: BuildTavernKeeperViewParams): View {
  const greetingEmbed = buildTavernKeeperGreetingEmbed(tavernKeeper);

  const tavernButtonId = buildCustomId(TAVERN_BUTTON_NAME, ownerDiscordId, playerId);
  const backRow = buildBackAction(tavernButtonId);

  return { embeds: [greetingEmbed], components: [backRow] };
}
