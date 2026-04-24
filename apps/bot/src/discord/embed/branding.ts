// TODO: Décider la bonne couleur et le bon nom pour le bot discord
export const BOT_NAME = 'One Piece Bot';
export const BOT_COLOR = 0xffcd29;
export let botIconUrl: string | undefined;

export function setBotIconUrl(url: string): void {
  botIconUrl = url;
}
