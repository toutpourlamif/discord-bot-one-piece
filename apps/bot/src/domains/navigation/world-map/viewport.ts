import sharp from 'sharp';

import { rasterizeSvg, RETINA_SCALE } from '../../../image-builder/rasterize-svg.js';

import { WORLD_MAP_HEIGHT, WORLD_MAP_WIDTH, worldMapPng } from './build-world-map.js';
import { buildCloudBand, CLOUD_BLUR_FILTER } from './clouds.js';
import type { WorldPoint } from './world-positions.js';

/** Fenêtre fixe affichée par la card `!ship` : zoom constant, centré sur le navire. */
export const VIEWPORT_WIDTH = 800;
export const VIEWPORT_HEIGHT = 450;

/** Brume sur les bords de la fenêtre (centre transparent), rendue une fois au lancement. */
export const cloudVignetteDataUri = renderCloudVignette();

export type Viewport = {
  dataUri: string;
  /** Coin haut-gauche du crop en pixels carte — à soustraire aux coordonnées projetées. */
  origin: WorldPoint;
};

/** Croppe le fond de carte autour de `center`, clampé pour rester dans la carte. */
export async function extractViewport(center: WorldPoint): Promise<Viewport> {
  const left = clamp(Math.round(center.x - VIEWPORT_WIDTH / 2), 0, WORLD_MAP_WIDTH - VIEWPORT_WIDTH);
  const top = clamp(Math.round(center.y - VIEWPORT_HEIGHT / 2), 0, WORLD_MAP_HEIGHT - VIEWPORT_HEIGHT);
  const png = await sharp(worldMapPng)
    .extract({
      left: left * RETINA_SCALE,
      top: top * RETINA_SCALE,
      width: VIEWPORT_WIDTH * RETINA_SCALE,
      height: VIEWPORT_HEIGHT * RETINA_SCALE,
    })
    .png()
    .toBuffer();
  return { dataUri: `data:image/png;base64,${png.toString('base64')}`, origin: { x: left, y: top } };
}

function renderCloudVignette(): string {
  const band = buildCloudBand({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT, thickness: 60, opacity: 0.5 });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${VIEWPORT_WIDTH}" height="${VIEWPORT_HEIGHT}" viewBox="0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}"><defs>${CLOUD_BLUR_FILTER}</defs>${band}</svg>`;
  return `data:image/png;base64,${rasterizeSvg(svg, { width: VIEWPORT_WIDTH }).toString('base64')}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
