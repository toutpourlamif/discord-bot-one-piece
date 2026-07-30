import type { EmbedBuilder } from 'discord.js';

import { buildAssetUrl } from '../../shared/build-asset-url.js';
import type { EmbedVariant } from '../branding.js';

import { buildOpEmbed } from './build-op-embed.js';

export type DialogueSpeaker = {
  name: string;
  /** Dossier de l'asset du perso, on y trouve à l'intérieur les `dialogue-${emotion}.webp`. */
  path: string;
  /** Variantes en plus de `default` que ce perso possède réellement (sert au fallback). */
  emotions?: Array<DialogueEmotion>;
};

type DialogueEmotion = 'default' | 'happy' | 'crying' | 'scared' | 'laughing' | 'thinking' | 'angry';

type BuildDialogueEmbedOptions = {
  emotion?: DialogueEmotion;
  variant?: EmbedVariant;
  verb?: DialogueVerb;
  /** Permet d'overwrite les verbes prédéfinis */
  customVerb?: string;
};

export function buildDialogueEmbed(speaker: DialogueSpeaker, text: string, options: BuildDialogueEmbedOptions = {}): EmbedBuilder {
  const emotion = resolveEmotion(speaker, options.emotion);
  const imageUrl = buildAssetUrl(`${speaker.path}/dialogue-${emotion}.webp`);
  const iconURL = buildAssetUrl(`${speaker.path}/dialogue-default.webp`);
  const verb = options.customVerb ?? DIALOGUE_VERBS[options.verb ?? 'say'];
  const name = `${speaker.name} ${verb} :`;
  return buildOpEmbed(options.variant).setAuthor({ name, iconURL }).setThumbnail(imageUrl).setDescription(text);
}

const DIALOGUE_VERBS = {
  say: 'a dit',
  reply: 'a répondu',
  exclaim: "s'est exclamé",
} as const;

type DialogueVerb = keyof typeof DIALOGUE_VERBS;

function resolveEmotion(speaker: DialogueSpeaker, requested?: DialogueEmotion): DialogueEmotion {
  if (!requested || requested === 'default') return 'default';
  return speaker.emotions?.includes(requested) ? requested : 'default';
}
