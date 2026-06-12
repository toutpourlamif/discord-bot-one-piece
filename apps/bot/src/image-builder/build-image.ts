import { Resvg } from '@resvg/resvg-js';
import type { ReactNode } from 'react';
import satori from 'satori';

import { fonts } from './fonts.js';

export type BuildImageOptions = {
  width: number;
  height: number;
};

export async function buildImage(element: ReactNode, options: BuildImageOptions): Promise<Buffer> {
  const svg = await satori(element, { width: options.width, height: options.height, fonts });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: options.width * RETINA_SCALE } }).render().asPng();
  return Buffer.from(png);
}

const RETINA_SCALE = 2;
