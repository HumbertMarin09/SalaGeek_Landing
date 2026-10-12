import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(webRoot, '.content', 'snapshot.json');
const fixture = path.join(webRoot, 'tests', 'fixtures', 'snapshot.json');

if (process.env.CONTENT_SOURCE === 'fixtures' || !existsSync(target)) {
  mkdirSync(path.dirname(target), { recursive: true });
  copyFileSync(fixture, target);
}
