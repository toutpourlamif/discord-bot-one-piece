// TODO: Décider le bon nom pour le bot discord
export const BOT_NAME = 'One Piece Bot';

export const EMBED_COLORS = {
  default: 0x99aab5,
  error: 0xed4245,
  info: 0x5284de,
  success: 0x57f287,
  warn: 0xfee75c,
  forest: 0x389d79,
} as const;

export type EmbedVariant = keyof typeof EMBED_COLORS;

export let botIconUrl: string | undefined;

export function setBotIconUrl(url: string): void {
  botIconUrl = url;
}
