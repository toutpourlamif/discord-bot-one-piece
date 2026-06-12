import type { Player } from '@one-piece/db';

import { buildImage } from '../../../image-builder/build-image.js';
import { getNowBucketId } from '../../event/engine/bucket.js';
import { isSea } from '../../navigation/utils/index.js';
import { projectToMap, WORLD_MAP_HEIGHT, WORLD_MAP_WIDTH } from '../../navigation/world-map/build-world-map.js';
import { cloudVignetteDataUri, extractViewport, VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from '../../navigation/world-map/viewport.js';
import { WORLD_POSITIONS, type WorldPoint } from '../../navigation/world-map/world-positions.js';

const SHIP_MARKER_SIZE = 22;
const MARKER_COLOR = '#fbbf24';
const ROUTE_COLOR = '#ffd166';

export async function buildShipCard(player: Player): Promise<Buffer> {
  const marker = computeShipMarker(player);

  // Zoom fixe : on croppe le fond autour du navire (ou du centre de la carte à défaut),
  // puis on replace marqueur et route dans le repère du crop.
  const viewport = await extractViewport(marker.position ?? { x: WORLD_MAP_WIDTH / 2, y: WORLD_MAP_HEIGHT / 2 });
  const position = marker.position && toViewport(marker.position, viewport.origin);
  // satori applique l'overflow sur la boîte avant rotation, ce qui tronquerait la ligne :
  // on clippe le segment nous-mêmes au cadre, pas de clip CSS.
  const route =
    marker.route &&
    clipRouteToViewport({ from: toViewport(marker.route.from, viewport.origin), to: toViewport(marker.route.to, viewport.origin) });

  return buildImage(
    <div style={{ display: 'flex', position: 'relative', width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT }}>
      <img src={viewport.dataUri} width={VIEWPORT_WIDTH} height={VIEWPORT_HEIGHT} />
      <img
        src={cloudVignetteDataUri}
        width={VIEWPORT_WIDTH}
        height={VIEWPORT_HEIGHT}
        style={{ position: 'absolute', top: 0, left: 0, opacity: 0.6 }}
      />
      {route && buildRouteLine(route)}
      {position && (
        <div
          style={{
            position: 'absolute',
            left: position.x - SHIP_MARKER_SIZE / 2,
            top: position.y - SHIP_MARKER_SIZE / 2,
            width: SHIP_MARKER_SIZE,
            height: SHIP_MARKER_SIZE,
            borderRadius: '50%',
            backgroundColor: MARKER_COLOR,
            border: '3px solid #ffffff',
          }}
        />
      )}
    </div>,
    { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
  );
}

// TODO: toViewport + clipRouteToViewport = géométrie pure du cadre, à déplacer dans world-map/viewport.ts
function toViewport(point: WorldPoint, origin: WorldPoint): WorldPoint {
  return { x: point.x - origin.x, y: point.y - origin.y };
}

type Route = { from: WorldPoint; to: WorldPoint };

// À quai : marqueur sur l'île. En mer : interpolé entre l'île de départ et la cible
// selon la progression en buckets. Sans origine retrouvable : pas de marqueur.
function computeShipMarker(player: Player): { position: WorldPoint | null; route: Route | null } {
  if (!isSea(player.currentZone)) {
    const islandWorld = WORLD_POSITIONS.get(player.currentZone);
    return { position: islandWorld ? projectToMap(islandWorld) : null, route: null };
  }

  const originWorld = player.travelStartZone ? WORLD_POSITIONS.get(player.travelStartZone) : undefined;
  const targetWorld = player.travelTargetZone ? WORLD_POSITIONS.get(player.travelTargetZone) : undefined;
  if (!originWorld || !targetWorld || player.travelStartedBucket === null || player.travelEtaBucket === null) {
    return { position: null, route: null };
  }

  const origin = projectToMap(originWorld);
  const target = projectToMap(targetWorld);
  const duration = player.travelEtaBucket - player.travelStartedBucket;
  const progress = duration <= 0 ? 1 : clamp((getNowBucketId() - player.travelStartedBucket) / duration, 0, 1);
  return {
    position: {
      x: origin.x + (target.x - origin.x) * progress,
      y: origin.y + (target.y - origin.y) * progress,
    },
    route: { from: origin, to: target },
  };
}

// Liang-Barsky : restreint le segment au cadre [0, VIEWPORT_WIDTH] × [0, VIEWPORT_HEIGHT].
function clipRouteToViewport(route: Route): Route | null {
  const dx = route.to.x - route.from.x;
  const dy = route.to.y - route.from.y;
  let t0 = 0;
  let t1 = 1;
  const edges: Array<[number, number]> = [
    [-dx, route.from.x],
    [dx, VIEWPORT_WIDTH - route.from.x],
    [-dy, route.from.y],
    [dy, VIEWPORT_HEIGHT - route.from.y],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }
    const t = q / p;
    if (p < 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
    if (t0 > t1) return null;
  }
  return {
    from: { x: route.from.x + t0 * dx, y: route.from.y + t0 * dy },
    to: { x: route.from.x + t1 * dx, y: route.from.y + t1 * dy },
  };
}

// TODO: enlever les route lines
function buildRouteLine(route: Route) {
  const dx = route.to.x - route.from.x;
  const dy = route.to.y - route.from.y;
  const length = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <div
      style={{
        position: 'absolute',
        left: route.from.x,
        top: route.from.y,
        width: length,
        height: 0,
        borderTop: `3px dashed ${ROUTE_COLOR}`,
        transform: `rotate(${angle}deg)`,
        transformOrigin: 'left center',
      }}
    />
  );
}

// TODO: utiliser clamp de lodash
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
