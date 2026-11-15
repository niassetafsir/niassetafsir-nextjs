// Topic pages quote Shaykh Ibrāhīm's Arabic from AK's corrected lesson copies,
// which fix scan errors the site's own lesson text still carries (شيعان for
// شيئان, a lost stretch at Lesson 21 pp. 52-53). So an exact match against
// src/data/lessons is too strict. What must hold: each passage belongs to the
// lesson it cites -- at least 90% of its words occur in that lesson's text.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const norm = s => s
  .replace(/[ً-ٰٟؐ-ؚۖ-ۭـ]/g, '')
  .replace(/[آأإٱ]/g, 'ا')
  .replace(/ى/g, 'ي').replace(/ة/g, 'ه')
  .replace(/[^ء-ي ]/g, ' ').replace(/\s+/g, ' ').trim();

const { topics } = JSON.parse(fs.readFileSync(path.join(root, 'src/data/topics.json'), 'utf8'));

for (const t of topics) {
  t.passages.forEach((p, i) => {
    test(`topic ${t.slug} passage ${i + 1} belongs to Lesson ${p.lesson}`, () => {
      const lesson = JSON.parse(fs.readFileSync(path.join(root, `src/data/lessons/${String(p.lesson).padStart(2, '0')}.json`), 'utf8'));
      const body = new Set(norm(lesson.arabicBody || lesson.arabicText || '').split(' '));
      const words = norm(p.ar).split(' ').filter(w => w.length > 2);
      const share = words.filter(w => body.has(w)).length / words.length;
      assert.ok(share >= 0.9, `only ${Math.round(share * 100)}% of the words occur in Lesson ${p.lesson}`);
    });
  });
  for (const r of t.related ?? []) {
    test(`topic ${t.slug} links to an existing topic (${r})`, () => {
      assert.ok(topics.some(x => x.slug === r));
    });
  }
}
