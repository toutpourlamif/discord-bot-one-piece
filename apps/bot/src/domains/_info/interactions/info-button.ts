import type { ButtonHandler } from '../../../discord/types.js';
import type { DomainName } from '../../../shared/domains.js';
import { infoProviderByDomain } from '../registry.js';

export const INFO_BUTTON_NAME = 'info';

export const infoButtonHandler: ButtonHandler = {
  name: INFO_BUTTON_NAME,
  async handle(interaction, args) {
    const [domain, rawId] = args;
    // TODO: THROW ERROR
    if (!domain || !rawId) return;
    // TODO: utiliser le helper de validation d'id (en cours de création)
    const id = Number(rawId);
    if (!Number.isInteger(id)) return;

    const provider = infoProviderByDomain.get(domain as DomainName);
    if (!provider) return;

    await interaction.deferUpdate();
    const embed = await provider.buildEmbedById(id);
    await interaction.editReply({ content: '', embeds: [embed], components: [] });
  },
};
