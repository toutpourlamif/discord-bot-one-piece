import type { ButtonInteraction } from 'discord.js';

import { InternalError, NotFoundError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { parseBigintArg } from '../../../discord/utils/index.js';
import { EVENT_BUTTON_NAME } from '../constants.js';
import { allGenerators } from '../generators/registry.js';
import * as eventRepository from '../repository.js';

export const eventChoiceButtonHandler: ButtonHandler = {
  name: EVENT_BUTTON_NAME,
  async handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
    await interaction.deferUpdate();

    const eventInstanceId = parseBigintArg(args[0]);

    const instance = await eventRepository.findById(eventInstanceId);
    if (!instance) {
      await interaction.followUp({ content: "Trop tard, l'évènement a déjà été résolu.", ephemeral: true });
      return;
    }

    const generator = allGenerators.find((eventGenerator) => eventGenerator.key === instance.eventKey);
    if (!generator) {
      throw new NotFoundError(`L'évènement est introuvable (${instance.eventKey})`);
    }

    if (!generator.isInteractive) {
      await eventRepository.deleteById(instance.id);
      // TODO: afficher l'évènement suivant de la queue (cf #192 commande !recap)
      await interaction.followUp({ content: 'TODO: afficher le prochain évènement.', ephemeral: true });
      return;
    }

    const choiceId = args[1];
    if (!choiceId) {
      throw new InternalError(`choice_id manquant pour évènement interactif: ${interaction.customId}`);
    }

    // TODO: brancher le dispatch interactif (resolve / goTo) quand le premier générateur interactif arrive (cf #198).
    void choiceId;
    await interaction.followUp({ content: 'TODO: dispatch interactif à brancher.', ephemeral: true });
  },
};
