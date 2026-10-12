import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderHtaccess, type HtaccessEnv } from '../src/lib/htaccess';

const env = (process.env.HTACCESS_ENV === 'production' ? 'production' : 'staging') as HtaccessEnv;
const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
writeFileSync(path.join(webRoot, 'public', '.htaccess'), renderHtaccess(env));
