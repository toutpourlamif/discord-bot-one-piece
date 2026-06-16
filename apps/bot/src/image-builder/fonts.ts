import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import type { SatoriOptions } from 'satori';

const FONTS_DIR = new URL('../../../../assets/fonts/', import.meta.url);

/** Pour les rendus SVG directs (resvg veut un chemin de fichier, pas un Buffer). */
export const PIRATA_ONE_FONT_FILE = fileURLToPath(new URL('pirata-one.ttf', FONTS_DIR));

export const fonts: SatoriOptions['fonts'] = [
  { name: 'Pirata One', data: await readFile(new URL('pirata-one.ttf', FONTS_DIR)), weight: 400, style: 'normal' },
  { name: 'Lato', data: await readFile(new URL('lato.ttf', FONTS_DIR)), weight: 400, style: 'normal' },
  { name: 'Lato', data: await readFile(new URL('lato-bold.ttf', FONTS_DIR)), weight: 700, style: 'normal' },
];
