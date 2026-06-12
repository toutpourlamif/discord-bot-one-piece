import { ISLANDS, WORLD_EDGES, ZONE_LABELS } from '@one-piece/db';

import { PIRATA_ONE_FONT_FILE } from '../../../image-builder/fonts.js';
import { rasterizeSvg } from '../../../image-builder/rasterize-svg.js';

import { buildCloudBand, CLOUD_BLUR_FILTER } from './clouds.js';
import { WORLD_MAP_COLORS } from './palette.js';
import { WORLD_POSITIONS, WORLD_REGIONS, type WorldPoint } from './world-positions.js';

// Rendue large pour que la fenêtre zoomée de la card (cf `viewport.ts`) croppe
// des pixels nets, sans agrandissement. C'est LA constante de zoom : plus la carte
// est large, plus la fenêtre 800px de la card est zoomée.
const MAP_WIDTH = 3200;
// Marge en unités monde autour du contenu (laisse la place aux labels en bord de carte).
const WORLD_MARGIN = 80;

const ISLAND_RADIUS = 14;
const ISLAND_LABEL_SIZE = 19;
const REGION_LABEL_SIZE = 64;
const WAVE_TILE = 160;
// Bande de « terra incognita » nuageuse sur le pourtour du monde.
const CLOUD_BAND_THICKNESS = 150;

const projection = buildProjection();

export const WORLD_MAP_WIDTH = MAP_WIDTH;

export const WORLD_MAP_HEIGHT = projection.height;

/** PNG du fond de carte (rendu retina 2×), généré une seule fois au lancement du bot. */
export const worldMapPng: Buffer = rasterizeSvg(buildBackgroundSvg(), { width: MAP_WIDTH, fontFiles: [PIRATA_ONE_FONT_FILE] });

/** Coordonnées monde (cf `world-positions.ts`) → pixels dans l'image de la carte. */
export function projectToMap(point: WorldPoint): WorldPoint {
  return {
    x: (point.x - projection.minX) * projection.scale,
    y: (point.y - projection.minY) * projection.scale,
  };
}

type Projection = { minX: number; minY: number; scale: number; height: number };

// Le cadrage couvre les îles ET les boîtes de régions (plus larges que les îles).
function buildProjection(): Projection {
  const points = [...WORLD_POSITIONS.values()];
  for (const region of Object.values(WORLD_REGIONS)) {
    points.push(
      { x: region.center.x - region.width / 2, y: region.center.y - region.height / 2 },
      { x: region.center.x + region.width / 2, y: region.center.y + region.height / 2 },
    );
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs) - WORLD_MARGIN;
  const maxX = Math.max(...xs) + WORLD_MARGIN;
  const minY = Math.min(...ys) - WORLD_MARGIN;
  const maxY = Math.max(...ys) + WORLD_MARGIN;

  const scale = MAP_WIDTH / (maxX - minX);
  return { minX, minY, scale, height: Math.round((maxY - minY) * scale) };
}

function buildBackgroundSvg(): string {
  const parts: Array<string> = [];
  parts.push(
    '<defs>',
    `<linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${WORLD_MAP_COLORS.oceanLight}"/>` +
      `<stop offset="1" stop-color="${WORLD_MAP_COLORS.oceanDeep}"/>` +
      `</linearGradient>`,
    buildWavePattern(),
    CLOUD_BLUR_FILTER,
    '</defs>',
    `<rect width="${MAP_WIDTH}" height="${WORLD_MAP_HEIGHT}" fill="url(#ocean)"/>`,
    `<rect width="${MAP_WIDTH}" height="${WORLD_MAP_HEIGHT}" fill="url(#waves)"/>`,
  );

  for (const region of Object.values(WORLD_REGIONS)) {
    const topLeft = projectToMap({ x: region.center.x - region.width / 2, y: region.center.y - region.height / 2 });
    const width = region.width * projection.scale;
    const height = region.height * projection.scale;
    parts.push(
      `<rect x="${topLeft.x}" y="${topLeft.y}" width="${width}" height="${height}" rx="14" fill="${WORLD_MAP_COLORS.regionFill}" fill-opacity="0.06" stroke="${WORLD_MAP_COLORS.regionBorder}" stroke-opacity="0.3" stroke-width="1.5"/>`,
      `<text x="${topLeft.x + 16}" y="${topLeft.y + REGION_LABEL_SIZE + 6}" font-family="Pirata One" font-size="${REGION_LABEL_SIZE}" fill="${WORLD_MAP_COLORS.regionBorder}" fill-opacity="0.4">${escapeXml(region.label)}</text>`,
    );
  }

  for (const edge of WORLD_EDGES) {
    const from = WORLD_POSITIONS.get(edge.from);
    const to = WORLD_POSITIONS.get(edge.to);
    if (!from || !to) continue;
    const a = projectToMap(from);
    const b = projectToMap(to);
    const hasRequirement = (edge.requirements?.length ?? 0) > 0;
    const stroke = hasRequirement
      ? `stroke="${WORLD_MAP_COLORS.requirementEdge}" stroke-dasharray="7 5"`
      : `stroke="${WORLD_MAP_COLORS.edge}" stroke-opacity="0.55"`;
    parts.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" ${stroke} stroke-width="2"/>`);
  }

  for (const island of ISLANDS) {
    const position = WORLD_POSITIONS.get(island);
    if (!position) continue;
    const { x, y } = projectToMap(position);
    const label = escapeXml(ZONE_LABELS[island]);
    const labelY = y + ISLAND_RADIUS + ISLAND_LABEL_SIZE;
    parts.push(
      `<circle cx="${x}" cy="${y}" r="${ISLAND_RADIUS * 2.4}" fill="${WORLD_MAP_COLORS.shallows}" fill-opacity="0.14"/>`,
      `<circle cx="${x}" cy="${y + 4}" r="${ISLAND_RADIUS}" fill="#000000" fill-opacity="0.3"/>`,
      `<circle cx="${x}" cy="${y}" r="${ISLAND_RADIUS}" fill="${WORLD_MAP_COLORS.island}" stroke="${WORLD_MAP_COLORS.islandBorder}" stroke-width="2"/>`,
      `<text x="${x}" y="${labelY}" font-family="Pirata One" font-size="${ISLAND_LABEL_SIZE}" text-anchor="middle" fill="${WORLD_MAP_COLORS.label}" stroke="${WORLD_MAP_COLORS.labelOutline}" stroke-width="3" paint-order="stroke">${label}</text>`,
    );
  }

  parts.push(buildCloudBand({ width: MAP_WIDTH, height: WORLD_MAP_HEIGHT, thickness: CLOUD_BAND_THICKNESS, opacity: 0.85 }));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_WIDTH}" height="${WORLD_MAP_HEIGHT}" viewBox="0 0 ${MAP_WIDTH} ${WORLD_MAP_HEIGHT}">${parts.join('')}</svg>`;
}

// Deux petites vagues décalées en quinconce, répétées sur toute la carte.
function buildWavePattern(): string {
  const half = WAVE_TILE / 2;
  const quarter = WAVE_TILE / 4;
  const wave = (x: number, y: number) =>
    `<path d="M${x} ${y} q ${quarter / 2} -12 ${quarter} 0 t ${quarter} 0" fill="none" stroke="#ffffff" stroke-opacity="0.06" stroke-width="2"/>`;
  return (
    `<pattern id="waves" width="${WAVE_TILE}" height="${WAVE_TILE}" patternUnits="userSpaceOnUse">` +
    wave(0, quarter) +
    wave(half, WAVE_TILE - quarter) +
    `</pattern>`
  );
}

function escapeXml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
