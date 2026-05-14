import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import open from 'open';

import { ZONE_GRAPH } from '../src/domains/navigation/world.js';

const require = createRequire(import.meta.url);
const cytoscapeJs = readFileSync(require.resolve('cytoscape/dist/cytoscape.min.js'), 'utf-8');

const nodes = [...new Set(ZONE_GRAPH.flatMap((edge) => [edge.from, edge.to]))].map((id) => ({
  data: { id, label: id },
}));

const edges = ZONE_GRAPH.map((edge) => {
  const requirementLabel = edge.requirements?.map((r) => r.name).join(', ') ?? '';
  const lines = [edge.via, `${edge.baseDurationBuckets} buckets`];
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

const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>World — One Piece Bot</title>
    <style>
      html, body { margin: 0; height: 100%; background: #0e1116; color: #e6edf3; font: 14px system-ui, sans-serif; }
      #cy { width: 100vw; height: 100vh; }
      .legend {
        position: fixed; top: 12px; left: 12px;
        background: rgba(20, 24, 32, 0.92); padding: 10px 14px;
        border-radius: 8px; line-height: 1.6;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }
      .legend strong { color: #58a6ff; }
      .legend .req { color: #ffa657; }
    </style>
  </head>
  <body>
    <div class="legend">
      <strong>World graph</strong><br/>
      ${nodes.length} îles, ${ZONE_GRAPH.length} arêtes<br/>
      <span class="req">— — —</span> arête avec requirement
    </div>
    <div id="cy"></div>
    <script>${cytoscapeJs}</script>
    <script>
      cytoscape({
        container: document.getElementById('cy'),
        elements: {
          nodes: ${JSON.stringify(nodes)},
          edges: ${JSON.stringify(edges)},
        },
        layout: { name: 'breadthfirst', directed: true, padding: 40, spacingFactor: 1.5 },
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#58a6ff',
              'label': 'data(label)',
              'color': '#fff',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-weight': 'bold',
              'font-size': 12,
              'width': 90,
              'height': 90,
              'text-wrap': 'wrap',
              'text-max-width': 80,
            },
          },
          {
            selector: 'edge',
            style: {
              'curve-style': 'bezier',
              'target-arrow-shape': 'triangle',
              'width': 2,
              'line-color': '#6e7681',
              'target-arrow-color': '#6e7681',
              'label': 'data(label)',
              'font-size': 10,
              'color': '#e6edf3',
              'text-rotation': 'autorotate',
              'text-wrap': 'wrap',
              'text-margin-y': -10,
              'text-background-color': '#0e1116',
              'text-background-opacity': 0.85,
              'text-background-padding': 4,
            },
          },
          {
            selector: 'edge[?hasRequirement]',
            style: {
              'line-color': '#ffa657',
              'target-arrow-color': '#ffa657',
              'line-style': 'dashed',
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
