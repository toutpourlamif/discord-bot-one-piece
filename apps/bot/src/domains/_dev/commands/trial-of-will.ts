import { NotFoundError, ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { buildDialogueEmbed, getQuery, type DialogueSpeaker } from '../../../discord/utils/index.js';
import { playTrialOfWillAnimation } from '../../character/discord/play-trial-of-will-animation.js';
import * as characterRepository from '../../character/repository.js';
import { tryRecruitViaTrialOfWill } from '../../character/services/try-recruit-via-trial-of-will.js';
import { resolveTargetPlayer } from '../../player/index.js';

// TODO: supprimer avant la prod — point d'entrée de démo pour l'Épreuve de Volonté, en attendant le câblage taverne/event.
export const trialOfWillCommand: Command = {
  names: { fr: 'épreuvedevolonté', en: 'trial-of-will' },
  aliases: { fr: ['ev'], en: ['tow'] },
  async handler(ctx) {
    const { targetPlayer, rest } = await resolveTargetPlayer(ctx);
    const query = getQuery(rest, { emptyMessage: 'Tu dois fournir un nom de personnage.' });

    const [hit] = await characterRepository.searchManyByName(query);
    if (!hit) throw new NotFoundError(`Aucun personnage trouvé pour ${query}.`);
    if (!hit.entity.path) throw new ValidationError(`${hit.entity.name} n'a pas d'illustration de dialogue.`);

    const result = await tryRecruitViaTrialOfWill(targetPlayer.id, hit.entity.name);

    const speaker: DialogueSpeaker = { name: hit.entity.name, path: hit.entity.path };
    const message = await ctx.message.reply({
      embeds: [buildDialogueEmbed(speaker, `${hit.entity.name} t'observe en silence, jaugeant ta détermination...`)],
    });

    await playTrialOfWillAnimation(message, speaker, result);
  },
};
