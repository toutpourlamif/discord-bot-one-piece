// Code généré par I.A et pas vraiment relu, c'est du code interne pas exposé dans le bot, c'est seulement pour
// Générer un graph visuel avec la commande : pnpm world
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { WORLD_EDGES, ZONE_LABELS } from '@one-piece/db';
import open from 'open';

const require = createRequire(import.meta.url);
const cytoscapeJs = readFileSync(require.resolve('cytoscape/dist/cytoscape.min.js'), 'utf-8');
const dagreJs = readFileSync(require.resolve('dagre/dist/dagre.min.js'), 'utf-8');
const cytoscapeDagreJs = readFileSync(require.resolve('cytoscape-dagre'), 'utf-8');

const nodes = [...new Set(WORLD_EDGES.flatMap((edge) => [edge.from, edge.to]))].map((id) => ({
  data: { id, label: ZONE_LABELS[id] },
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
      .legend {
        position: fixed; top: 16px; left: 16px;
        background: rgba(8, 30, 48, 0.92); padding: 12px 16px;
        border-radius: 10px; line-height: 1.7;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .legend strong { color: #fbbf24; }
      .legend .req { color: #fbbf24; }
    </style>
  </head>
  <body>
    <div class="legend">
      <strong>World graph</strong><br/>
      ${nodes.length} îles, ${WORLD_EDGES.length} arêtes<br/>
      <span class="req">— — —</span> arête avec requirement
    </div>
    <div id="cy"></div>
    <script>${cytoscapeJs}</script>
    <script>${dagreJs}</script>
    <script>${cytoscapeDagreJs}</script>
    <script>
      cytoscape.use(cytoscapeDagre);
      cytoscape({
        container: document.getElementById('cy'),
        elements: {
          nodes: ${JSON.stringify(nodes)},
          edges: ${JSON.stringify(edges)},
        },
        layout: {
          name: 'dagre',
          rankDir: 'LR',
          nodeSep: 100,
          rankSep: 200,
          edgeSep: 50,
        },
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#c9a37c',
              'border-width': 4,
              'border-color': '#7c5a3a',
              'label': 'data(label)',
              'color': '#3a2a18',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-weight': 'bold',
              'font-size': 13,
              'width': 110,
              'height': 110,
              'text-wrap': 'wrap',
              'text-max-width': 95,
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
              'font-size': 15,
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
              'width': 3,
            },
          },
        ],
      });
    </script>
  </body>
</html>`;

const outPath = path.resolve(import.meta.dirname, '../world.html');
writeFileSync(outPath, html, 'utf-8');
console.log(`Rendu : ${outPath}`);
await open(outPath);
