import { cpSync, copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(webRoot, 'public', '.htaccess');
const target = path.join(webRoot, 'dist', '.htaccess');
if (existsSync(source)) copyFileSync(source, target);
cpSync(path.join(webRoot, 'php', 'api'), path.join(webRoot, 'dist', 'api'), { recursive: true });
