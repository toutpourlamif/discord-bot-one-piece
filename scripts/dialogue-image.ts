import { execFile } from 'node:child_process';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHARACTERS_DIR = path.join(ROOT_DIR, 'assets/characters');
const PORT = Number(process.env.PORT ?? 5174);
const OUTPUT_SIZE = 512;
const LIGHT_BORDER_RGB = 238;
const GRID_SEPARATOR_RATIO = 0.94;
const EDGE_TRIM_RATIO = 0.88;
const SUBJECT_PADDING_PERCENT = 4;
const PORTRAIT_ZOOM_RATIO = 0.84;
const SHEET = {
  rows: 2,
  columns: 3,
  emotions: ['happy', 'crying', 'scared', 'laughing', 'thinking', 'angry'],
} as const;

type CharacterOption = {
  label: string;
  value: string;
};

type DialogueEmotion = (typeof SHEET.emotions)[number];

type SliceResult = {
  emotion: DialogueEmotion;
  path: string;
  bytes: number;
};

type Segment = {
  start: number;
  end: number;
};

type GridBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type RawImage = {
  data: Buffer;
  width: number;
  height: number;
  channels: number;
};

async function listCharacterFolders(): Promise<Array<CharacterOption>> {
  const folders: Array<CharacterOption> = [];

  async function walk(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    const hasSubdirectory = entries.some((entry) => entry.isDirectory());
    const hasCharacterImage = entries.some(
      (entry) => entry.isFile() && (entry.name === 'info.webp' || /^dialogue-.+\.webp$/.test(entry.name)),
    );
    const isLeafCharacterDirectory = !hasSubdirectory && directory !== CHARACTERS_DIR;

    if (hasCharacterImage || isLeafCharacterDirectory) {
      const relative = path.relative(CHARACTERS_DIR, directory);
      folders.push({ label: relative, value: relative });
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        await walk(path.join(directory, entry.name));
      }
    }
  }

  await walk(CHARACTERS_DIR);
  return folders.sort((left, right) => left.label.localeCompare(right.label));
}

async function readRequestBody(request: IncomingMessage): Promise<Buffer> {
  const chunks: Array<Buffer> = [];

  for await (const chunk of request) {
    const value = chunk as unknown;
    if (typeof value === 'string') {
      chunks.push(Buffer.from(value));
    } else if (Buffer.isBuffer(value)) {
      chunks.push(value);
    } else if (value instanceof Uint8Array) {
      chunks.push(Buffer.from(value));
    } else {
      throw new Error('Chunk HTTP illisible.');
    }
  }

  return Buffer.concat(chunks);
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function sendHtml(response: ServerResponse): void {
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  response.end(buildPage());
}

function isSafeCharacterPath(value: string): boolean {
  return value.length > 0 && !path.isAbsolute(value) && !value.split(/[\\/]/).includes('..');
}

function resolveCharacterDirectory(character: string): string {
  if (!isSafeCharacterPath(character)) {
    throw new Error('Dossier de personnage invalide.');
  }

  return path.join(CHARACTERS_DIR, character);
}

function isLightPixel(data: Buffer, offset: number, channels: number): boolean {
  const red = data[offset] ?? 0;
  const green = data[offset + 1] ?? 0;
  const blue = data[offset + 2] ?? 0;
  const alpha = channels > 3 ? (data[offset + 3] ?? 255) : 255;

  return alpha < 12 || (red >= LIGHT_BORDER_RGB && green >= LIGHT_BORDER_RGB && blue >= LIGHT_BORDER_RGB);
}

function isSubjectPixel(data: Buffer, offset: number, channels: number): boolean {
  if (channels > 3 && (data[offset + 3] ?? 255) < 12) return false;

  const red = data[offset] ?? 0;
  const green = data[offset + 1] ?? 0;
  const blue = data[offset + 2] ?? 0;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);

  if (max < 95) return true;
  if (red > blue + 28 && green > blue - 12) return true;
  if (green > red + 18 && green > blue - 8) return true;
  if (red > 150 && green > 105 && blue < 95) return true;

  return max - min > 72 && !(blue > red + 30 && blue > green + 10);
}

function isSkinPixel(data: Buffer, offset: number, channels: number): boolean {
  if (channels > 3 && (data[offset + 3] ?? 255) < 12) return false;

  const red = data[offset] ?? 0;
  const green = data[offset + 1] ?? 0;
  const blue = data[offset + 2] ?? 0;

  return red > 105 && green > 65 && blue < 175 && red > blue + 18 && green > blue + 4 && red >= green - 8;
}

function getLightColumnRatio(data: Buffer, width: number, height: number, channels: number, x: number): number {
  let light = 0;
  for (let y = 0; y < height; y += 1) {
    if (isLightPixel(data, (y * width + x) * channels, channels)) {
      light += 1;
    }
  }
  return light / height;
}

function getLightRowRatio(data: Buffer, width: number, channels: number, y: number): number {
  let light = 0;
  for (let x = 0; x < width; x += 1) {
    if (isLightPixel(data, (y * width + x) * channels, channels)) {
      light += 1;
    }
  }
  return light / width;
}

function getBoxColumnLightRatio(raw: RawImage, box: GridBox, x: number): number {
  let light = 0;
  for (let y = box.top; y < box.top + box.height; y += 1) {
    if (isLightPixel(raw.data, (y * raw.width + x) * raw.channels, raw.channels)) {
      light += 1;
    }
  }
  return light / box.height;
}

function getBoxRowLightRatio(raw: RawImage, box: GridBox, y: number): number {
  let light = 0;
  for (let x = box.left; x < box.left + box.width; x += 1) {
    if (isLightPixel(raw.data, (y * raw.width + x) * raw.channels, raw.channels)) {
      light += 1;
    }
  }
  return light / box.width;
}

function buildSegments(length: number, isSeparator: (index: number) => boolean): Array<Segment> {
  const segments: Array<Segment> = [];
  let start: number | null = null;

  for (let index = 0; index < length; index += 1) {
    if (isSeparator(index)) {
      if (start !== null) {
        segments.push({ start, end: index - 1 });
        start = null;
      }
    } else {
      start ??= index;
    }
  }

  if (start !== null) {
    segments.push({ start, end: length - 1 });
  }

  return segments.filter((segment) => segment.end - segment.start + 1 >= 64);
}

function findRegularSegments(segments: Array<Segment>, expectedCount: number): Array<Segment> | null {
  if (segments.length < expectedCount) return null;

  const sorted = [...segments].sort((left, right) => right.end - right.start - (left.end - left.start));
  const selected = sorted.slice(0, expectedCount).sort((left, right) => left.start - right.start);

  return selected.length === expectedCount ? selected : null;
}

function detectGridBoxes(raw: RawImage): Array<GridBox> | null {
  const columnSegments = findRegularSegments(
    buildSegments(raw.width, (x) => getLightColumnRatio(raw.data, raw.width, raw.height, raw.channels, x) >= GRID_SEPARATOR_RATIO),
    SHEET.columns,
  );
  const rowSegments = findRegularSegments(
    buildSegments(raw.height, (y) => getLightRowRatio(raw.data, raw.width, raw.channels, y) >= GRID_SEPARATOR_RATIO),
    SHEET.rows,
  );

  if (columnSegments === null || rowSegments === null) {
    return null;
  }

  const boxes: Array<GridBox> = [];
  for (const row of rowSegments) {
    for (const column of columnSegments) {
      boxes.push({
        left: column.start,
        top: row.start,
        width: column.end - column.start + 1,
        height: row.end - row.start + 1,
      });
    }
  }

  return boxes;
}

function buildFallbackGridBoxes(width: number, height: number): Array<GridBox> {
  const cellWidth = Math.floor(width / SHEET.columns);
  const cellHeight = Math.floor(height / SHEET.rows);
  const boxes: Array<GridBox> = [];

  for (let index = 0; index < SHEET.rows * SHEET.columns; index += 1) {
    const left = (index % SHEET.columns) * cellWidth;
    const top = Math.floor(index / SHEET.columns) * cellHeight;
    boxes.push({
      left,
      top,
      width: Math.min(cellWidth, width - left),
      height: Math.min(cellHeight, height - top),
    });
  }

  return boxes;
}

function trimLightEdges(raw: RawImage, box: GridBox): GridBox {
  let left = box.left;
  let right = box.left + box.width - 1;
  let top = box.top;
  let bottom = box.top + box.height - 1;

  while (
    right - left + 1 > 64 &&
    getBoxColumnLightRatio(raw, { left, top, width: right - left + 1, height: bottom - top + 1 }, left) >= EDGE_TRIM_RATIO
  ) {
    left += 1;
  }

  while (
    right - left + 1 > 64 &&
    getBoxColumnLightRatio(raw, { left, top, width: right - left + 1, height: bottom - top + 1 }, right) >= EDGE_TRIM_RATIO
  ) {
    right -= 1;
  }

  while (
    bottom - top + 1 > 64 &&
    getBoxRowLightRatio(raw, { left, top, width: right - left + 1, height: bottom - top + 1 }, top) >= EDGE_TRIM_RATIO
  ) {
    top += 1;
  }

  while (
    bottom - top + 1 > 64 &&
    getBoxRowLightRatio(raw, { left, top, width: right - left + 1, height: bottom - top + 1 }, bottom) >= EDGE_TRIM_RATIO
  ) {
    bottom -= 1;
  }

  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
  };
}

function detectSubjectBox(raw: RawImage, box: GridBox): GridBox | null {
  let left = box.left + box.width;
  let right = box.left - 1;
  let top = box.top + box.height;
  let bottom = box.top - 1;

  for (let y = box.top; y < box.top + box.height; y += 1) {
    for (let x = box.left; x < box.left + box.width; x += 1) {
      if (isSubjectPixel(raw.data, (y * raw.width + x) * raw.channels, raw.channels)) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (right < left || bottom < top) return null;

  const padding = Math.floor(Math.max(right - left + 1, bottom - top + 1) * (SUBJECT_PADDING_PERCENT / 100));
  const paddedLeft = Math.max(box.left, left - padding);
  const paddedTop = Math.max(box.top, top - padding);
  const paddedRight = Math.min(box.left + box.width - 1, right + padding);
  const paddedBottom = Math.min(box.top + box.height - 1, bottom + padding);

  return {
    left: paddedLeft,
    top: paddedTop,
    width: paddedRight - paddedLeft + 1,
    height: paddedBottom - paddedTop + 1,
  };
}

function detectFaceCenterX(raw: RawImage, box: GridBox): number | null {
  let xTotal = 0;
  let count = 0;
  const bottom = box.top + Math.floor(box.height * 0.84);

  for (let y = box.top; y < bottom; y += 1) {
    for (let x = box.left; x < box.left + box.width; x += 1) {
      if (isSkinPixel(raw.data, (y * raw.width + x) * raw.channels, raw.channels)) {
        xTotal += x;
        count += 1;
      }
    }
  }

  if (count < 100) return null;

  return xTotal / count;
}

function squareFromSubjectBox(raw: RawImage, subjectBox: GridBox, containerBox: GridBox): GridBox {
  const side = Math.max(
    64,
    Math.min(Math.round(Math.min(containerBox.width, containerBox.height) * PORTRAIT_ZOOM_RATIO), containerBox.width, containerBox.height),
  );
  const faceCenterX = detectFaceCenterX(raw, containerBox);
  const centerX = faceCenterX ?? subjectBox.left + subjectBox.width / 2;
  const idealLeft = Math.round(centerX - side / 2);
  const maxLeft = containerBox.left + containerBox.width - side;
  const maxTop = containerBox.top + containerBox.height - side;

  return {
    left: Math.min(Math.max(idealLeft, containerBox.left), maxLeft),
    top: Math.min(Math.max(subjectBox.top, containerBox.top), maxTop),
    width: side,
    height: side,
  };
}

async function sliceDialogueSheet(character: string, input: Buffer): Promise<Array<SliceResult>> {
  if (input.length === 0) {
    throw new Error('Aucune image recue.');
  }

  const outputDirectory = resolveCharacterDirectory(character);
  const image = sharp(input);
  const metadata = await image.metadata();

  if (metadata.width < SHEET.columns * 64 || metadata.height < SHEET.rows * 64) {
    throw new Error(`Image trop petite pour une grille ${SHEET.rows}x${SHEET.columns} exploitable.`);
  }

  const rawResult = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const raw: RawImage = {
    data: rawResult.data,
    width: rawResult.info.width,
    height: rawResult.info.height,
    channels: rawResult.info.channels,
  };
  const boxes = detectGridBoxes(raw) ?? buildFallbackGridBoxes(metadata.width, metadata.height);
  await mkdir(outputDirectory, { recursive: true });

  const results: Array<SliceResult> = [];
  for (const [index, emotion] of SHEET.emotions.entries()) {
    const detectedBox = boxes[index];

    if (detectedBox === undefined || detectedBox.width < 64 || detectedBox.height < 64) {
      throw new Error(`Impossible de decouper ${emotion}.`);
    }

    const panelBox = trimLightEdges(raw, detectedBox);
    const subjectBox = detectSubjectBox(raw, panelBox);
    const box = subjectBox === null ? panelBox : squareFromSubjectBox(raw, subjectBox, panelBox);

    if (box.width < 64 || box.height < 64) {
      throw new Error(`Impossible de rogner les bords pour ${emotion}.`);
    }

    const output = await sharp(input)
      .extract(box)
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82, effort: 6, smartSubsample: true, preset: 'picture' })
      .toBuffer();
    const outputPath = path.join(outputDirectory, `dialogue-${emotion}.webp`);

    await writeFile(outputPath, output);
    results.push({
      emotion,
      path: path.relative(ROOT_DIR, outputPath),
      bytes: output.length,
    });
  }

  return results;
}

async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  if (request.method === 'GET' && url.pathname === '/') {
    sendHtml(response);
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/characters') {
    sendJson(response, 200, { characters: await listCharacterFolders() });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/slice') {
    const character = url.searchParams.get('character') ?? '';
    const input = await readRequestBody(request);
    const files = await sliceDialogueSheet(character, input);
    sendJson(response, 200, { files });
    return;
  }

  sendJson(response, 404, { error: 'Not found' });
}

function openBrowser(url: string): void {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  execFile(command, args, { stdio: 'ignore' }, () => undefined);
}

function buildPage(): string {
  const sheet = JSON.stringify(SHEET);

  return String.raw`<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dialogue Image</title>
    <style>
      :root {
        color-scheme: light;
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #1f2933;
        background: #f7f4ee;
      }

      * {
        box-sizing: border-box;
      }

      [hidden] {
        display: none !important;
      }

      body {
        margin: 0;
        min-height: 100vh;
      }

      main {
        width: min(1120px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 28px 0;
      }

      header {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
      }

      h1 {
        margin: 0;
        font-size: 26px;
        line-height: 1.1;
      }

      form {
        display: grid;
        grid-template-columns: minmax(220px, 1fr) minmax(220px, 1fr) auto;
        gap: 12px;
        align-items: end;
        padding: 16px;
        border: 1px solid #d9d2c4;
        border-radius: 8px;
        background: #fffdf8;
      }

      label {
        display: grid;
        gap: 6px;
        color: #52616f;
        font-size: 13px;
        font-weight: 700;
      }

      input[list],
      input[type="file"],
      button {
        min-height: 40px;
        border: 1px solid #b9c2cc;
        border-radius: 6px;
        background: #ffffff;
        color: #1f2933;
        font: inherit;
      }

      input[list],
      input[type="file"] {
        width: 100%;
        padding: 8px 10px;
      }

      button {
        padding: 0 16px;
        border-color: #1f2933;
        background: #1f2933;
        color: #ffffff;
        font-weight: 800;
        cursor: pointer;
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      .output {
        margin-top: 16px;
        border: 1px solid #d9d2c4;
        border-radius: 8px;
        background: #fffdf8;
        padding: 16px;
      }

      .output-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      .output-header h2 {
        margin: 0;
        font-size: 18px;
      }

      .empty {
        display: grid;
        min-height: 96px;
        place-items: center;
        color: #6b7280;
        font-weight: 700;
      }

      .output-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 14px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .output-card {
        overflow: hidden;
        border: 1px solid #e5dfd2;
        border-radius: 8px;
        background: #ffffff;
      }

      .output-card img {
        display: block;
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
        background: #eef2f5;
      }

      .output-meta {
        display: grid;
        gap: 4px;
        padding: 10px;
      }

      .output-meta strong {
        font-size: 15px;
      }

      .output-meta span {
        overflow: hidden;
        color: #52616f;
        font-size: 12px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .status {
        min-height: 22px;
        color: #52616f;
        font-size: 14px;
        font-weight: 700;
      }

      .error {
        color: #b42318;
      }

      .ok {
        color: #147849;
      }

      @media (max-width: 820px) {
        form {
          grid-template-columns: 1fr;
        }

        header {
          align-items: start;
          flex-direction: column;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>Dialogue Image</h1>
      </header>

      <form id="form">
        <label>
          Personnage
          <input id="character" list="characters" required placeholder="whitebeard-pirates/portgas-d-ace" />
          <datalist id="characters"></datalist>
        </label>
        <label>
          Sheet
          <input id="sheet" type="file" accept="image/*" required />
        </label>
        <button id="submit" type="submit" disabled>Generer</button>
      </form>

      <section class="output">
        <div class="output-header">
          <h2>Sortie</h2>
          <div id="status" class="status"></div>
        </div>
        <div id="empty" class="empty">Upload une sheet pour voir les portraits decoupes.</div>
        <ul id="outputs" class="output-grid"></ul>
        <canvas id="canvas" hidden></canvas>
      </section>
    </main>

    <script>
      const sheet = ${sheet};
      const characterInput = document.querySelector("#character");
      const characterSuggestions = document.querySelector("#characters");
      const sheetInput = document.querySelector("#sheet");
      const submitButton = document.querySelector("#submit");
      const statusNode = document.querySelector("#status");
      const outputList = document.querySelector("#outputs");
      const canvas = document.querySelector("#canvas");
      const empty = document.querySelector("#empty");
      const context = canvas.getContext("2d");

      let selectedFile = null;

      async function loadCharacters() {
        const response = await fetch("/api/characters");
        const payload = await response.json();
        characterSuggestions.replaceChildren(
          ...payload.characters.map((character) => {
            const option = document.createElement("option");
            option.value = character.value;
            option.label = character.label;
            return option;
          }),
        );
        syncSubmit();
      }

      function syncSubmit() {
        submitButton.disabled = !selectedFile || characterInput.value.trim().length === 0;
      }

      function setStatus(message, kind = "") {
        statusNode.textContent = message;
        statusNode.className = "status " + kind;
      }

      function formatSize(bytes) {
        return Math.max(1, Math.round(bytes / 1024)) + " KB";
      }

      function isLightPixel(data, offset) {
        return data[offset + 3] < 12 || (data[offset] >= 238 && data[offset + 1] >= 238 && data[offset + 2] >= 238);
      }

      function lightColumnRatio(data, width, height, x) {
        let light = 0;
        for (let y = 0; y < height; y += 1) {
          if (isLightPixel(data, (y * width + x) * 4)) light += 1;
        }
        return light / height;
      }

      function lightRowRatio(data, width, height, y) {
        let light = 0;
        for (let x = 0; x < width; x += 1) {
          if (isLightPixel(data, (y * width + x) * 4)) light += 1;
        }
        return light / width;
      }

      function buildSegments(length, isSeparator) {
        const segments = [];
        let start = null;

        for (let index = 0; index < length; index += 1) {
          if (isSeparator(index)) {
            if (start !== null) {
              segments.push({ start, end: index - 1 });
              start = null;
            }
          } else if (start === null) {
            start = index;
          }
        }

        if (start !== null) {
          segments.push({ start, end: length - 1 });
        }

        return segments.filter((segment) => segment.end - segment.start + 1 >= 64);
      }

      function findRegularSegments(segments, expectedCount) {
        if (segments.length < expectedCount) return null;
        return [...segments]
          .sort((left, right) => right.end - right.start - (left.end - left.start))
          .slice(0, expectedCount)
          .sort((left, right) => left.start - right.start);
      }

      function buildFallbackBoxes(width, height) {
        const cellWidth = Math.floor(width / sheet.columns);
        const cellHeight = Math.floor(height / sheet.rows);
        const boxes = [];

        for (let index = 0; index < sheet.rows * sheet.columns; index += 1) {
          const left = (index % sheet.columns) * cellWidth;
          const top = Math.floor(index / sheet.columns) * cellHeight;
          boxes.push({ left, top, width: Math.min(cellWidth, width - left), height: Math.min(cellHeight, height - top) });
        }

        return boxes;
      }

      function boxColumnLightRatio(data, imageWidth, box, x) {
        let light = 0;
        for (let y = box.top; y < box.top + box.height; y += 1) {
          if (isLightPixel(data, (y * imageWidth + x) * 4)) light += 1;
        }
        return light / box.height;
      }

      function boxRowLightRatio(data, imageWidth, box, y) {
        let light = 0;
        for (let x = box.left; x < box.left + box.width; x += 1) {
          if (isLightPixel(data, (y * imageWidth + x) * 4)) light += 1;
        }
        return light / box.width;
      }

      function trimLightEdges(data, imageWidth, box) {
        let left = box.left;
        let right = box.left + box.width - 1;
        let top = box.top;
        let bottom = box.top + box.height - 1;

        while (right - left + 1 > 64 && boxColumnLightRatio(data, imageWidth, { left, top, width: right - left + 1, height: bottom - top + 1 }, left) >= 0.88) {
          left += 1;
        }

        while (right - left + 1 > 64 && boxColumnLightRatio(data, imageWidth, { left, top, width: right - left + 1, height: bottom - top + 1 }, right) >= 0.88) {
          right -= 1;
        }

        while (bottom - top + 1 > 64 && boxRowLightRatio(data, imageWidth, { left, top, width: right - left + 1, height: bottom - top + 1 }, top) >= 0.88) {
          top += 1;
        }

        while (bottom - top + 1 > 64 && boxRowLightRatio(data, imageWidth, { left, top, width: right - left + 1, height: bottom - top + 1 }, bottom) >= 0.88) {
          bottom -= 1;
        }

        return { left, top, width: right - left + 1, height: bottom - top + 1 };
      }

      function isSubjectPixel(data, offset) {
        const red = data[offset] ?? 0;
        const green = data[offset + 1] ?? 0;
        const blue = data[offset + 2] ?? 0;
        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);

        if (data[offset + 3] < 12) return false;
        if (max < 95) return true;
        if (red > blue + 28 && green > blue - 12) return true;
        if (green > red + 18 && green > blue - 8) return true;
        if (red > 150 && green > 105 && blue < 95) return true;

        return max - min > 72 && !(blue > red + 30 && blue > green + 10);
      }

      function isSkinPixel(data, offset) {
        const red = data[offset] ?? 0;
        const green = data[offset + 1] ?? 0;
        const blue = data[offset + 2] ?? 0;

        return data[offset + 3] >= 12 && red > 105 && green > 65 && blue < 175 && red > blue + 18 && green > blue + 4 && red >= green - 8;
      }

      function detectSubjectBox(data, imageWidth, box) {
        let left = box.left + box.width;
        let right = box.left - 1;
        let top = box.top + box.height;
        let bottom = box.top - 1;

        for (let y = box.top; y < box.top + box.height; y += 1) {
          for (let x = box.left; x < box.left + box.width; x += 1) {
            if (isSubjectPixel(data, (y * imageWidth + x) * 4)) {
              left = Math.min(left, x);
              right = Math.max(right, x);
              top = Math.min(top, y);
              bottom = Math.max(bottom, y);
            }
          }
        }

        if (right < left || bottom < top) return null;

        const padding = Math.floor(Math.max(right - left + 1, bottom - top + 1) * 0.04);
        const paddedLeft = Math.max(box.left, left - padding);
        const paddedTop = Math.max(box.top, top - padding);
        const paddedRight = Math.min(box.left + box.width - 1, right + padding);
        const paddedBottom = Math.min(box.top + box.height - 1, bottom + padding);

        return { left: paddedLeft, top: paddedTop, width: paddedRight - paddedLeft + 1, height: paddedBottom - paddedTop + 1 };
      }

      function detectFaceCenterX(data, imageWidth, box) {
        let xTotal = 0;
        let count = 0;
        const bottom = box.top + Math.floor(box.height * 0.84);

        for (let y = box.top; y < bottom; y += 1) {
          for (let x = box.left; x < box.left + box.width; x += 1) {
            if (isSkinPixel(data, (y * imageWidth + x) * 4)) {
              xTotal += x;
              count += 1;
            }
          }
        }

        if (count < 100) return null;

        return xTotal / count;
      }

      function squareFromSubjectBox(data, imageWidth, subjectBox, containerBox) {
        const side = Math.max(64, Math.min(Math.round(Math.min(containerBox.width, containerBox.height) * 0.84), containerBox.width, containerBox.height));
        const faceCenterX = detectFaceCenterX(data, imageWidth, containerBox);
        const centerX = faceCenterX ?? subjectBox.left + subjectBox.width / 2;
        const idealLeft = Math.round(centerX - side / 2);
        const maxLeft = containerBox.left + containerBox.width - side;
        const maxTop = containerBox.top + containerBox.height - side;

        return {
          left: Math.min(Math.max(idealLeft, containerBox.left), maxLeft),
          top: Math.min(Math.max(subjectBox.top, containerBox.top), maxTop),
          width: side,
          height: side,
        };
      }

      function detectGridBoxesFromCanvas(source) {
        const pixels = source.getContext("2d").getImageData(0, 0, source.width, source.height);
        const columns = findRegularSegments(
          buildSegments(source.width, (x) => lightColumnRatio(pixels.data, source.width, source.height, x) >= 0.94),
          sheet.columns,
        );
        const rows = findRegularSegments(
          buildSegments(source.height, (y) => lightRowRatio(pixels.data, source.width, source.height, y) >= 0.94),
          sheet.rows,
        );

        if (!columns || !rows) {
          return buildFallbackBoxes(source.width, source.height);
        }

        return rows.flatMap((row) =>
          columns.map((column) => ({
            left: column.start,
            top: row.start,
            width: column.end - column.start + 1,
            height: row.end - row.start + 1,
          })),
        );
      }

      function buildOutputCard(emotion, src, detail) {
        const item = document.createElement("li");
        const image = document.createElement("img");
        const meta = document.createElement("div");
        const name = document.createElement("strong");
        const info = document.createElement("span");

        item.className = "output-card";
        image.src = src;
        image.alt = emotion;
        meta.className = "output-meta";
        name.textContent = emotion;
        info.textContent = detail;
        meta.append(name, info);
        item.append(image, meta);
        return item;
      }

      function renderWrittenOutputs(files) {
        const cards = [...outputList.querySelectorAll(".output-card")];
        for (const file of files) {
          const index = sheet.emotions.indexOf(file.emotion);
          const card = cards[index];
          const info = card?.querySelector(".output-meta span");
          if (info) {
            info.textContent = formatSize(file.bytes) + " - " + file.path;
            card.title = file.path;
          }
        }
      }

      async function renderOutputPreview(file) {
        const bitmap = await createImageBitmap(file);
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(bitmap, 0, 0);

        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const boxes = detectGridBoxesFromCanvas(canvas);
        const cards = [];

        for (let index = 0; index < sheet.emotions.length; index += 1) {
          const box = boxes[index];
          if (!box) continue;
          const crop = document.createElement("canvas");
          crop.width = 512;
          crop.height = 512;
          const cropContext = crop.getContext("2d");
          const panelBox = trimLightEdges(pixels.data, canvas.width, box);
          const subjectBox = detectSubjectBox(pixels.data, canvas.width, panelBox);
          const trimmedBox = subjectBox === null ? panelBox : squareFromSubjectBox(pixels.data, canvas.width, subjectBox, panelBox);
          cropContext.drawImage(canvas, trimmedBox.left, trimmedBox.top, trimmedBox.width, trimmedBox.height, 0, 0, crop.width, crop.height);
          cards.push(buildOutputCard(sheet.emotions[index], crop.toDataURL("image/webp", 0.82), "Pret a generer"));
        }

        outputList.replaceChildren(...cards);
        empty.hidden = cards.length > 0;
      }

      function clearOutputs() {
        outputList.replaceChildren(
        );
        empty.hidden = false;
      }

      sheetInput.addEventListener("change", async () => {
        selectedFile = sheetInput.files?.[0] ?? null;
        clearOutputs();
        syncSubmit();
        if (!selectedFile) return;
        await renderOutputPreview(selectedFile);
        setStatus(selectedFile.name);
      });

      characterInput.addEventListener("input", syncSubmit);

      document.querySelector("#form").addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!selectedFile) return;

        submitButton.disabled = true;
        setStatus("Generation...");

        try {
          const params = new URLSearchParams({
            character: characterInput.value.trim(),
          });
          const response = await fetch("/api/slice?" + params.toString(), {
            method: "POST",
            headers: { "content-type": selectedFile.type || "application/octet-stream" },
            body: await selectedFile.arrayBuffer(),
          });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error ?? "Generation impossible.");
          renderWrittenOutputs(payload.files);
          setStatus("Fichiers generes.", "ok");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), "error");
        } finally {
          syncSubmit();
        }
      });

      loadCharacters().catch((error) => setStatus(error.message, "error"));
    </script>
  </body>
</html>`;
}

const server = createServer((request, response) => {
  handleRequest(request, response).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    sendJson(response, 500, { error: message });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Dialogue Image: ${url}`);
  openBrowser(url);
});
