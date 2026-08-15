#!/usr/bin/env node
/**
 * Fixes the open item: public/data/footnotes.json (the ~2000-entry compiler
 * footnote corpus -- Arabic text + AK's English translations + scholarly
 * metadata) currently sits in Next's public/ folder, meaning it's served
 * verbatim, unauthenticated, at a stable, permanently-linkable, crawlable
 * URL (https://niassetafsir.org/data/footnotes.json) -- anyone can download
 * the entire corpus in one request without ever loading the site itself.
 *
 * This does NOT make the content un-scrapable -- nothing can, short of a
 * login wall, which is a real product decision, not something to impose
 * silently. What it DOES do: removes the "one clean bulk file, no server
 * involved at all" trivial case, by moving the data behind a Next.js API
 * route (src/app/api/footnotes/route.ts) instead of a static public/ file --
 * and that route only ever hands out the ~10-40 footnotes for ONE lesson
 * when called from the lesson-panel view (src/components/LessonCitations.tsx
 * used to fetch the FULL ~2000-entry file just to show one lesson's worth,
 * every time that panel opened -- also fixed here as a side effect).
 *
 * What this script does:
 *   1. Copies public/data/footnotes.json -> src/data/footnotesData.json
 *      (server-only location; anything under src/ is never served directly).
 *   2. Overwrites public/data/footnotes.json with [] so the old URL no
 *      longer serves real data, without needing to delete the file (can't
 *      delete files from this environment).
 *
 * Run with: node scripts/secure-footnotes.js
 * (Run this BEFORE pushing -- the API route reads from the new location.)
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_FILE = path.join(__dirname, '..', 'public', 'data', 'footnotes.json');
const SERVER_FILE = path.join(__dirname, '..', 'src', 'data', 'footnotesData.json');

if (!fs.existsSync(PUBLIC_FILE)) {
  console.error(`Missing ${path.relative(process.cwd(), PUBLIC_FILE)} -- nothing to move.`);
  process.exit(1);
}

const raw = fs.readFileSync(PUBLIC_FILE, 'utf8');
let parsed;
try {
  parsed = JSON.parse(raw);
} catch (e) {
  console.error(`Could not parse ${path.relative(process.cwd(), PUBLIC_FILE)} as JSON: ${e.message}`);
  process.exit(1);
}
if (!Array.isArray(parsed) || parsed.length === 0) {
  console.error(`${path.relative(process.cwd(), PUBLIC_FILE)} doesn't look like a populated footnote array (got ${Array.isArray(parsed) ? parsed.length + ' items' : typeof parsed}) -- aborting without touching anything.`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(SERVER_FILE), { recursive: true });
fs.writeFileSync(SERVER_FILE, raw, 'utf8');
console.log(`Copied ${parsed.length} footnotes -> ${path.relative(process.cwd(), SERVER_FILE)}`);

fs.writeFileSync(PUBLIC_FILE, '[]', 'utf8');
console.log(`Cleared ${path.relative(process.cwd(), PUBLIC_FILE)} (now serves an empty array instead of the real corpus)`);
console.log('\nDone. The site now reads footnotes from src/data/footnotesData.json via /api/footnotes.');
