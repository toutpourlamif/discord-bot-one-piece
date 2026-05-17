import { ZONE_LABELS, type Edge } from '@one-piece/db';

import { buildOpEmbed } from '../../../../discord/utils/build-op-embed.js';
import { computeTravelETA, findPossibleEdges, isSea } from '../../../navigation/utils/index.js';
import type { GeneratorContext, InteractiveGenerator, Resolution } from '../../types.js';
import { noProbability } from '../utils.js';

export const cheatTeleport: InteractiveGenerator = {
  key: 'cheatTeleport',
  isInteractive: true,
  seedScope: 'player',
  probability: noProbability,

  initialStep: 'pickDestination',
  steps: {
    pickDestination: {
      embed: (_state, ctx) =>
        buildOpEmbed('info')
          .setTitle('🛠️ Cheat — choisir une destination')
          .setDescription(
            isSea(ctx.zone)
              ? `Vous êtes en mer (${ZONE_LABELS[ctx.zone]}). Attendez d'arriver pour pouvoir repartir.`
              : `Position actuelle : **${ZONE_LABELS[ctx.zone]}**`,
          ),
      choices: (_state, ctx) => {
        if (isSea(ctx.zone)) {
          return [{ id: 'cancel', label: 'Fermer', resolve: buildCancelResolution }];
        }
        const edges = findPossibleEdges(ctx.zone);
        if (edges.length === 0) {
          return [{ id: 'cancel', label: 'Aucune destination depuis ici', resolve: buildCancelResolution }];
        }
        return edges.map((edge) => ({
          id: edge.to,
          label: ZONE_LABELS[edge.to],
          resolve: (resolveCtx: GeneratorContext) => buildStartTravelResolution(resolveCtx, edge),
        }));
      },
    },
  },
};

function buildStartTravelResolution(ctx: GeneratorContext, edge: Edge): Resolution {
  const etaBucket = computeTravelETA({
    edge,
    ship: ctx.ship,
    crew: ctx.crew.members,
    startedBucket: ctx.bucketId,
  });
  return {
    embed: buildOpEmbed('success').setTitle(`🚢 Cap sur ${ZONE_LABELS[edge.to]}.`),
    effects: [{ type: 'startTravel', edge, etaBucket }],
    resolutionType: 'cheatTeleport.started',
  };
}

function buildCancelResolution(): Resolution {
  return {
    embed: buildOpEmbed('info').setTitle('Annulé.'),
    effects: [],
    resolutionType: 'cheatTeleport.cancel',
  };
}
