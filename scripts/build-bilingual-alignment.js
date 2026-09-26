#!/usr/bin/env node
/**
 * Build the Arabic <-> English paragraph alignment for lessons that have a
 * translation, and write src/data/bilingualAlignment.json.
 *
 * WHY THE PREVIOUS ATTEMPT FAILED
 *
 * The first attempt paired paragraphs by shared Qur'anic citation: if the
 * Arabic paragraph and the English paragraph quoted the same aya, they were
 * taken to be the same paragraph. They are not. A shared citation shows that
 * two paragraphs treat related material, nothing more. The pass paired AR30
 * with EN28 on Q 27:30 while AR27 -- which it labelled untranslated -- was in
 * fact EN28, since both open on the basmala disagreement. Citation overlap is
 * unordered, and the thing being reconstructed is an order.
 *
 * WHAT ANCHORS THIS ONE
 *
 * The compiler's footnote markers. Footnote [n] attaches to one place in the
 * Arabic, and the translator carried the same number into the English at the
 * corresponding place. So [n] in Arabic paragraph i and [n] in English
 * paragraph j is direct evidence that i and j are the same passage -- evidence
 * the translator supplied, not a similarity this script inferred.
 *
 * Two constraints keep it honest:
 *
 *  1. A number is an anchor only if it occurs exactly once on each side.
 *     Lesson 1's English repeats [4] and skips [6] and [9]; those are dropped
 *     rather than resolved by guessing.
 *  2. Anchors must be strictly increasing on both sides. The longest such
 *     subsequence is kept and the rest are reported. Order violation is what
 *     the citation-overlap method could not see, so refusing it is the point.
 *
 * Between two consecutive anchors, the gap is paired one-to-one when both
 * sides hold the same number of paragraphs, and otherwise emitted as a single
 * block covering the whole gap -- correct as a unit even where paragraph-level
 * correspondence is not established. Blocks carry which of the two they are.
 *
 * A lesson with no anchors is refused, not guessed at. Lessons 3-5 carry no
 * footnote markers in their English at all (partial drafts), so they are
 * refused here and fall back to the side-by-side view.
 *
 * AUDIT
 *
 * Footnote numbering is the anchor, so it cannot also be the check. The audit
 * uses proper names, which the translator transliterates and the Arabic
 * spells: if an English paragraph names al-Qurtubi, the Arabic it was paired
 * with should contain القرطبي. Agreement is reported per lesson; disagreement
 * above the threshold refuses the lesson.
 *
 * Usage: node scripts/build-bilingual-alignment.js [--write]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LESSONS = path.join(ROOT, 'src/data/lessons');
const OUT = path.join(ROOT, 'src/data/bilingualAlignment.json');

// Byte-identical to src/lib/arabicCommentary.ts. Change one, change both.
const POEM_PATTERN = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BASMALA_PATTERN = /^(أعوذ بالله|بسم الله|اللهم صل)/;
const isPoem = t => POEM_PATTERN.test(t.trim()) || BASMALA_PATTERN.test(t.trim());

function arabicParagraphs(raw) {
  return (raw || '').split('\n').filter(p => p.trim()).filter(p => !isPoem(p));
}

// Byte-identical to the enParagraphs construction in BilingualText.tsx.
function englishParagraphs(html) {
  if (!html) return [];
  return html
    .split(/(?=<p[^>]*>)/)
    .filter(s => s.startsWith('<p'))
    .filter(m => /<p[^>]*\bclass="[^"]*\ben-para\b[^"]*"/.test(m))
    .filter(m => m.replace(/<[^>]+>/g, '').trim());
}

/** number -> [paragraph indices it appears in] */
function markerIndex(paragraphs) {
  const seen = new Map();
  paragraphs.forEach((p, i) => {
    const plain = p.replace(/<[^>]+>/g, ' ');
    for (const m of plain.matchAll(/\[(\d{1,3})\]/g)) {
      const n = Number(m[1]);
      if (!seen.has(n)) seen.set(n, []);
      if (seen.get(n)[seen.get(n).length - 1] !== i) seen.get(n).push(i);
    }
  });
  return seen;
}

/**
 * Longest NON-DECREASING chain of anchors, ordered by footnote number.
 *
 * The first version of this demanded a strictly increasing chain in both
 * coordinates, and reported 14 of Lesson 1's 45 anchors as order violations.
 * They were nothing of the kind. Footnotes [1], [2] and [3] all stand in
 * Arabic paragraph 2, and [23] and [24] both in paragraph 36: one paragraph
 * carrying several notes, and the translator splitting one Arabic paragraph
 * across two English ones. Strictness threw those away, which shifted every
 * block built from the survivors, which then failed the name audit. The audit
 * was right and the data was fine; the instrument in between was wrong.
 *
 * Both marker sequences run in ascending order on their own side, so the
 * footnote number is already the ordering. Walk it, and keep an anchor only
 * where neither coordinate goes backwards.
 */
function monotone(anchors) {
  const sorted = [...anchors].sort((a, b) => a.n - b.n);
  const keep = [];
  let lastAr = -1, lastEn = -1;
  for (const a of sorted) {
    if (a.ar < lastAr || a.en < lastEn) continue;
    keep.push(a);
    lastAr = a.ar; lastEn = a.en;
  }
  return keep;
}

/** Merge anchors that share an Arabic or an English paragraph into one group. */
function groupAnchors(anchors) {
  const groups = [];
  for (const a of anchors) {
    const last = groups[groups.length - 1];
    if (last && (last.ar.includes(a.ar) || last.en.includes(a.en))) {
      if (!last.ar.includes(a.ar)) last.ar.push(a.ar);
      if (!last.en.includes(a.en)) last.en.push(a.en);
      last.ns.push(a.n);
    } else {
      groups.push({ ar: [a.ar], en: [a.en], ns: [a.n] });
    }
  }
  // A group that spans a range must carry the whole range. Lesson 2 has
  // footnote [4] in Arabic paragraph 9 and [5] in paragraph 11, both rendered
  // in English paragraph 22; paragraph 10 sits between them and belongs to the
  // same block. Listing only the two anchored paragraphs dropped it, which the
  // placed-exactly-once invariant caught.
  const fill = xs => {
    const lo = Math.min(...xs), hi = Math.max(...xs), out = [];
    for (let i = lo; i <= hi; i++) out.push(i);
    return out;
  };
  return groups.map(g => ({ ...g, ar: fill(g.ar), en: fill(g.en) }));
}

const NAME_PAIRS = [
  [/Qur[tṭ]ub[iī]/i, /قرطبي/],
  [/Sh[aā]fi[ʿ'`]?[iī]/i, /شافعي/],
  [/Ibn\s+[ʿ'`]?Abb[aā]s/i, /ابن عباس/],
  [/Jibr[iī]l/i, /جبريل/],
  [/Ab[uū]\s+Jahl/i, /جهل/],
  [/Ab[uū]\s+Lahab/i, /لهب/],
  [/N[aā]fi[ʿ'`]/i, /نافع/],
  [/[ʿ'`]?[AĀ][sṣ]im/i, /عاصم/],
  [/Kis[aā][ʾ']?[iī]/i, /الكسائي/],
  [/N[uū][hḥ]\b/i, /نوح/],
  [/Sulaym[aā]n/i, /سليمان/],
  [/Ibl[iī]s/i, /إبليس|ابليس/],
  [/[ʿ'`]?Umar\b/i, /عمر/],
  [/[Hḥ]af[sṣ]\b/i, /حفص/],
  [/Warsh\b/i, /ورش/],
  [/Hūd\b/, /هود/],
  [/M[uū]s[aā]\b/, /موسى/],
  [/[ʿ'`]?[IĪ]s[aā]\b/, /عيسى/],
  [/Ibr[aā]h[iī]m/, /إبراهيم|ابراهيم/],
  [/[AĀ]dam\b/, /آدم/],
  [/Ibn\s+Mas[ʿ'`][uū]d/, /ابن مسعود/],
  [/[ʿ'`]?Uthm[aā]n/, /عثمان/],
  [/Ab[uū]\s+Bakr/, /أبي بكر|أبو بكر/],
  [/Rama[dḍ]a?[aā]n/i, /رمضان/],
  [/Mad[iī]na/i, /المدينة/],
  [/Makka|Mecca/i, /مكة/],
  [/Kawthar/i, /الكوثر/],
  [/Tawr[aā]t/i, /التوراة/],
  [/Inj[iī]l/i, /الإنجيل|الانجيل/],
  [/Bukh[aā]r[iī]/i, /البخاري/],
  [/Muslim's\s+[Ss]a[hḥ][iī][hḥ]|[Ss]a[hḥ][iī][hḥ]\s+Muslim/, /صحيح مسلم/],
  [/Tirmidh[iī]/i, /الترمذي/],
  [/[ʿ'`]?[AĀ][ʾ']isha/i, /عائشة/],
  [/Khad[iī]ja/i, /خديجة/],
  [/Fir[ʿ'`]awn|Pharaoh/i, /فرعون/],
  [/Hell|Jahannam/i, /جهنم/],
  [/Zamzam/i, /زمزم/],
];

function buildLesson(id, lesson) {
  const ar = arabicParagraphs(lesson.arabicBody || lesson.arabicText);
  const en = englishParagraphs(lesson.englishText);
  if (!ar.length || !en.length) return { refused: 'no text on one side' };

  const arMarks = markerIndex(ar);
  const enMarks = markerIndex(en);

  const anchors = [];
  const rejected = [];
  for (const [n, arAt] of arMarks) {
    const enAt = enMarks.get(n);
    if (!enAt) { rejected.push({ n, why: 'not in the English' }); continue; }
    if (arAt.length !== 1 || enAt.length !== 1) {
      rejected.push({ n, why: `occurs ${arAt.length}x in Arabic, ${enAt.length}x in English` });
      continue;
    }
    anchors.push({ n, ar: arAt[0], en: enAt[0] });
  }
  if (!anchors.length) return { refused: 'no footnote marker occurs exactly once on both sides' };

  const kept = monotone(anchors);
  const outOfOrder = anchors.filter(a => !kept.includes(a));
  if (kept.length < 3) return { refused: `only ${kept.length} ordered anchors` };

  const blocks = [];
  const englishOnly = [];
  let arCursor = 0, enCursor = 0;

  const emitGap = (arTo, enTo, note) => {
    const arIdx = [], enIdx = [];
    for (let i = arCursor; i < arTo; i++) arIdx.push(i);
    for (let j = enCursor; j < enTo; j++) enIdx.push(j);
    if (!arIdx.length && !enIdx.length) return;
    if (arIdx.length && enIdx.length && arIdx.length === enIdx.length) {
      arIdx.forEach((a, k) => blocks.push({
        arabicIndices: [a], englishIndices: [enIdx[k]],
        note: 'One-to-one: the gap between two footnote anchors holds the same number of paragraphs on both sides.',
      }));
    } else if (arIdx.length && !enIdx.length) {
      blocks.push({ arabicIndices: arIdx, englishIndices: [], note: 'No English between these anchors -- untranslated here.' });
    } else if (!arIdx.length && enIdx.length) {
      // English with no Arabic beside it in the gap. Between two anchors this
      // is the translator splitting one Arabic paragraph into several, so it
      // belongs with the paragraph before it rather than in a separate section
      // at the foot of the page -- the reader should meet it where it was
      // written. Only English past the last anchor, with no preceding block to
      // join, is genuinely unpaired.
      const last = blocks[blocks.length - 1];
      if (last && last.englishIndices.length) {
        last.englishIndices.push(...enIdx);
        last.note = `${last.note} Plus ${enIdx.length} further English paragraph(s) the translator split out of it.`;
      } else {
        englishOnly.push({ indices: enIdx, note: note || 'English with no Arabic paragraph beside it.' });
      }
    } else {
      blocks.push({
        arabicIndices: arIdx, englishIndices: enIdx,
        note: `Block-level: ${arIdx.length} Arabic paragraphs against ${enIdx.length} English between two footnote anchors. Correct as a unit; paragraph-level correspondence inside it is not established.`,
      });
    }
    arCursor = arTo; enCursor = enTo;
  };

  for (const g of groupAnchors(kept)) {
    emitGap(g.ar[0], g.en[0]);
    const many = g.ar.length > 1 || g.en.length > 1;
    blocks.push({
      arabicIndices: g.ar, englishIndices: g.en,
      note: many
        ? `Anchored: footnotes [${g.ns.join('], [')}] stand across these paragraphs on both sides (${g.ar.length} Arabic to ${g.en.length} English).`
        : `Anchored: footnote [${g.ns[0]}] stands in both.`,
    });
    arCursor = g.ar[g.ar.length - 1] + 1;
    enCursor = g.en[g.en.length - 1] + 1;
  }
  emitGap(ar.length, en.length, 'Trailing English beyond the last footnote anchor.');

  // Invariants -- every paragraph placed exactly once, nothing invented.
  const arSeen = [], enSeen = [];
  blocks.forEach(b => { arSeen.push(...b.arabicIndices); enSeen.push(...b.englishIndices); });
  englishOnly.forEach(g => enSeen.push(...g.indices));
  const complete = (seen, n) => seen.length === n && new Set(seen).size === n && seen.every(i => i >= 0 && i < n);
  if (!complete(arSeen, ar.length)) return { refused: `Arabic paragraphs placed ${arSeen.length} of ${ar.length}, ${new Set(arSeen).size} distinct` };
  if (!complete(enSeen, en.length)) return { refused: `English paragraphs placed ${enSeen.length} of ${en.length}, ${new Set(enSeen).size} distinct` };
  for (let i = 1; i < blocks.length; i++) {
    const p = blocks[i - 1].arabicIndices, q = blocks[i].arabicIndices;
    if (p.length && q.length && q[0] <= p[p.length - 1]) return { refused: `blocks are not in order at ${i}` };
  }

  const audit = nameAudit(blocks, ar, en);

  return {
    arParagraphs: ar,
    enParagraphs: en,
    alignment: { blocks, englishOnly },
    stats: {
      arabicParagraphs: ar.length, englishParagraphs: en.length,
      anchors: kept.length, anchorsDropped: rejected.length, anchorsOutOfOrder: outOfOrder.length,
      blocks: blocks.length,
      oneToOne: blocks.filter(b => b.arabicIndices.length === 1 && b.englishIndices.length === 1).length,
      blockLevel: blocks.filter(b => b.arabicIndices.length > 1 && b.englishIndices.length > 1).length,
      untranslated: blocks.filter(b => b.arabicIndices.length && !b.englishIndices.length).length,
      nameTest: audit.summary,
      nameDistances: audit.distances,
      rejectedAnchors: rejected.slice(0, 12),
    },
    audit,
  };
}

/**
 * Audit by displacement, not by presence.
 *
 * The first version asked whether a name in an English paragraph stood
 * anywhere in the Arabic it was paired with, and answered no whenever a block
 * boundary fell between them -- Shāfiʿī in English 28 against Arabic 27,
 * Jibrīl in English 23 against Arabic 15-16. Both pairings are right to within
 * a paragraph; the test was measuring where I had drawn the block edges, not
 * whether the alignment was true.
 *
 * So measure the distance instead. For every English paragraph carrying a
 * transliterated name that also stands somewhere in the Arabic body, take the
 * Arabic paragraph it is paired with and the nearest Arabic paragraph holding
 * that name: a sound alignment keeps those within a paragraph or two of each
 * other, and a wrong one does not. Names absent from the Arabic body are
 * skipped -- the translator often works one in from a footnote, which says
 * nothing about the pairing.
 */
function nameAudit(blocks, ar, en) {
  const pairedAr = new Map();
  for (const b of blocks) {
    if (!b.arabicIndices.length) continue;
    for (const j of b.englishIndices) pairedAr.set(j, b.arabicIndices);
  }
  const ds = [];
  for (const [enRx, arRx] of NAME_PAIRS) {
    const arAt = ar.map((p, i) => (arRx.test(p) ? i : -1)).filter(i => i >= 0);
    // A name must be rare in the Arabic to be evidence. One that stands in a
    // dozen paragraphs is near whatever it is paired with, so it would pass a
    // wrong alignment as readily as a right one.
    if (!arAt.length || arAt.length > MAX_NAME_SPREAD) continue;
    en.forEach((p, j) => {
      if (!enRx.test(p.replace(/<[^>]+>/g, ' '))) return;
      const paired = pairedAr.get(j);
      if (!paired) return;
      let best = Infinity;
      for (const a of paired) for (const s of arAt) best = Math.min(best, Math.abs(a - s));
      ds.push(best);
    });
  }
  if (ds.length < MIN_NAME_TESTS) {
    return { ok: false, summary: `only ${ds.length} name tests, need ${MIN_NAME_TESTS}`, distances: ds };
  }
  const sorted = [...ds].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const near = ds.filter(d => d <= MAX_NAME_DISTANCE).length / ds.length;
  const ok = median <= 1 && near >= NEAR_FLOOR;
  return {
    ok,
    summary: `${ds.length} names, median displacement ${median} paragraph(s), ${(near * 100).toFixed(0)}% within ${MAX_NAME_DISTANCE}`,
    distances: sorted,
  };
}

const MIN_NAME_TESTS = 8;
const MAX_NAME_SPREAD = 5;
const MAX_NAME_DISTANCE = 2;
const NEAR_FLOOR = 0.85;

/** The control: the same blocks with every English index moved along by `by`. */
function shiftEnglish(blocks, by, enCount) {
  return blocks.map(b => ({
    ...b,
    englishIndices: b.englishIndices.map(j => (j + by) % enCount),
  }));
}

function main() {
  const write = process.argv.includes('--write');
  const out = {};
  const report = {};
  for (const f of fs.readdirSync(LESSONS).filter(x => /^\d+\.json$/.test(x)).sort()) {
    const id = Number(f.replace('.json', ''));
    if (id > 56) continue;
    const lesson = JSON.parse(fs.readFileSync(path.join(LESSONS, f), 'utf8'));
    if (!lesson.hasEnglish || (lesson.englishText || '').length < 2000) continue;
    const r = buildLesson(id, lesson);
    if (r.refused) { report[id] = { refused: r.refused }; continue; }
    if (!r.audit.ok) {
      report[id] = { refused: `name audit: ${r.audit.summary}`, stats: r.stats };
      continue;
    }
    // The audit is worth nothing unless a wrong alignment fails it. Shift this
    // lesson's English by four paragraphs and require the audit to reject the
    // result before accepting the real one.
    const shifted = shiftEnglish(r.alignment.blocks, 4, r.enParagraphs.length);
    const control = nameAudit(shifted, r.arParagraphs, r.enParagraphs);
    if (control.ok) {
      report[id] = { refused: `the audit passed a deliberately shifted alignment (${control.summary}) -- it is not discriminating here`, stats: r.stats };
      continue;
    }
    out[id] = r.alignment;
    report[id] = { ...r.stats, shiftControl: `rejected as required: ${control.summary}` };
  }
  console.log(JSON.stringify(report, null, 2));
  console.log(`\nshipping lessons: ${Object.keys(out).join(', ') || '(none)'}`);
  if (write) {
    fs.writeFileSync(OUT, JSON.stringify(out));
    console.log(`wrote ${path.relative(ROOT, OUT)}`);
  } else {
    console.log('(dry run -- pass --write)');
  }
}

main();
