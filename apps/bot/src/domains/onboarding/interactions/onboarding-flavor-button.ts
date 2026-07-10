import type { ActionRow, ButtonComponent, ButtonInteraction, MessageActionRowComponent, TopLevelComponent } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ComponentType, EmbedBuilder } from 'discord.js';

import { InternalError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, editReply, parseOwnerDiscordId, parseStringArg } from '../../../discord/utils/index.js';
import { ONBOARDING_FLAVOR_BUTTON_NAME } from '../constants.js';
import { STORYTELLER_FLAVOR_RESPONSES } from '../steps/step-storyteller.js';

/** Boutons "flavor" (cf. l'écran du conteur) : purement cosmétique, n'avance jamais l'onboarding. */
export const onboardingFlavorButtonHandler: ButtonHandler = {
  name: ONBOARDING_FLAVOR_BUTTON_NAME,
  async handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
    const ownerDiscordId = parseOwnerDiscordId(args[0]);
    assertInteractorIsTheOwner(interaction, ownerDiscordId);
    await interaction.deferUpdate();

    const choiceId = parseStringArg(args[1], 'choiceId manquant dans le customId');
    const response = STORYTELLER_FLAVOR_RESPONSES[choiceId];
    if (!response) throw new InternalError(`Réponse flavor introuvable pour choiceId: ${choiceId}`);

    const [currentEmbed] = interaction.message.embeds;
    const updatedEmbed = EmbedBuilder.from(currentEmbed ?? new EmbedBuilder()).setDescription(
      `${currentEmbed?.description ?? ''}\n\n${response}`,
    );

    const updatedComponents = interaction.message.components.filter(isActionRow).map((row) => {
      const buttons = row.components.filter(isButtonComponent).map((component) => {
        const button = ButtonBuilder.from(component);
        return component.customId === interaction.customId ? button.setDisabled(true) : button;
      });
      return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
    });

    await editReply(interaction, { embeds: [updatedEmbed], components: updatedComponents });
  },
};

function isActionRow(component: TopLevelComponent): component is ActionRow<MessageActionRowComponent> {
  return component.type === ComponentType.ActionRow;
}

function isButtonComponent(component: MessageActionRowComponent): component is ButtonComponent {
  return component.type === ComponentType.Button;
}
