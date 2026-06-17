import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { rasterizeSvg, type RasterizeSvgOptions } from './rasterize-svg.js';

const CACHE_DIR = fileURLToPath(new URL('../../../../node_modules/.cache/rasterized-svg/', import.meta.url));

/**
 * Comme `rasterizeSvg`, mais met le PNG en cache sur disque sous une clé = hash du SVG (+ largeur).
 * Tout changement du SVG (île, palette, zoom…) change le hash et force un rebuild ; sinon on relit le PNG.
 */
export function rasterizeSvgCached(svg: string, options: RasterizeSvgOptions): Buffer {
  const hash = createHash('sha1').update(`${options.width}:${svg}`).digest('hex');
  const cachePath = `${CACHE_DIR}${hash}.png`;

  try {
    return readFileSync(cachePath);
  } catch {
    const png = rasterizeSvg(svg, options);
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(cachePath, png);
    return png;
  }
}
