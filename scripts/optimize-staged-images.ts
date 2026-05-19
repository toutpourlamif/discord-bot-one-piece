// VIBE CODÉ, PEUT ÊTRE OPTIMISÉ MAIS PAS BESOIN POUR L'INSTANT
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';

const ASSETS_PREFIX = 'assets/';
const SOURCE_EXTENSIONS = new Set<string>(['.png', '.jpg', '.jpeg']);
const MAX_DIMENSION = 1024;
const TARGET_BYTES = 150 * 1024;
const QUALITY_STEPS: Array<number> = [90, 85, 80, 75, 70];

type Conversion = {
  sourcePath: string;
  targetPath: string;
  sourceBytes: number;
  outputBytes: number;
  quality: number;
  resized: boolean;
};

function listStagedImages(): Array<string> {
  const raw = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], { encoding: 'utf-8' });
  return raw
    .split('\0')
    .filter((line) => line.length > 0)
    .filter((file) => file.startsWith(ASSETS_PREFIX))
    .filter((file) => SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()));
}

async function convertOne(sourcePath: string): Promise<Conversion> {
  const targetPath = sourcePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

  if (existsSync(targetPath)) {
    throw new Error(`Conflit : "${targetPath}" existe déjà. Supprime-le ou renomme "${sourcePath}" avant de commit.`);
  }

  const input = readFileSync(sourcePath);
  const metadata = await sharp(input).metadata();
  const longSide = Math.max(metadata.width, metadata.height);
  const needsResize = longSide > MAX_DIMENSION;

  let outputBuffer: Buffer | null = null;
  let chosenQuality = QUALITY_STEPS[0]!;

  for (const quality of QUALITY_STEPS) {
    let pipeline = sharp(input);
    if (needsResize) {
      pipeline = pipeline.resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
    const encoded = await pipeline.webp({ quality }).toBuffer();
    outputBuffer = encoded;
    chosenQuality = quality;
    if (encoded.length <= TARGET_BYTES) break;
  }

  if (outputBuffer === null) {
    throw new Error(`Échec d'encodage WebP pour "${sourcePath}".`);
  }

  const sourceBytes = statSync(sourcePath).size;
  writeFileSync(targetPath, outputBuffer);
  unlinkSync(sourcePath);

  execFileSync('git', ['rm', '--quiet', '--cached', sourcePath]);
  execFileSync('git', ['add', targetPath]);

  return {
    sourcePath,
    targetPath,
    sourceBytes,
    outputBytes: outputBuffer.length,
    quality: chosenQuality,
    resized: needsResize,
  };
}

function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function logConversion(result: Conversion): void {
  const resizeNote = result.resized ? ' (resize → ≤1024)' : '';
  console.log(
    `  ${result.sourcePath} (${formatKb(result.sourceBytes)})` +
      ` → ${result.targetPath} (${formatKb(result.outputBytes)}, q=${result.quality})${resizeNote}`,
  );
  if (result.outputBytes > TARGET_BYTES) {
    console.log(
      `    ⚠ Poids ${formatKb(result.outputBytes)} > cible ${formatKb(TARGET_BYTES)} même à qualité 70 — pense à réduire le contenu source.`,
    );
  }
}

async function main(): Promise<void> {
  const staged = listStagedImages();
  if (staged.length === 0) return;

  console.log(`🖼  Conversion WebP de ${staged.length} image(s) staged…`);
  for (const file of staged) {
    const result = await convertOne(file);
    logConversion(result);
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`✖ optimize-staged-images : ${message}`);
  process.exit(1);
});
