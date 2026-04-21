const ASSETS_BASE_URL = process.env.ASSETS_BASE_URL;
if (!ASSETS_BASE_URL) {
  throw new Error('ASSETS_BASE_URL manquant dans apps/bot/.env.local');
}

export function buildAssetUrl(path: string): string {
  return `${ASSETS_BASE_URL}/${path}`;
}
