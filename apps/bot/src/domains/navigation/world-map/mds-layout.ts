import { WORLD_EDGES, type Island } from '@one-piece/db';

import type { WorldPoint } from './world-positions.js';

// Floyd-Warshall sur le sous-graphe donné, arêtes pondérées par baseDurationBuckets.
export function computeBucketDistances(subset: Array<Island>): Array<Array<number>> {
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
export function smacofLayout(bucketDist: Array<Array<number>>, seed: Array<WorldPoint>): Array<WorldPoint> {
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
    const next: Array<WorldPoint> = Array.from({ length: n }, () => ({ x: 0, y: 0 }));
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

// Passe anti-chevauchement : le MDS colle les îles quasi-jumelles (mêmes voisins) au même
// endroit. On écarte itérativement toute paire plus proche que minDistance — les poussées
// sont symétriques, donc le centroïde (et donc le cadrage) ne bougent pas.
export function separateOverlaps(points: Array<WorldPoint>): Array<WorldPoint> {
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

function centroid(points: Array<WorldPoint>): WorldPoint {
  let x = 0;
  let y = 0;
  for (const p of points) {
    x += p.x;
    y += p.y;
  }
  return { x: x / points.length, y: y / points.length };
}
