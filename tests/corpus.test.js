'use strict';
/**
 * What must stay true about the corpus, checked by machine.
 *
 * Every one of these started as a hand check during a repair session, and each
 * caught something real: a mark keyed to the wrong span, a verse index pointing
 * at an aya that does not exist, a lesson file reformatted so that git could no
 * longer show what changed in it. A check run once finds a bug; a check run on
 * every build stops it coming back.
 *
 * No dependencies. `node --test` has shipped with Node since 18, and this repo
 * has no test framework to add one to. Plain JavaScript because the data these
 * assert on is JSON, and a build step between a test and its subject is one
 * more thing that can be wrong.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const LESSONS = Array.from({ length: 56 }, (_, i) => i + 1);
const lessonPath = id => `src/data/lessons/${String(id).padStart(2, '0')}.json`;

// Mirrors splitArabicCommentary in src/lib/arabicCommentary.ts. Kept in step by
// the test below, which fails if the source drifts from this copy.
const POEM = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BASMALA = /^(أعوذ بالله|بسم الله|اللهم صل)/;
const paragraphs = raw => (raw || '').split('\n').map(s => s.trim())
  .filter(Boolean).filter(p => !(POEM.test(p) || BASMALA.test(p)));

test('every lesson file is valid JSON with an Arabic body', () => {
  for (const id of LESSONS) {
    const L = read(lessonPath(id));
    assert.equal(typeof (L.arabicBody || L.arabicText), 'string',
      `lesson ${id} has no Arabic`);
    assert.ok((L.arabicBody || L.arabicText).length > 1000,
      `lesson ${id}'s Arabic is suspiciously short`);
  }
});

test('lesson files stay on one line', () => {
  // Not cosmetic. These are stored minified, and `git diff --numstat` reading
  // 1 1 per file is what makes a corpus change reviewable at all: reformat one
  // and its every line shows as changed, hiding the three characters that
  // actually moved.
  for (const id of LESSONS) {
    const raw = fs.readFileSync(path.join(ROOT, lessonPath(id)), 'utf8');
    assert.equal(raw.trimEnd().includes('\n'), false,
      `lesson ${id} has been reformatted onto several lines`);
  }
});

test('no paragraph is printed twice inside one lesson', () => {
  for (const id of LESSONS) {
    const seen = new Map();
    for (const [i, p] of paragraphs(read(lessonPath(id)).arabicBody).entries()) {
      const k = p.replace(/\s+/g, '');
      if (k.length < 200) continue;
      if (seen.has(k)) {
        assert.fail(`lesson ${id}: paragraphs ${seen.get(k)} and ${i} are the same text`);
      }
      seen.set(k, i);
    }
  }
});

test('every verse-index row names an aya that exists', () => {
  const verses = read('src/data/verse_text.json');
  const index = read('src/data/verseIndexAuto.json');
  let rows = 0;
  for (const [lesson, entries] of Object.entries(index)) {
    for (const row of entries) {
      rows += 1;
      assert.ok(verses[row.verse],
        `verse index, lesson ${lesson}: ${row.verse} is not in the reference`);
    }
  }
  assert.ok(rows > 4000, `only ${rows} verse-index rows — the index has shrunk`);
});

test('every citation the site prints names an aya that exists', () => {
  const verses = read('src/data/verse_text.json');
  const cites = read('src/data/verseCitations.json');
  for (const [lesson, paras] of Object.entries(cites)) {
    for (const [para, spans] of Object.entries(paras)) {
      for (const [span, value] of Object.entries(spans)) {
        for (const key of String(value).split('-')) {
          assert.ok(verses[key.trim()],
            `citation L${lesson} ¶${para} span ${span}: ${key} is not in the reference`);
        }
      }
    }
  }
});

test('every collation mark lands on the span that produced it', () => {
  // The mark and the verse number are keyed on (lesson, paragraph, span), a
  // triple recomputed at render time by src/lib/textInject.ts. An off-by-one
  // here puts every mark on the wrong citation, silently.
  const status = read('src/data/verseCitationStatus.json');
  const report = read('translation-drafts/verse-match-report.json');
  let checked = 0;
  for (const [lesson, paras] of Object.entries(status)) {
    const body = read(lessonPath(Number(lesson))).arabicBody;
    const paraTexts = paragraphs(body);
    const want = new Map();
    for (const s of report[lesson].spans) want.set(`${s.paraIndex}:${s.spanIndex}`, s.text.trim());
    for (const [para, spans] of Object.entries(paras)) {
      let spanIndex = 0;
      const seen = new Map();
      const walk = (full, inner) => {
        const sp = inner.trim();
        if (/[.{}]/.test(sp)) return full;
        seen.set(spanIndex, sp);
        spanIndex += 1;
        return full;
      };
      const p = paraTexts[Number(para)];
      assert.ok(p !== undefined, `status names L${lesson} ¶${para}, which does not exist`);
      p.replace(/\(([^()]{2,400})\)/g, walk);
      p.replace(/«([^»]{2,400})»/g, walk);
      for (const span of Object.keys(spans)) {
        checked += 1;
        const at = `L${lesson} ¶${para} span ${span}`;
        // Both lookups must HIT before they are compared. Comparing them
        // directly passes when neither exists -- undefined equals undefined --
        // which is precisely the shape of the bug this test is for: a mark
        // shifted past the end of its paragraph names nothing on either side.
        // Caught by injecting that exact off-by-one, which the first version
        // of this test did not notice.
        assert.ok(seen.has(Number(span)),
          `${at}: the mark names a span the paragraph does not have`);
        assert.ok(want.has(`${para}:${span}`),
          `${at}: the mark names a span the index does not have`);
        assert.equal(seen.get(Number(span)), want.get(`${para}:${span}`),
          `${at}: the mark and the index disagree about which span this is`);
      }
    }
  }
  assert.ok(checked > 8000, `only ${checked} marks checked — the apparatus has shrunk`);
});

test('the paragraph split in this test still matches the site’s own', () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/lib/arabicCommentary.ts'), 'utf8');
  for (const needle of ['يا ?همة الشيخ', 'أعوذ بالله', "split('\\n')"]) {
    assert.ok(src.includes(needle),
      `arabicCommentary.ts no longer contains ${needle} — this test's copy of the split has drifted`);
  }
});

test('the bilingual alignment places every paragraph exactly once', () => {
  const ALIGN = read('src/data/bilingualAlignment.json');
  for (const [key, a] of Object.entries(ALIGN)) {
    const id = Number(key);
    const L = read(lessonPath(id));
    const ar = paragraphs(L.arabicBody || L.arabicText);
    const en = (L.englishText || '').split(/(?=<p[^>]*>)/)
      .filter(s => s.startsWith('<p'))
      .filter(m => /<p[^>]*\bclass="[^"]*\ben-para\b[^"]*"/.test(m))
      .filter(m => m.replace(/<[^>]+>/g, '').trim());

    const arSeen = [], enSeen = [];
    for (const b of a.blocks) { arSeen.push(...b.arabicIndices); enSeen.push(...b.englishIndices); }
    for (const g of a.englishOnly) enSeen.push(...g.indices);

    // An alignment that loses a paragraph loses it from the page: the reader
    // sees a lesson with a hole in it and no sign that anything is missing.
    assert.equal(arSeen.length, ar.length,
      `lesson ${id}: ${arSeen.length} Arabic paragraphs placed, ${ar.length} exist`);
    assert.equal(new Set(arSeen).size, ar.length,
      `lesson ${id}: an Arabic paragraph is placed twice`);
    assert.equal(enSeen.length, en.length,
      `lesson ${id}: ${enSeen.length} English paragraphs placed, ${en.length} exist`);
    assert.equal(new Set(enSeen).size, en.length,
      `lesson ${id}: an English paragraph is placed twice`);
    assert.ok(Math.max(...arSeen) < ar.length && Math.min(...arSeen) >= 0,
      `lesson ${id}: an Arabic index is out of range`);
    assert.ok(Math.max(...enSeen) < en.length && Math.min(...enSeen) >= 0,
      `lesson ${id}: an English index is out of range`);
  }
});

test('bilingual blocks run forwards on both sides', () => {
  const ALIGN = read('src/data/bilingualAlignment.json');
  for (const [key, a] of Object.entries(ALIGN)) {
    let lastAr = -1, lastEn = -1;
    a.blocks.forEach((b, i) => {
      for (const x of b.arabicIndices) {
        assert.ok(x > lastAr, `lesson ${key} block ${i}: Arabic ${x} goes back past ${lastAr}`);
        lastAr = x;
      }
      for (const y of b.englishIndices) {
        assert.ok(y > lastEn, `lesson ${key} block ${i}: English ${y} goes back past ${lastEn}`);
        lastEn = y;
      }
    });
  }
});

test('the bilingual alignment ships only what the audit passed', () => {
  const ALIGN = read('src/data/bilingualAlignment.json');
  // Lessons 2-5 are refused by scripts/build-bilingual-alignment.js: Lesson 2
  // drifts in its tail, and 3-5 carry no footnote markers in their English.
  // A regenerated file that suddenly includes them means the audit stopped
  // biting, which is worth failing over rather than shipping.
  for (const id of [2, 3, 4, 5]) {
    assert.ok(!(id in ALIGN),
      `lesson ${id} is in the alignment, but the build script refuses it -- re-run the script and read its report`);
  }
  assert.ok(1 in ALIGN, 'Lesson 1 is missing from the alignment');
});

// Normalisation used by scripts/reanchor-term-concordance.js. Folds the
// diacritics, the alif seats, alif maqsura and ta marbuta, which is as far as
// a locus check should go: anything more and a real OCR difference passes.
const fold = s => (s || '').normalize('NFD')
  .replace(/[ؐ-؟ً-ٟٖ-ٰۖ-ۭ]/g, '')
  .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
  .replace(/[^ء-ي ]/g, ' ').replace(/\s+/g, ' ').trim();

test('every term-concordance locus points inside its lesson', () => {
  const terms = read('public/data/term_concordance.json');
  const cache = {};
  for (const t of terms) {
    for (const occ of t.occurrences || []) {
      if (typeof occ.paraIndex !== 'number') continue;
      const ps = cache[occ.lessonId] ||
        (cache[occ.lessonId] = paragraphs(read(lessonPath(occ.lessonId)).arabicBody));
      assert.ok(occ.paraIndex >= 0 && occ.paraIndex < ps.length,
        `${t.term} L${occ.lessonId} ¶${occ.paraIndex}: the lesson has ${ps.length} paragraphs`);
    }
  }
});

test('a term-concordance locus lands on a paragraph holding the term', () => {
  // Except where the script has said it could not find the context any more:
  // those carry anchorLost and the glossary sends no ?para= for them. The
  // check is what stops a locus being anchored by a formula -- "may God place
  // us and you among them" once anchored a passage about the soul being taken
  // to a paragraph about guidance, where the word rūḥ does not occur.
  const terms = read('public/data/term_concordance.json');
  const cache = {};
  for (const t of terms) {
    for (const occ of t.occurrences || []) {
      if (occ.anchorLost || typeof occ.paraIndex !== 'number') continue;
      const ps = cache[occ.lessonId] ||
        (cache[occ.lessonId] = paragraphs(read(lessonPath(occ.lessonId)).arabicBody));
      const form = fold(occ.matchedForm || t.arabic);
      if (!form) continue;
      assert.ok(fold(ps[occ.paraIndex] || '').includes(form),
        `${t.term} L${occ.lessonId} ¶${occ.paraIndex}: the paragraph does not contain ${occ.matchedForm || t.arabic}`);
    }
  }
});
