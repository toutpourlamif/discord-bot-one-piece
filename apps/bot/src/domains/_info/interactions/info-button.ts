import { ValidationError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { parseIntegerArg } from '../../../discord/utils/index.js';
import type { DomainName } from '../../../shared/domains.js';
import { infoProviderByDomain } from '../registry.js';

export const INFO_BUTTON_NAME = 'info';

export const infoButtonHandler: ButtonHandler = {
  name: INFO_BUTTON_NAME,
  async handle(interaction, args) {
    const [domain, rawId] = args;

    //TODO voir si l'erreur n'est pas factorisable
    if (!domain) {
      throw new ValidationError(`arguments invalides: ${interaction.customId}`);
    }

    const id = parseIntegerArg(rawId);

    const provider = infoProviderByDomain.get(domain as DomainName);

    //TODO voir si l'erreur n'est pas factorisable
    if (!provider) {
      throw new ValidationError(`domaine info invalide: ${domain}`);
    }

    await interaction.deferUpdate();
    const embed = await provider.buildEmbedById(id);
    await interaction.editReply({ content: '', embeds: [embed], components: [] });
  },
};
