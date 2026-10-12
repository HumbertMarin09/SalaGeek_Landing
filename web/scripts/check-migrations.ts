import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findDestructiveSql } from '../src/lib/migrations';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../prisma/migrations');
const hits: string[] = [];
for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(root, entry.name, 'migration.sql');
  const found = findDestructiveSql(readFileSync(file, 'utf8'));
  if (found.length) hits.push(`${entry.name}: ${found.join(', ')}`);
}
if (hits.length) {
  console.error(hits.join('\n'));
  process.exit(1);
}
console.log('migraciones sin SQL destructivo');
