import type { Island } from '@one-piece/db';
import camelCase from 'lodash/camelCase.js';

import { buildOpEmbed } from '../../../../../discord/utils/build-op-embed.js';
import type { PassiveGenerator } from '../../../types.js';
import { noCompute, noProbability } from '../../utils.js';

type ArrivalContent = {
  text: string;
  imageUrl: string;
  description?: string;
  color?: number;
};

export function buildArrivalGenerator(island: Island, content: ArrivalContent): PassiveGenerator {
  return {
    key: `${camelCase(island)}Arrival`,
    isInteractive: false,
    seedScope: 'player',
    probability: noProbability,
    compute: noCompute,
    render: () =>
      buildOpEmbed('info')
        .setTitle(content.text)
        .setImage(content.imageUrl)
        .setDescription(content.description ?? null)
        .setColor(content.color ?? null),
  };
}
