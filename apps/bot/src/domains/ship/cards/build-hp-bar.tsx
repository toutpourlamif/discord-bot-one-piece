// VIBECODÉ
import type { Ship } from '@one-piece/db';
import clamp from 'lodash/clamp.js';

import { EMBED_COLORS } from '../../../discord/branding.js';
import { convertJsHexToCssHex } from '../../../discord/utils/index.js';
import { getMaxHpForHullLevel } from '../utils/index.js';

const TRACK_WIDTH = 220;
const TRACK_COLOR = '#2a2f3f';
const TEXT_COLOR = '#f8fafc';
const BACKDROP_COLOR = 'rgba(0, 0, 0, 0.1)';
const DROP_SHADOW = '0 2px 6px rgba(0, 0, 0, 0.35)';

/** Overlay HP posé en haut à gauche de la card : fond sombre translucide + ombre pour rester lisible sur la carte. */
export function buildHpBar(ship: Ship) {
  const maxHp = getMaxHpForHullLevel(ship.hullLevel);
  const ratio = clamp(ship.hp / maxHp, 0, 1);

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 18px',
        backgroundColor: BACKDROP_COLOR,
        borderRadius: 14,
        boxShadow: DROP_SHADOW,
      }}
    >
      <span style={{ fontFamily: 'Pirata One', fontSize: 32, color: TEXT_COLOR }}>HP</span>
      <div style={{ display: 'flex', width: TRACK_WIDTH, height: 14, backgroundColor: TRACK_COLOR, borderRadius: 7 }}>
        <div style={{ display: 'flex', width: ratio * TRACK_WIDTH, height: '100%', backgroundColor: hpColor(ratio), borderRadius: 7 }} />
      </div>
      <span style={{ fontFamily: 'Lato', fontWeight: 700, fontSize: 24, color: TEXT_COLOR }}>
        {ship.hp}/{maxHp}
      </span>
    </div>
  );
}

function hpColor(ratio: number): string {
  if (ratio > 0.5) return convertJsHexToCssHex(EMBED_COLORS.success);
  if (ratio > 0.25) return convertJsHexToCssHex(EMBED_COLORS.warn);
  return convertJsHexToCssHex(EMBED_COLORS.error);
}
