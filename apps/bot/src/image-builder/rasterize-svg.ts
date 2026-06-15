import { Resvg } from '@resvg/resvg-js';

/** On rend en 2× pour que l'image reste nette sur les écrans retina. */
export const RETINA_SCALE = 2;

export type RasterizeSvgOptions = {
  width: number;
  /** Nécessaire seulement si le SVG contient du `<text>` (satori convertit déjà le texte en paths). */
  fontFiles?: Array<string>;
};

export function rasterizeSvg(svg: string, options: RasterizeSvgOptions): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: options.width * RETINA_SCALE },
    font: options.fontFiles ? { fontFiles: options.fontFiles, loadSystemFonts: false } : undefined,
  });
  return Buffer.from(resvg.render().asPng());
}
