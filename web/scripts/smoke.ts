export {};

const baseArg = process.argv.indexOf('--base');
const base = baseArg >= 0 ? process.argv[baseArg + 1] : '';
const env = process.argv.includes('--env') ? process.argv[process.argv.indexOf('--env') + 1] : 'staging';
if (!base) throw new Error('Falta --base');

const paths = ['/', '/blog/', '/media-kit', '/privacidad', '/terminos', '/cookies', '/admin/', '/sitemap.xml', '/robots.txt', '/ads.txt', '/sw.js'];
let failed = 0;
for (const path of paths) {
  const response = await fetch(new URL(path, base));
  const build = response.headers.get('sg-build') || '';
  if (!response.ok) {
    failed += 1;
    console.error(`FAIL ${path} ${response.status}`);
    continue;
  }
  if (env === 'staging' && path === '/' && !response.headers.get('x-robots-tag')?.includes('noindex')) {
    failed += 1;
    console.error('FAIL sin noindex');
  }
  console.log(`OK ${path} ${response.status} ${build}`);
}
for (const blocked of ['/api/save-article.php', '/api/v3/_bootstrap.php']) {
  const response = await fetch(new URL(blocked, base));
  if (response.status !== 403) {
    failed += 1;
    console.error(`FAIL ${blocked} ${response.status}`);
  }
}
if (failed) process.exit(1);
