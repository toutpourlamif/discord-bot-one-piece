import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ASSETS_DIR = new URL('../../../../assets/', import.meta.url);

/** On cache les promesses entières, pas seulement les résultats.
comme ça on couvre le cas où on demande deux fois la même valuer en même temps :
On fetch pas deux fois, les deux attendent la même promesse */
const cache = new Map<string, Promise<string>>();

/** Lit un asset de `/assets` et le retourne en data-URI
 * Possède un système de cache. */
export async function loadAssetDataUri(path: string): Promise<string> {
  const cached = cache.get(path);
  if (cached) return cached;

  const dataUri = readAsDataUri(path);
  cache.set(path, dataUri);
  return dataUri;
}

/** Chemin absolu d'un asset de `/assets` — pour les traitements sharp custom. */
export function resolveAssetPath(path: string): string {
  return fileURLToPath(new URL(path, ASSETS_DIR));
}

async function readAsDataUri(path: string): Promise<string> {
  // satori ne sait pas décoder le webp, il faut passer par du png
  const pngBuffer = await sharp(resolveAssetPath(path)).png().toBuffer();

  const base64 = pngBuffer.toString('base64');
  return `data:image/png;base64,${base64}`;
}
