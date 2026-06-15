import { WORLD_MAP_COLORS } from './palette.js';

// Chaque nuage = un amas de cercles qui se chevauchent, le flou fait le reste.
const PUFFS = [
  { dx: 0, dy: 0, k: 1 },
  { dx: -0.9, dy: 0.15, k: 0.7 },
  { dx: 0.9, dy: 0.1, k: 0.65 },
  { dx: -0.45, dy: -0.4, k: 0.6 },
  { dx: 0.5, dy: -0.35, k: 0.55 },
];

/** À insérer dans le `<defs>` du SVG hôte avant d'utiliser `buildCloudBand`. */
export const CLOUD_BLUR_FILTER =
  '<filter id="cloud-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>';

type CloudBandParams = {
  width: number;
  height: number;
  /** Profondeur de la bande de nuages depuis le bord, en pixels. */
  thickness: number;
  opacity: number;
};

/** Bande de nuages le long des 4 bords d'un rectangle. Déterministe : même rect → même rendu. */
export function buildCloudBand({ width, height, thickness, opacity }: CloudBandParams): string {
  const clouds: Array<string> = [];
  const step = thickness * 0.8;
  let seed = 0;
  for (let x = 0; x <= width; x += step) {
    clouds.push(buildCloud(x, jitter(seed) * thickness * 0.4, thickness, seed++));
    clouds.push(buildCloud(x, height - jitter(seed) * thickness * 0.4, thickness, seed++));
  }
  for (let y = step; y <= height - step; y += step) {
    clouds.push(buildCloud(jitter(seed) * thickness * 0.4, y, thickness, seed++));
    clouds.push(buildCloud(width - jitter(seed) * thickness * 0.4, y, thickness, seed++));
  }
  return `<g filter="url(#cloud-blur)" opacity="${opacity}">${clouds.join('')}</g>`;
}

function buildCloud(cx: number, cy: number, thickness: number, seed: number): string {
  const r = thickness * (0.32 + jitter(seed * 13.7) * 0.18);
  return PUFFS.map(
    (puff) =>
      `<circle cx="${(cx + puff.dx * r).toFixed(1)}" cy="${(cy + puff.dy * r).toFixed(1)}" r="${(r * puff.k).toFixed(1)}" fill="${WORLD_MAP_COLORS.cloud}"/>`,
  ).join('');
}

// Pseudo-aléatoire déterministe dans [0, 1) — pas de Math.random pour des rendus stables.
function jitter(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
