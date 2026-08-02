import type { View } from '../../../../../discord/types.js';
import { buildOpEmbed } from '../../../../../discord/utils/index.js';
import { buildAssetUrl } from '../../../../../shared/build-asset-url.js';
import { COIN_FLIP_THROW_ANIMATION } from '../constants.js';

export function buildCoinFlipThrowingView(): View {
  const embed = buildOpEmbed().setTitle('🪙 La pièce est en l’air…').setImage(buildAssetUrl(COIN_FLIP_THROW_ANIMATION.path));
  return { embeds: [embed], components: [] };
}
