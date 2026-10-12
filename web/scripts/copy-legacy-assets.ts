import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { hashFile } from '../src/lib/legacy/sync';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(webRoot, '..');

export function copyTree(from: string, to: string, names?: string[]): void {
  mkdirSync(to, { recursive: true });
  const entries = names ?? readdirSync(from);
  for (const name of entries) {
    const source = path.join(from, name);
    const target = path.join(to, name);
    if (!existsSync(source) || !statSync(source).isFile() && !statSync(source).isDirectory()) continue;
    cpSync(source, target, { recursive: true });
  }
}

function main(): void {
  const sourceDir = path.join(repoRoot, 'src', 'images');
  const watched = path.join(sourceDir, 'social-card.png');
  const before = existsSync(watched) ? hashFile(watched) : '';
  copyTree(sourceDir, path.join(webRoot, 'public', 'src', 'images'));
  if (before && hashFile(watched) !== before) {
    throw new Error('La copia de imágenes modificó un archivo de la v2');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}

export { hashFile };
