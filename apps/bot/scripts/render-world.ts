// Code généré par I.A et pas vraiment relu, c'est du code interne pas exposé dans le bot, c'est seulement pour
// Générer un graph visuel avec la commande : pnpm world
// TODO: déplacer dans packages/db/scripts/ (à côté de studio.ts)
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { SUB_ZONE_LABELS, SUB_ZONES_BY_ISLAND, WORLD_EDGES, ZONE_LABELS, type Island } from '@one-piece/db';
import open from 'open';

const require = createRequire(import.meta.url);
const cytoscapeJs = readFileSync(require.resolve('cytoscape/dist/cytoscape.min.js'), 'utf-8');

type Position = { x: number; y: number };

const WORLD_COLORS = {
  blue: '#4472C4',
  orange: '#ED7D31',
  red: '#C00000',
  green: '#70AD47',
  black: '#000000',
  gold: '#BF8F00',
  purple: '#7030A0',
  neutral: '#c9a37c',
} as const;

const LEGEND_WIDTH = 760;
const LEGEND_HEIGHT = 330;
const LEGEND_MARGIN = 100;

const WORLD_COLOR_LEGEND = [
  { color: WORLD_COLORS.blue, label: 'Bleu : Arc Luffy / Zoro' },
  { color: WORLD_COLORS.orange, label: 'Orange : Nami / Buggy le clown' },
  { color: WORLD_COLORS.red, label: 'Rouge : Usopp / Kuro' },
  { color: WORLD_COLORS.green, label: 'Vert : Sanji' },
  { color: WORLD_COLORS.black, label: 'Noir : Arlong Park' },
  { color: WORLD_COLORS.gold, label: 'Or : en route vers Grand Line' },
  { color: WORLD_COLORS.purple, label: 'Violet : ville annexe' },
];

const ISLAND_NODE_COLORS: Partial<Record<Island, string>> = {
  satsuruzo: WORLD_COLORS.purple,
  dawn: WORLD_COLORS.blue,
  goat: WORLD_COLORS.purple,
  yotsuba: WORLD_COLORS.blue,
  mirrorball: WORLD_COLORS.purple,
  nagagutsu: WORLD_COLORS.purple,
  organ: WORLD_COLORS.orange,
  rare_animal: WORLD_COLORS.purple,
  kumate: WORLD_COLORS.purple,
  sixis: WORLD_COLORS.purple,
  tequila_wolf: WORLD_COLORS.purple,
  gecko: WORLD_COLORS.red,
  baratie: WORLD_COLORS.green,
  conomi: WORLD_COLORS.black,
  cozia: WORLD_COLORS.purple,
  frauce: WORLD_COLORS.purple,
  oykot: WORLD_COLORS.gold,
  pole_star: WORLD_COLORS.gold,
};

// Positions manuelles : graine du layout MDS pour East Blue (la Grand Line est placée plus bas).
const WORLD_NODE_POSITIONS: Partial<Record<Island, Position>> = {
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

const islands = [...new Set(WORLD_EDGES.flatMap((edge) => [edge.from, edge.to]))];

// La Grand Line (Paradise) est une chaîne linéaire, ordonnée d'ouest en est, posée en
// rangée sous East Blue. East Blue = tout le reste, placé par l'algo de layout MDS.
const GRAND_LINE_ISLANDS: Array<Island> = ['reverse_mountain', 'whisky_peak', 'little_garden', 'drum', 'alabasta', 'wano'];

const eastBlueIslands = islands.filter((id) => !GRAND_LINE_ISLANDS.includes(id));

// East Blue : positions calculées par MDS (stress majorization) — la distance à l'écran
// reflète la durée de trajet en buckets. Cf. computeWorldPositions plus bas.
const worldPositions = computeWorldPositions();

const REGION_PADDING = 300;
const REGION_GAP = 220;
const GRAND_LINE_SPACING = 500;
const GRAND_LINE_START_OFFSET_X = 600;

const eastBlueBox = boundingBox(eastBlueIslands.map((id) => worldPositions.get(id) ?? { x: 0, y: 0 }));
const EAST_BLUE_REGION = {
  id: 'region:east_blue',
  label: 'East Blue',
  position: {
    x: (eastBlueBox.minX + eastBlueBox.maxX) / 2,
    y: (eastBlueBox.minY + eastBlueBox.maxY) / 2,
  },
  width: eastBlueBox.maxX - eastBlueBox.minX + REGION_PADDING * 2,
  height: eastBlueBox.maxY - eastBlueBox.minY + REGION_PADDING * 2,
};

const LEGEND_POSITION: Position = {
  x: EAST_BLUE_REGION.position.x - EAST_BLUE_REGION.width / 2 + LEGEND_MARGIN + LEGEND_WIDTH / 2,
  y: EAST_BLUE_REGION.position.y - EAST_BLUE_REGION.height / 2 + LEGEND_MARGIN + LEGEND_HEIGHT / 2,
};

// Grand Line : rangée horizontale (ouest → est) sous East Blue. reverse_mountain (l'entrée)
// part en bas-à-gauche de Loguetown (pole_star), point de sortie d'East Blue.
const poleStarX = worldPositions.get('pole_star')?.x ?? EAST_BLUE_REGION.position.x;
const loguetownX = poleStarX - GRAND_LINE_START_OFFSET_X;
const grandLineY = EAST_BLUE_REGION.position.y + EAST_BLUE_REGION.height / 2 + REGION_GAP + REGION_PADDING;
GRAND_LINE_ISLANDS.forEach((id, i) => {
  worldPositions.set(id, { x: loguetownX + i * GRAND_LINE_SPACING, y: grandLineY });
});

const grandLineBox = boundingBox(GRAND_LINE_ISLANDS.map((id) => worldPositions.get(id) ?? { x: 0, y: 0 }));
const GRAND_LINE_REGION = {
  id: 'region:grand_line_paradise',
  label: 'Grand Line Paradise',
  position: { x: (grandLineBox.minX + grandLineBox.maxX) / 2, y: grandLineY },
  width: grandLineBox.maxX - grandLineBox.minX + REGION_PADDING * 2,
  height: REGION_PADDING * 2,
};

const islandNodes = islands.map((id) => ({
  data: {
    id,
    type: 'island',
    label: ZONE_LABELS[id],
    color: ISLAND_NODE_COLORS[id] ?? WORLD_COLORS.neutral,
    subZones: SUB_ZONES_BY_ISLAND[id].map((subZone) => SUB_ZONE_LABELS[subZone]),
  },
  position: worldPositions.get(id) ?? { x: 0, y: 0 },
}));

const regionNodes = [EAST_BLUE_REGION, GRAND_LINE_REGION].map((region) => ({
  data: {
    id: region.id,
    type: 'region',
    label: region.label,
    width: region.width,
    height: region.height,
  },
  position: region.position,
  selectable: false,
  grabbable: false,
}));

const legendNodes = [
  {
    data: {
      id: 'legend:box',
      type: 'legendBox',
      width: LEGEND_WIDTH,
      height: LEGEND_HEIGHT,
    },
    position: LEGEND_POSITION,
    selectable: false,
    grabbable: false,
  },
  {
    data: {
      id: 'legend:title',
      type: 'legendTitle',
      label: 'Légende',
    },
    position: { x: LEGEND_POSITION.x, y: LEGEND_POSITION.y - LEGEND_HEIGHT / 2 + 38 },
    selectable: false,
    grabbable: false,
  },
  ...WORLD_COLOR_LEGEND.flatMap((item, index) => {
    const y = LEGEND_POSITION.y - LEGEND_HEIGHT / 2 + 86 + index * 34;
    return [
      {
        data: {
          id: `legend:swatch:${index}`,
          type: 'legendSwatch',
          color: item.color,
        },
        position: { x: LEGEND_POSITION.x - LEGEND_WIDTH / 2 + 58, y },
        selectable: false,
        grabbable: false,
      },
      {
        data: {
          id: `legend:text:${index}`,
          type: 'legendText',
          label: item.label,
        },
        position: { x: LEGEND_POSITION.x + 130, y },
        selectable: false,
        grabbable: false,
      },
    ];
  }),
];

const BUCKET_DURATION_MIN = 15;

function formatDuration(buckets: number): string {
  const totalMin = buckets * BUCKET_DURATION_MIN;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const human = h === 0 ? `~${m}min` : m === 0 ? `~${h}h` : `~${h}h${String(m).padStart(2, '0')}`;
  return `${human}`;
}

const edges = WORLD_EDGES.map((edge) => {
  const requirementLabel = edge.requirements?.map((r) => r.name).join(', ') ?? '';
  const lines = [formatDuration(edge.baseDurationBuckets)];
  if (requirementLabel) lines.push(`needs: ${requirementLabel}`);
  return {
    data: {
      id: `${edge.from}->${edge.to}`,
      source: edge.from,
      target: edge.to,
      label: lines.join('\n'),
      hasRequirement: requirementLabel.length > 0,
      oneWay: edge.oneWay === true,
    },
  };
});

const BG = '#1e5b8a';

const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>World — One Piece Bot</title>
    <style>
      html, body { margin: 0; height: 100%; background: ${BG}; color: #f8fafc; font: 14px system-ui, sans-serif; }
      #cy { width: 100vw; height: 100vh; }
      .inspector {
        position: fixed; z-index: 10;
        background: rgba(8, 30, 48, 0.92); padding: 12px 16px;
        border-radius: 8px; line-height: 1.7;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .inspector { right: 16px; bottom: 16px; width: min(360px, calc(100vw - 32px)); }
      .inspector strong { color: #fbbf24; }
      .subzones { margin: 8px 0 0; padding-left: 18px; }
    </style>
  </head>
  <body>
    <div class="inspector" id="inspector">
      <strong>Subzones</strong><br/>
      Clique sur une île.
    </div>
    <div id="cy"></div>
    <script>${cytoscapeJs}</script>
    <script>
      const inspector = document.getElementById('inspector');
      const nodes = ${JSON.stringify([...regionNodes, ...legendNodes, ...islandNodes])};
      const edges = ${JSON.stringify(edges)};

      const cy = cytoscape({
        container: document.getElementById('cy'),
        elements: {
          nodes,
          edges,
        },
        layout: {
          name: 'preset',
          fit: true,
          padding: 90,
        },
        style: [
          {
            selector: 'node[type = "region"]',
            style: {
              'shape': 'roundrectangle',
              'width': 'data(width)',
              'height': 'data(height)',
              'background-color': '#bfdbfe',
              'background-opacity': 0.08,
              'border-width': 2,
              'border-color': '#dbeafe',
              'border-opacity': 0.3,
              'label': 'data(label)',
              'color': 'rgba(219, 234, 254, 0.34)',
              'font-size': 72,
              'font-weight': '900',
              'text-valign': 'top',
              'text-halign': 'left',
              'text-margin-x': 24,
              'text-margin-y': 18,
              'events': 'no',
              'z-index': 0,
            },
          },
          {
            selector: 'node[type = "island"]',
            style: {
              'shape': 'ellipse',
              'background-color': 'data(color)',
              'border-width': 3,
              'border-color': '#fff7d6',
              'label': 'data(label)',
              'color': '#f8fafc',
              'text-outline-width': 3,
              'text-outline-color': '#172033',
              'text-valign': 'bottom',
              'text-halign': 'center',
              'font-weight': '900',
              'font-size': 18,
              'width': 54,
              'height': 54,
              'text-margin-y': 8,
              'text-wrap': 'wrap',
              'text-max-width': 130,
              'z-index': 20,
            },
          },
          {
            selector: 'node[type = "legendBox"]',
            style: {
              'shape': 'roundrectangle',
              'width': 'data(width)',
              'height': 'data(height)',
              'background-color': '#082033',
              'background-opacity': 0.9,
              'border-width': 1,
              'border-color': 'rgba(255, 255, 255, 0.18)',
              'events': 'no',
              'z-index': 30,
            },
          },
          {
            selector: 'node[type = "legendTitle"]',
            style: {
              'width': 1,
              'height': 1,
              'background-opacity': 0,
              'border-width': 0,
              'label': 'data(label)',
              'color': '#fbbf24',
              'font-size': 24,
              'font-weight': '900',
              'text-halign': 'center',
              'text-valign': 'center',
              'text-outline-width': 0,
              'events': 'no',
              'z-index': 31,
            },
          },
          {
            selector: 'node[type = "legendText"]',
            style: {
              'width': 1,
              'height': 1,
              'background-opacity': 0,
              'border-width': 0,
              'label': 'data(label)',
              'color': '#f8fafc',
              'font-size': 15,
              'font-weight': '700',
              'text-halign': 'center',
              'text-valign': 'center',
              'text-wrap': 'wrap',
              'text-max-width': 560,
              'text-justification': 'left',
              'text-outline-width': 0,
              'events': 'no',
              'z-index': 31,
            },
          },
          {
            selector: 'node[type = "legendSwatch"]',
            style: {
              'shape': 'ellipse',
              'width': 18,
              'height': 18,
              'background-color': 'data(color)',
              'border-width': 2,
              'border-color': '#fff7d6',
              'label': '',
              'events': 'no',
              'z-index': 31,
            },
          },
          {
            selector: 'node:selected',
            style: {
              'background-color': '#fbbf24',
              'border-color': '#ffffff',
            },
          },
          {
            selector: 'edge',
            style: {
              'curve-style': 'bezier',
              'source-arrow-shape': 'triangle',
              'target-arrow-shape': 'triangle',
              'width': 3,
              'line-color': '#e2e8f0',
              'source-arrow-color': '#e2e8f0',
              'target-arrow-color': '#e2e8f0',
              'label': 'data(label)',
              'font-size': 13,
              'font-weight': 'bold',
              'color': '#f8fafc',
              'text-rotation': 'autorotate',
              'text-wrap': 'wrap',
              'text-margin-y': -14,
              'text-background-color': '${BG}',
              'text-background-opacity': 0.92,
              'text-background-padding': 6,
              'z-index': 10,
            },
          },
          {
            selector: 'edge[?oneWay]',
            style: {
              'source-arrow-shape': 'none',
            },
          },
          {
            selector: 'edge[?hasRequirement]',
            style: {
              'line-color': '#fbbf24',
              'source-arrow-color': '#fbbf24',
              'target-arrow-color': '#fbbf24',
              'line-style': 'dashed',
            },
          },
        ],
      });

      cy.on('tap', 'node[type = "island"]', (event) => {
        const node = event.target;
        const subZones = node.data('subZones');
        const list = subZones.map((subZone) => '<li>' + subZone + '</li>').join('');
        inspector.innerHTML = '<strong>' + node.data('label') + '</strong><ul class="subzones">' + list + '</ul>';
      });
    </script>
  </body>
</html>`;

const outPath = path.resolve(import.meta.dirname, '../world.html');
writeFileSync(outPath, html, 'utf-8');
console.log(`Rendu : ${outPath}`);
await open(outPath);

function fallbackPosition(index: number): Position {
  return {
    x: 1180 + (index % 6) * 190,
    y: 760 + Math.floor(index / 6) * 130,
  };
}

function computeWorldPositions(): Map<Island, Position> {
  const positions = new Map<Island, Position>();
  islands.forEach((id, index) => {
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

function boundingBox(points: Array<Position>): { minX: number; maxX: number; minY: number; maxY: number } {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

// Floyd-Warshall sur le sous-graphe East Blue, arêtes pondérées par baseDurationBuckets.
function computeBucketDistances(subset: Array<Island>): Array<Array<number>> {
  const n = subset.length;
  const idx = new Map(subset.map((id, i) => [id, i] as const));
  const dist: Array<Array<number>> = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)));
  for (const edge of WORLD_EDGES) {
    const i = idx.get(edge.from);
    const j = idx.get(edge.to);
    if (i === undefined || j === undefined) continue;
    const rowI = dist[i];
    const rowJ = dist[j];
    if (!rowI || !rowJ) continue;
    rowI[j] = Math.min(rowI[j] ?? Infinity, edge.baseDurationBuckets);
    rowJ[i] = Math.min(rowJ[i] ?? Infinity, edge.baseDurationBuckets);
  }
  for (let k = 0; k < n; k++) {
    const rowK = dist[k];
    if (!rowK) continue;
    for (let i = 0; i < n; i++) {
      const rowI = dist[i];
      const ik = rowI?.[k];
      if (!rowI || ik === undefined) continue;
      for (let j = 0; j < n; j++) {
        const kj = rowK[j];
        const ij = rowI[j];
        if (kj === undefined || ij === undefined) continue;
        if (ik + kj < ij) rowI[j] = ik + kj;
      }
    }
  }
  return dist;
}

// MDS par stress majorization (SMACOF) : déplace les points pour que les distances
// euclidiennes collent aux distances-cibles. La graine est la carte manuelle, ce qui
// garde l'orientation/cadrage habituels — seul l'espacement est recalculé.
function smacofLayout(bucketDist: Array<Array<number>>, seed: Array<Position>): Array<Position> {
  const iterations = 400;
  const n = seed.length;

  // Échelle : on cale la somme des distances-cibles sur celle de la graine pour
  // conserver la taille globale de la carte actuelle.
  let seedSum = 0;
  let bucketSum = 0;
  for (let i = 0; i < n; i++) {
    const pi = seed[i];
    const row = bucketDist[i];
    if (!pi || !row) continue;
    for (let j = i + 1; j < n; j++) {
      const pj = seed[j];
      const target = row[j];
      if (!pj || target === undefined) continue;
      seedSum += Math.hypot(pi.x - pj.x, pi.y - pj.y);
      bucketSum += target;
    }
  }
  const scale = bucketSum > 0 ? seedSum / bucketSum : 1;

  let pos = seed.map((p) => ({ x: p.x, y: p.y }));
  for (let iter = 0; iter < iterations; iter++) {
    const next: Array<Position> = Array.from({ length: n }, () => ({ x: 0, y: 0 }));
    for (let i = 0; i < n; i++) {
      const pi = pos[i];
      const ni = next[i];
      const row = bucketDist[i];
      if (!pi || !ni || !row) continue;
      // Transformation de Guttman : x_i ← (1/n) Σ_j B_ij x_j
      let bii = 0;
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const pj = pos[j];
        const target = row[j];
        if (!pj || target === undefined) continue;
        const d = Math.hypot(pi.x - pj.x, pi.y - pj.y);
        const bij = d > 1e-9 ? -(target * scale) / d : 0;
        bii -= bij;
        ni.x += bij * pj.x;
        ni.y += bij * pj.y;
      }
      ni.x = (ni.x + bii * pi.x) / n;
      ni.y = (ni.y + bii * pi.y) / n;
    }
    pos = next;
  }

  // SMACOF recentre le nuage sur l'origine : on le retranslate sur le centroïde de la graine.
  const seedCentroid = centroid(seed);
  const posCentroid = centroid(pos);
  for (const p of pos) {
    p.x += seedCentroid.x - posCentroid.x;
    p.y += seedCentroid.y - posCentroid.y;
  }
  return pos;
}

function centroid(points: Array<Position>): Position {
  let x = 0;
  let y = 0;
  for (const p of points) {
    x += p.x;
    y += p.y;
  }
  return { x: x / points.length, y: y / points.length };
}

// Passe anti-chevauchement : le MDS colle les îles quasi-jumelles (mêmes voisins) au même
// endroit. On écarte itérativement toute paire plus proche que minDistance — les poussées
// sont symétriques, donc le centroïde (et donc le cadrage) ne bougent pas.
function separateOverlaps(points: Array<Position>): Array<Position> {
  const minDistance = 160;
  const iterations = 200;
  const pos = points.map((p) => ({ x: p.x, y: p.y }));
  const n = pos.length;
  for (let iter = 0; iter < iterations; iter++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const pi = pos[i];
        const pj = pos[j];
        if (!pi || !pj) continue;
        let dx = pj.x - pi.x;
        let dy = pj.y - pi.y;
        let d = Math.hypot(dx, dy);
        if (d >= minDistance) continue;
        // Deux îles pile au même point : on les sépare sur un axe déterministe.
        if (d < 1e-9) {
          dx = 1;
          dy = 0;
          d = 1;
        }
        const push = (minDistance - d) / 2;
        pi.x -= (dx / d) * push;
        pi.y -= (dy / d) * push;
        pj.x += (dx / d) * push;
        pj.y += (dy / d) * push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return pos;
}
