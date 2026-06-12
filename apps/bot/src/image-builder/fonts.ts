import { readFile } from 'node:fs/promises';

import type { SatoriOptions } from 'satori';

const FONTS_DIR = new URL('../../../../assets/fonts/', import.meta.url);

export const fonts: SatoriOptions['fonts'] = [
  { name: 'Pirata One', data: await readFile(new URL('pirata-one.ttf', FONTS_DIR)), weight: 400, style: 'normal' },
  { name: 'Lato', data: await readFile(new URL('lato.ttf', FONTS_DIR)), weight: 400, style: 'normal' },
  { name: 'Lato', data: await readFile(new URL('lato-bold.ttf', FONTS_DIR)), weight: 700, style: 'normal' },
];
