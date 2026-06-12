import { EAST_BLUE_ISLANDS, ISLANDS, PARADISE_ISLANDS, type Island } from '@one-piece/db';

import { computeBucketDistances, separateOverlaps, smacofLayout } from './mds-layout.js';

// Positions manuelles : graine du layout MDS pour East Blue (la Grand Line est placée plus bas).
const WORLD_NODE_POSITIONS: Partial<Record<Island, WorldPoint>> = {
  satsuruzo: { x: 1585, y: -20 },
  yotsuba: { x: 1600, y: 220 },
  dawn: { x: 2010, y: 310 },
  goat: { x: 1680, y: 555 },
  mirrorball: { x: 995, y: 465 },
  nagagutsu: { x: 980, y: 180 },
  organ: { x: 1205, y: 475 },
  gecko: { x: 755, y: 755 },
  baratie: { x: 645, y: 1145 },
  conomi: { x: 165, y: 730 },
  cozia: { x: -265, y: 770 },
  frauce: { x: -90, y: 490 },
  oykot: { x: 115, y: 1320 },
  pole_star: { x: -215, y: 1785 },
  rare_animal: { x: 1170, y: 765 },
  kumate: { x: 1455, y: 770 },
  sixis: { x: 1965, y: 1020 },
  tequila_wolf: { x: 1425, y: 1795 },
};

const REGION_PADDING = 300;
const REGION_GAP = 220;
const GRAND_LINE_SPACING = 500;
const GRAND_LINE_START_OFFSET_X = 600;

export type WorldPoint = { x: number; y: number };

export type WorldRegion = {
  id: string;
  label: string;
  center: WorldPoint;
  width: number;
  height: number;
};

const layout = buildWorldLayout();

export const WORLD_POSITIONS: ReadonlyMap<Island, WorldPoint> = layout.positions;

export const WORLD_REGIONS: { eastBlue: WorldRegion; grandLine: WorldRegion } = layout.regions;

function buildWorldLayout(): { positions: Map<Island, WorldPoint>; regions: { eastBlue: WorldRegion; grandLine: WorldRegion } } {
  const positions = computeEastBluePositions(EAST_BLUE_ISLANDS);

  const eastBlueBox = boundingBox(EAST_BLUE_ISLANDS.map((id) => positions.get(id) ?? { x: 0, y: 0 }));
  const eastBlueRegion: WorldRegion = {
    id: 'east_blue',
    label: 'East Blue',
    center: {
      x: (eastBlueBox.minX + eastBlueBox.maxX) / 2,
      y: (eastBlueBox.minY + eastBlueBox.maxY) / 2,
    },
    width: eastBlueBox.maxX - eastBlueBox.minX + REGION_PADDING * 2,
    height: eastBlueBox.maxY - eastBlueBox.minY + REGION_PADDING * 2,
  };

  // Grand Line : rangée horizontale (ouest → est) sous East Blue. reverse_mountain (l'entrée)
  // part en bas-à-gauche de Loguetown (pole_star), point de sortie d'East Blue.
  const poleStarX = positions.get('pole_star')?.x ?? eastBlueRegion.center.x;
  const loguetownX = poleStarX - GRAND_LINE_START_OFFSET_X;
  const grandLineY = eastBlueRegion.center.y + eastBlueRegion.height / 2 + REGION_GAP + REGION_PADDING;
  PARADISE_ISLANDS.forEach((id, i) => {
    positions.set(id, { x: loguetownX + i * GRAND_LINE_SPACING, y: grandLineY });
  });

  const grandLineBox = boundingBox(PARADISE_ISLANDS.map((id) => positions.get(id) ?? { x: 0, y: 0 }));
  const grandLineRegion: WorldRegion = {
    id: 'grand_line_paradise',
    label: 'Grand Line Paradise',
    center: { x: (grandLineBox.minX + grandLineBox.maxX) / 2, y: grandLineY },
    width: grandLineBox.maxX - grandLineBox.minX + REGION_PADDING * 2,
    height: REGION_PADDING * 2,
  };

  return { positions, regions: { eastBlue: eastBlueRegion, grandLine: grandLineRegion } };
}

function fallbackPosition(index: number): WorldPoint {
  return {
    x: 1180 + (index % 6) * 190,
    y: 760 + Math.floor(index / 6) * 130,
  };
}

function computeEastBluePositions(eastBlueIslands: Array<Island>): Map<Island, WorldPoint> {
  const positions = new Map<Island, WorldPoint>();
  ISLANDS.forEach((id, index) => {
    // Seules les îles East Blue ont besoin d'un seed manuel : les îles Paradise sont replacées
    // en rangée juste après, leur fallback est sans effet.
    if (!WORLD_NODE_POSITIONS[id] && eastBlueIslands.includes(id)) {
      console.warn(`Île ${id} sans position manuelle dans WORLD_NODE_POSITIONS : fallback utilisé.`);
    }
    positions.set(id, WORLD_NODE_POSITIONS[id] ?? fallbackPosition(index));
  });

  const seed = eastBlueIslands.map((id) => positions.get(id) ?? { x: 0, y: 0 });
  const bucketDist = computeBucketDistances(eastBlueIslands);
  const connected = bucketDist.every((row) => row.every((d) => Number.isFinite(d)));
  if (!connected) {
    console.warn('Graphe East Blue non connexe : positions manuelles conservées.');
    return positions;
  }

  const laidOut = separateOverlaps(smacofLayout(bucketDist, seed));
  eastBlueIslands.forEach((id, i) => {
    const p = laidOut[i];
    if (p) positions.set(id, p);
  });
  return positions;
}

function boundingBox(points: Array<WorldPoint>): { minX: number; maxX: number; minY: number; maxY: number } {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}
