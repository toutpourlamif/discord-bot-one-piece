import { AttachmentBuilder, type EmbedBuilder } from 'discord.js';

type AttachImageParams = {
  embed: EmbedBuilder;
  files: Array<AttachmentBuilder>;
  image: Buffer;
  name?: string;
};

/** Attache une image générée : ajoute la pièce jointe aux `files` de la View et pointe l'embed dessus (`attachment://...`). */
export function attachImage({ embed, files, image, name = 'card.png' }: AttachImageParams): void {
  files.push(new AttachmentBuilder(image, { name }));
  embed.setImage(`attachment://${name}`);
}
