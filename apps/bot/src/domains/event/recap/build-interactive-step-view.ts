import type { JSONFromSQL } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import chunk from 'lodash/chunk.js';

import { DISCORD_ACTION_ROW_MAX_BUTTONS } from '../../../discord/constants.js';
import { InternalError } from '../../../discord/errors.js';
import type { View } from '../../../discord/types.js';
import { getStartDateOfBucket } from '../engine/bucket.js';
import type { GeneratorContext, InteractiveGenerator } from '../types.js';
import { buildEventInteractiveChoiceCustomId } from '../utils/build-event-custom-id.js';

type BuildInteractiveStepViewParams = {
  generator: InteractiveGenerator;
  instanceId: bigint;
  state: JSONFromSQL;
  bucketId: number;
  ctx: GeneratorContext;
};

export function buildInteractiveStepView({ generator, instanceId, state, bucketId, ctx }: BuildInteractiveStepViewParams): View {
  const stepKey = state.step;
  if (typeof stepKey !== 'string') throw new InternalError(`state.step invalide pour ${generator.key}: ${String(stepKey)}`);
  const step = generator.steps[stepKey];
  if (!step) throw new InternalError(`Step introuvable: ${stepKey} pour ${generator.key}`);

  const embed = step.embed(state, ctx).setTimestamp(getStartDateOfBucket(bucketId));
  const buttons = step
    .choices(state, ctx)
    .map((choice) =>
      new ButtonBuilder()
        .setCustomId(buildEventInteractiveChoiceCustomId(instanceId, choice.id))
        .setLabel(choice.label)
        .setStyle(ButtonStyle.Primary),
    );
  const rows = chunk(buttons, DISCORD_ACTION_ROW_MAX_BUTTONS).map((rowButtons) =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(rowButtons),
  );
  return { embeds: [embed], components: rows };
}
