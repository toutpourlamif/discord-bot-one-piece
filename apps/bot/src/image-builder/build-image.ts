import type { ReactNode } from 'react';
import satori from 'satori';

import { fonts } from './fonts.js';
import { rasterizeSvg } from './rasterize-svg.js';

export type BuildImageOptions = {
  width: number;
  height: number;
};

export async function buildImage(element: ReactNode, options: BuildImageOptions): Promise<Buffer> {
  const svg = await satori(element, { width: options.width, height: options.height, fonts });
  return rasterizeSvg(svg, { width: options.width });
}
