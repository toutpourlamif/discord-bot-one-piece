// TODO: Décider la bonne couleur et le bon nom pour le bot discord
export const BOT_NAME = 'One Piece Bot';
export const BOT_COLOR = 0x5284de;

export const EMBED_COLORS = {
  default: BOT_COLOR,
  error: 0xed4245,
  info: 0x99aab5,
  warn: 0xfee75c,
} as const;

export type EmbedVariant = keyof typeof EMBED_COLORS;

export let botIconUrl: string | undefined;

export function setBotIconUrl(url: string): void {
  botIconUrl = url;
}
