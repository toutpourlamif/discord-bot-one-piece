import { buildImage } from '../../../image-builder/build-image.js';
import { loadAssetDataUri } from '../../../image-builder/load-asset-data-uri.js';
import type { Character } from '../../character/types.js';

const MAX_PORTRAITS = 10;
const CELL_WIDTH = 120;
const CELL_HEIGHT = 220;
const BAND_WIDTH = 8;
const BAND_COLOR = '#000000';
const CELL_COLOR = '#1b1e2b';
const PLACEHOLDER_COLOR = '#94a3b8';
const PLACEHOLDER_FONT_SIZE = 48;

export async function buildCrewCard(crew: Array<Character>): Promise<Buffer> {
  const members = crew.slice(0, MAX_PORTRAITS);
  const portraits = await Promise.all(members.map(async (member) => (member.path ? loadPortraitOrNull(`${member.path}/info.webp`) : null)));

  const width = members.length * CELL_WIDTH + (members.length + 1) * BAND_WIDTH;
  const height = CELL_HEIGHT + 2 * BAND_WIDTH;

  return buildImage(
    <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: BAND_COLOR, gap: BAND_WIDTH, padding: BAND_WIDTH }}>
      {members.map((member, index) => (
        <div
          key={member.instanceId}
          style={{
            display: 'flex',
            width: CELL_WIDTH,
            height: CELL_HEIGHT,
            backgroundColor: CELL_COLOR,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {portraits[index] ? (
            <img src={portraits[index]} width={CELL_WIDTH} height={CELL_HEIGHT} style={{ objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: 'Lato', fontWeight: 700, fontSize: PLACEHOLDER_FONT_SIZE, color: PLACEHOLDER_COLOR }}>?</span>
          )}
        </div>
      ))}
    </div>,
    { width, height },
  );
}

/** Portrait manquant (asset pas encore fourni) = cellule vide plutôt qu'un crash de toute la carte d'équipage. */
async function loadPortraitOrNull(path: string): Promise<string | null> {
  try {
    return await loadAssetDataUri(path);
  } catch (error) {
    console.warn(`[crew-card] portrait manquant: ${path}`, error);
    return null;
  }
}
