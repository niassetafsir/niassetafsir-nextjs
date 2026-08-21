#!/usr/bin/env node
/**
 * Downloads Amiri and rewrites the @import to a local @font-face, so the
 * Arabic renders correctly on a machine with no network and no Amiri
 * installed. Idempotent: does nothing if the files are already there.
 *
 * Only the offline build needs this. The live site keeps the Google import,
 * which is why the rewrite is guarded on NEXT_PUBLIC_OFFLINE at build time --
 * see the marker comment in globals.css.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'public', 'fonts');
const CSS = path.join(__dirname, '..', 'src', 'app', 'globals.css');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36';
const SRC = 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap';

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  const sheet = await (await fetch(SRC, { headers: { 'User-Agent': UA } })).text();

  const faces = [];
  const blocks = sheet.split('@font-face').slice(1);
  let n = 0;
  for (const b of blocks) {
    const url = /src:\s*url\(([^)]+)\)/.exec(b);
    const style = /font-style:\s*([a-z]+)/.exec(b);
    const weight = /font-weight:\s*(\d+)/.exec(b);
    const range = /unicode-range:\s*([^;]+);/.exec(b);
    if (!url) continue;
    const file = `amiri-${++n}.woff2`;
    const target = path.join(DIR, file);
    if (!fs.existsSync(target)) {
      const buf = Buffer.from(await (await fetch(url[1])).arrayBuffer());
      fs.writeFileSync(target, buf);
    }
    faces.push(`@font-face{font-family:'Amiri';font-style:${style ? style[1] : 'normal'};`
      + `font-weight:${weight ? weight[1] : 400};font-display:swap;`
      + `src:url('/fonts/${file}') format('woff2');`
      + (range ? `unicode-range:${range[1]};` : '') + '}');
  }

  // Nothing useful came back -- a blocked host, an offline machine, a changed
  // response shape. Leave the stylesheet ALONE. A half-applied rewrite is the
  // worst outcome: globals.css pointing at an empty local sheet renders the
  // Arabic in whatever the system falls back to, silently, and the build looks
  // like it succeeded.
  if (!faces.length) {
    fs.rmSync(path.join(DIR, 'amiri.css'), { force: true });
    console.warn('  ! could not fetch Amiri -- fonts.googleapis.com unreachable from here.');
    console.warn('    globals.css left untouched. The demo will still work; Arabic will fall');
    console.warn('    back to a system face on a machine that has no Amiri installed.');
    console.warn('    Re-run this on a machine with network access to embed the real font.');
    return false;
  }

  fs.writeFileSync(path.join(DIR, 'amiri.css'), faces.join('\n'), 'utf8');

  const IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');";
  const LOCAL = "@import url('/fonts/amiri.css'); /* offline build: see scripts/vendor-fonts.js */";
  const css = fs.readFileSync(CSS, 'utf8');
  if (css.includes(IMPORT)) {
    fs.writeFileSync(CSS, css.replace(IMPORT, LOCAL), 'utf8');
    console.log('  globals.css now points at the local Amiri');
  }
  console.log(`  ${n} font files in public/fonts`);
  return true;
}

main()
  .then(ok => { if (ok) fs.writeFileSync(path.join(DIR, '.vendored'), '', 'utf8');
                else fs.rmSync(path.join(DIR, '.vendored'), { force: true }); })
  .catch(e => { console.error('  font vendoring failed:', e.message); process.exit(1); });
