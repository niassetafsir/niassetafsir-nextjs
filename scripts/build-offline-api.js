#!/usr/bin/env node
/**
 * Writes the Critical Apparatus responses as static files, so the offline
 * demo can read them without a server.
 *
 * Mirrors src/app/api/footnotes/route.ts exactly -- same hasApparatus() gate,
 * same { compiler, editor } shape. If that route changes, change this too, or
 * the offline build will quietly show a different apparatus from the live one.
 */
const fs = require('fs');
const path = require('path');

const footnotes = require('../src/data/footnotesData.json');
const editorNotes = require('../src/data/editorNotes.json');

// Kept in step with src/lib/apparatus.ts by hand -- this file cannot import a
// .ts module and the list is one line.
const VERIFIED = [1, 2, 3, 4, 5, 6, 7];

const OUT = path.join(__dirname, '..', 'public', 'data', 'offline');
fs.mkdirSync(OUT, { recursive: true });

const published = footnotes.filter(f => VERIFIED.includes(f.lessonId));
for (let id = 1; id <= 56; id++) {
  fs.writeFileSync(
    path.join(OUT, `footnotes-${id}.json`),
    JSON.stringify({
      compiler: published.filter(f => f.lessonId === id),
      editor: editorNotes.filter(n => n.lessonId === id).sort((a, b) => a.paraIndex - b.paraIndex),
    }),
    'utf8');
}
fs.writeFileSync(path.join(OUT, 'footnotes-all.json'), JSON.stringify(published), 'utf8');
console.log(`  wrote 57 files to public/data/offline (${published.length} published notes)`);
