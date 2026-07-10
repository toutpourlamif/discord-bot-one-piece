// VIBE-CODÉ
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const CLOUDFLARE_PAGES_PROJECT = 'discord-bot-one-piece';
const ENV_LOCAL_PATH = 'apps/bot/.env.local';
const ASSETS_BASE_URL_KEY = 'ASSETS_BASE_URL';
// Cloudflare tronque l'alias de branche à 28 caractères après normalisation.
const BRANCH_ALIAS_MAX_LENGTH = 28;

function getCurrentBranch(): string {
  const branch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf-8' }).trim();
  if (!branch) throw new Error('Impossible de déterminer la branche courante (HEAD détaché ?).');
  return branch;
}

// Reproduit la normalisation Cloudflare Pages : minuscule, tout caractère non alphanumérique → "-".
function buildBranchAlias(branch: string): string {
  return branch
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, BRANCH_ALIAS_MAX_LENGTH);
}

function updateAssetsBaseUrl(previewUrl: string): void {
  if (!existsSync(ENV_LOCAL_PATH)) throw new Error(`"${ENV_LOCAL_PATH}" introuvable — copie "${ENV_LOCAL_PATH}.example" d'abord.`);

  const envContent = readFileSync(ENV_LOCAL_PATH, 'utf-8');
  const assetsBaseUrlLinePattern = new RegExp(`^${ASSETS_BASE_URL_KEY}=.*$`, 'm');
  const assetsLine = `${ASSETS_BASE_URL_KEY}=${previewUrl}`;

  const updatedContent = assetsBaseUrlLinePattern.test(envContent)
    ? envContent.replace(assetsBaseUrlLinePattern, assetsLine)
    : `${envContent.trimEnd()}\n${assetsLine}\n`;

  writeFileSync(ENV_LOCAL_PATH, updatedContent);
}

function main(): void {
  const branch = getCurrentBranch();
  const alias = buildBranchAlias(branch);
  const previewUrl = `https://${alias}.${CLOUDFLARE_PAGES_PROJECT}.pages.dev`;

  updateAssetsBaseUrl(previewUrl);
  console.log(`✔ ${ASSETS_BASE_URL_KEY} (${ENV_LOCAL_PATH}) → ${previewUrl}`);
}

main();
