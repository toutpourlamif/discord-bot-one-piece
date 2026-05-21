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

const WORLD_NODE_POSITIONS: Partial<Record<Island, Position>> = {
  satsuruzo: { x: 140, y: 240 },
  yotsuba: { x: 450, y: 140 },
  dawn: { x: 665, y: 455 },
  goat: { x: 450, y: 675 },
  loguetown: { x: 900, y: 500 },
  reverse_mountain: { x: 1110, y: 500 },
  whisky_peak: { x: 1320, y: 500 },
  little_garden: { x: 1530, y: 500 },
  drum: { x: 1740, y: 500 },
  alabasta: { x: 1950, y: 500 },
  wano: { x: 2160, y: 500 },
};

const islands = [...new Set(WORLD_EDGES.flatMap((edge) => [edge.from, edge.to]))] as Array<Island>;
const nodes = islands.map((id, index) => ({
  data: {
    id,
    label: ZONE_LABELS[id],
    subZones: SUB_ZONES_BY_ISLAND[id].map((subZone) => SUB_ZONE_LABELS[subZone]),
  },
  position: WORLD_NODE_POSITIONS[id] ?? fallbackPosition(index),
}));

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
  const lines = [ZONE_LABELS[edge.via], formatDuration(edge.baseDurationBuckets)];
  if (requirementLabel) lines.push(`needs: ${requirementLabel}`);
  return {
    data: {
      id: `${edge.from}->${edge.to}`,
      source: edge.from,
      target: edge.to,
      label: lines.join('\n'),
      hasRequirement: requirementLabel.length > 0,
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
      .legend, .inspector {
        position: fixed; z-index: 10;
        background: rgba(8, 30, 48, 0.92); padding: 12px 16px;
        border-radius: 8px; line-height: 1.7;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .legend { top: 16px; left: 16px; }
      .inspector { right: 16px; bottom: 16px; width: min(360px, calc(100vw - 32px)); }
      .legend strong, .inspector strong { color: #fbbf24; }
      .legend .req { color: #fbbf24; }
      .subzones { margin: 8px 0 0; padding-left: 18px; }
    </style>
  </head>
  <body>
    <div class="legend">
      <strong>World graph</strong><br/>
      ${nodes.length} îles, ${WORLD_EDGES.length} arêtes<br/>
      <span class="req">— — —</span> arête avec requirement<br/>
      Clique une île pour voir ses subzones.
    </div>
    <div class="inspector" id="inspector">
      <strong>Subzones</strong><br/>
      Clique sur une île.
    </div>
    <div id="cy"></div>
    <script>${cytoscapeJs}</script>
    <script>
      const inspector = document.getElementById('inspector');
      const cy = cytoscape({
        container: document.getElementById('cy'),
        elements: {
          nodes: ${JSON.stringify(nodes)},
          edges: ${JSON.stringify(edges)},
        },
        layout: {
          name: 'preset',
          fit: true,
          padding: 90,
        },
        style: [
          {
            selector: 'node',
            style: {
              'shape': 'ellipse',
              'background-color': '#c9a37c',
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
              'target-arrow-shape': 'triangle',
              'width': 3,
              'line-color': '#e2e8f0',
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
            },
          },
          {
            selector: 'edge[?hasRequirement]',
            style: {
              'line-color': '#fbbf24',
              'target-arrow-color': '#fbbf24',
              'line-style': 'dashed',
            },
          },
        ],
      });

      cy.on('tap', 'node', (event) => {
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
