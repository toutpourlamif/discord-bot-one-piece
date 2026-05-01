import { buildOpEmbed } from './build-op-embed.js';

export function buildServerOnlyEmbed() {
  return buildOpEmbed('warn').setDescription(
    'Le bot se joue uniquement sur un serveur Discord. Invite-le sur ton serveur ou rejoins-en un.',
  );
}
