// Does any citation sit on an āya its own neighbour fits better?
//
// The matcher's two known ways of going wrong are landing one āya off, and
// resting on a span too thin to identify anything. Both were found by hand on
// 16 September; this looks for them on every run so a regression surfaces
// instead of accumulating.
//
// It REPORTS. It changes nothing: a straddling span legitimately covers two
// āyāt, and which one a citation should name is an editorial call, not a
// scoring one. Run it last, after prune-stale-para-indices.js.
//
//   node scripts/check-citation-neighbours.js
const fs = require('fs');
const path = require('path');
const D = path.join(__dirname, '..', 'src', 'data');

const V = JSON.parse(fs.readFileSync(path.join(D, 'verseCitations.json'), 'utf8'));
const VT = JSON.parse(fs.readFileSync(path.join(D, 'verse_text.json'), 'utf8'));
const POEM = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BAS = /^(أعوذ بالله|بسم الله|اللهم صل)/;

// Must stay identical to extractSpans in match-verses.js and injectVerseNumbers
// in src/lib/textInject.ts -- see CLAUDE.md's verse-citation section.
const paras = id => JSON.parse(fs.readFileSync(path.join(D, 'lessons', String(id).padStart(2, '0') + '.json'), 'utf8'))
  .arabicBody.replace(/<[^>]+>/g, '').split('\n')
  .filter(p => p.trim()).filter(p => { const s = p.trim(); return !(POEM.test(s) || BAS.test(s)); });
function spans(p) {
  const out = [];
  for (const re of [/\(([^()]{2,400})\)/g, /«([^»]{2,400})»/g]) {
    let m; while ((m = re.exec(p))) { const s = m[1].trim(); if (/[.{}]/.test(s)) continue; out.push(s); }
  }
  return out;
}
const N = s => s.normalize('NFC').replace(/\p{Mn}/gu, '').replace(/[ۥۦ]/g, '')
  .replace(/\p{Cf}/gu, '').replace(/\[\s*\d+\s*\]/g, ' ')
  .replace(/[^ء-ي ]/g, ' ').replace(/\s+/g, ' ').trim();
const words = s => N(s).split(' ').filter(w => w.length > 1);
const cover = (sp, v) => {
  if (!v) return -1;
  const a = words(sp); if (!a.length) return -1;
  const b = ' ' + N(v) + ' ';
  return a.filter(w => b.includes(' ' + w + ' ')).length / a.length;
};

const MARGIN = 0.25;   // a neighbour must beat the assigned āya by this much
const MIN_WORDS = 3;

let checked = 0; const off = [], thin = [];
for (const L of Object.keys(V)) {
  const p = paras(+L);
  for (const pi of Object.keys(V[L])) {
    const sp = spans(p[+pi] || '');
    for (const si of Object.keys(V[L][pi])) {
      const key = V[L][pi][si];
      const s = sp[+si];
      if (s === undefined || !/^\d+:\d+$/.test(key)) continue;
      if (words(s).length < MIN_WORDS) thin.push([L, pi, si, key, s]);
      const [su, ay] = key.split(':').map(Number);
      const mine = cover(s, (VT[key] || {}).ar);
      if (mine < 0) continue;
      checked++;
      let best = key, bs = mine;
      for (const d of [-2, -1, 1, 2]) {
        const k = `${su}:${ay + d}`;
        const c = cover(s, (VT[k] || {}).ar);
        if (c > bs + MARGIN) { bs = c; best = k; }
      }
      if (best !== key) off.push([L, pi, si, key, best, mine, bs, s]);
    }
  }
}
console.log(`checked ${checked} citations against their neighbouring āyāt`);
console.log(`  a neighbour fits clearly better : ${off.length}`);
for (const [L, pi, si, key, best, m, b, s] of off)
  console.log(`      L${L} ¶${pi} s${si}  ${key} -> ${best}  (${m.toFixed(2)} vs ${b.toFixed(2)})  ${s.slice(0, 50)}`);
console.log(`  span under ${MIN_WORDS} content words  : ${thin.length}`);
for (const [L, pi, si, key, s] of thin.slice(0, 10))
  console.log(`      L${L} ¶${pi} s${si}  ${key}  ${s.slice(0, 50)}`);
