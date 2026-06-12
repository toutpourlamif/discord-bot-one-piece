import sharp from 'sharp';

import { resolveAssetPath } from '../../../image-builder/load-asset-data-uri.js';
import { RETINA_SCALE } from '../../../image-builder/rasterize-svg.js';

import { WORLD_MAP_HEIGHT, WORLD_MAP_WIDTH, worldMapPng } from './build-world-map.js';
import type { WorldPoint } from './world-positions.js';

const VIGNETTE_SIZE = 1.75;
const VIGNETTE_BLUR = 15;
// Décale la frame vers la droite (négatif = vers la gauche), en pixels viewport.
const VIGNETTE_SHIFT_X = -20;

/** Fenêtre fixe affichée par la card `!ship` : zoom constant, centré sur le navire. */
export const VIEWPORT_WIDTH = 800;
export const VIEWPORT_HEIGHT = 450;

/** Nuages sur les bords de la fenêtre (centre transparent), rendus une fois au lancement. */
export const cloudVignetteDataUri = await renderCloudVignette();

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

async function renderCloudVignette(): Promise<string> {
  const width = Math.round(VIEWPORT_WIDTH * RETINA_SCALE * VIGNETTE_SIZE);
  const height = Math.round(VIEWPORT_HEIGHT * RETINA_SCALE * VIGNETTE_SIZE);
  const png = await sharp(resolveAssetPath('world/clouds.webp'))
    .resize(width, height, { fit: 'fill' })
    .extract({
      left: Math.round((width - VIEWPORT_WIDTH * RETINA_SCALE) / 2) - VIGNETTE_SHIFT_X * RETINA_SCALE,
      top: Math.round((height - VIEWPORT_HEIGHT * RETINA_SCALE) / 2),
      width: VIEWPORT_WIDTH * RETINA_SCALE,
      height: VIEWPORT_HEIGHT * RETINA_SCALE,
    })
    .blur(VIGNETTE_BLUR)
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString('base64')}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
