// Code généré par I.A et pas vraiment relu, c'est du code interne pas exposé dans le bot, c'est seulement pour
// Générer un graph visuel avec la commande : pnpm world
// TODO: déplacer dans packages/db/scripts/ (à côté de studio.ts)
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { ISLANDS, SUB_ZONE_LABELS, SUB_ZONES_BY_ISLAND, WORLD_EDGES, ZONE_LABELS, type Island } from '@one-piece/db';
import open from 'open';

import { WORLD_MAP_COLORS } from '../src/domains/navigation/world-map/palette.js';
import { WORLD_POSITIONS, WORLD_REGIONS, type WorldPoint } from '../src/domains/navigation/world-map/world-positions.js';

const require = createRequire(import.meta.url);
const cytoscapeJs = readFileSync(require.resolve('cytoscape/dist/cytoscape.min.js'), 'utf-8');

const WORLD_COLORS = {
  blue: '#4472C4',
  orange: '#ED7D31',
  red: '#C00000',
  green: '#70AD47',
  black: '#000000',
  gold: '#BF8F00',
  purple: '#7030A0',
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

const LEGEND_POSITION: WorldPoint = {
  x: WORLD_REGIONS.eastBlue.center.x - WORLD_REGIONS.eastBlue.width / 2 + LEGEND_MARGIN + LEGEND_WIDTH / 2,
  y: WORLD_REGIONS.eastBlue.center.y - WORLD_REGIONS.eastBlue.height / 2 + LEGEND_MARGIN + LEGEND_HEIGHT / 2,
};

const islandNodes = ISLANDS.map((id) => ({
  data: {
    id,
    type: 'island',
    label: ZONE_LABELS[id],
    color: ISLAND_NODE_COLORS[id] ?? WORLD_MAP_COLORS.island,
    subZones: SUB_ZONES_BY_ISLAND[id].map((subZone) => SUB_ZONE_LABELS[subZone]),
  },
  position: WORLD_POSITIONS.get(id) ?? { x: 0, y: 0 },
}));

const regionNodes = Object.values(WORLD_REGIONS).map((region) => ({
  data: {
    id: `region:${region.id}`,
    type: 'region',
    label: region.label,
    width: region.width,
    height: region.height,
  },
  position: region.center,
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
    position: { x: LEGEND_POSITION.x - LEGEND_WIDTH / 2 + 30, y: LEGEND_POSITION.y - LEGEND_HEIGHT / 2 + 38 },
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
        position: { x: LEGEND_POSITION.x - LEGEND_WIDTH / 2 + 90, y },
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

const BG = WORLD_MAP_COLORS.ocean;

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
              'background-color': '${WORLD_MAP_COLORS.regionFill}',
              'background-opacity': 0.08,
              'border-width': 2,
              'border-color': '${WORLD_MAP_COLORS.regionBorder}',
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
              'border-color': '${WORLD_MAP_COLORS.islandBorder}',
              'label': 'data(label)',
              'color': '${WORLD_MAP_COLORS.label}',
              'text-outline-width': 3,
              'text-outline-color': '${WORLD_MAP_COLORS.labelOutline}',
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
              'text-halign': 'right',
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
              'text-halign': 'right',
              'text-valign': 'center',
              'text-wrap': 'wrap',
              'text-max-width': 620,
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
              'line-color': '${WORLD_MAP_COLORS.edge}',
              'source-arrow-color': '${WORLD_MAP_COLORS.edge}',
              'target-arrow-color': '${WORLD_MAP_COLORS.edge}',
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
              'line-color': '${WORLD_MAP_COLORS.requirementEdge}',
              'source-arrow-color': '${WORLD_MAP_COLORS.requirementEdge}',
              'target-arrow-color': '${WORLD_MAP_COLORS.requirementEdge}',
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
