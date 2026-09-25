#!/usr/bin/env node
'use strict';
/**
 * A METHOD THAT DOES NOT WORK, KEPT SO IT IS NOT TRIED AGAIN.
 *
 * The problem: BilingualText.tsx has no paragraph-level pairing for any
 * lesson, so a reader of the five translated lessons gets two walls of text --
 * the whole Arabic in one column, the whole English in the other.
 *
 * The idea: a verse number is the same in both languages. The English prose
 * cites `Q. 7:27`; the Arabic paragraph brackets the aya, and
 * build-verse-citations.js has already identified it. Where an aya is cited
 * exactly once on each side, pair those two paragraphs, and interpolate
 * between such anchors.
 *
 * It looked strong. Lesson 1 yields 11 anchors and they land almost on the
 * identity -- EN19=AR19, EN62=AR62, EN64=AR64, EN68=AR68, never more than two
 * apart -- which is what you would expect if the two arrays ran together.
 *
 * WHY IT FAILS
 *
 * Reading the output is what exposed it. The anchor on Q 27:30 pairs AR30 with
 * EN28. But AR27 -- which the interpolation then labels untranslated -- opens
 * `al-basmala ikhtalafu fiha ikhtilafan kathiran`, and EN28 opens "Much
 * disagreement exists" about the basmala. EN28 renders AR27. The anchor is
 * three paragraphs out, and it dragged the interpolation around it out too.
 *
 * The flaw is in the premise. An aya cited in an English paragraph need not be
 * the aya bracketed in the Arabic paragraph that English renders: the
 * translator cites a verse while discussing a passage that quotes a different
 * one, and the commentary returns to the same verse pages later. A shared
 * citation shows the two paragraphs are about related material. It does not
 * show one renders the other, and only the second would license a pairing.
 *
 * So this writes a WORKSHEET, not an alignment. Nothing it produces is wired
 * into the site. The pairing needs someone who can read both columns -- which
 * for this edition means the translator.
 *
 * Run it for the worksheet: translation-drafts/bilingual-alignment-proposal.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'translation-drafts', 'bilingual-alignment-proposal.json');
const LESSONS_WITH_ENGLISH = [1, 2, 3, 4, 5];

const POEM = /^(يا ?همة الشيخ|ياهمة الشيخ|لنا بهذا المحضر|ولتعطفي بنظرة|تأتي لنا بالظفر|يا همة)/;
const BASMALA = /^(أعوذ بالله|بسم الله|اللهم صل)/;
const isPoem = t => POEM.test(t.trim()) || BASMALA.test(t.trim());

// Mirrors splitArabicCommentary in src/lib/arabicCommentary.ts.
function arabicParagraphs(raw) {
  return (raw || '').split('\n').map(s => s.trim()).filter(Boolean).filter(p => !isPoem(p));
}
function englishParagraphs(html) {
  return [...(html || '').matchAll(/<p class="en-para"[^>]*>([\s\S]*?)<\/p>/g)].map(m => m[1]);
}

const citations = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src', 'data', 'verseCitations.json'), 'utf8'));

function anchorsFor(lessonId, enParas) {
  // aya -> the single Arabic paragraph citing it (ayat cited twice are useless
  // as anchors and are dropped rather than picked between)
  const byVerse = {};
  const lesson = citations[String(lessonId)] || {};
  for (const para of Object.keys(lesson)) {
    for (const span of Object.keys(lesson[para])) {
      const v = lesson[para][span].split('-')[0];
      (byVerse[v] = byVerse[v] || []).push(Number(para));
    }
  }
  const found = [];
  enParas.forEach((p, ei) => {
    for (const m of p.matchAll(/\bQ\.?\s*(\d{1,3})[:.](\d{1,3})/g)) {
      const v = `${m[1]}:${m[2]}`;
      const paras = [...new Set(byVerse[v] || [])];
      if (paras.length === 1) found.push({ en: ei, ar: paras[0], verse: v });
    }
  });
  // strictly increasing on both axes; a later anchor that goes backwards is
  // dropped, because two anchors that cross cannot both be right
  found.sort((a, b) => a.en - b.en || a.ar - b.ar);
  const kept = [];
  for (const a of found) {
    const last = kept[kept.length - 1];
    if (!last || (a.en > last.en && a.ar > last.ar)) kept.push(a);
  }
  return kept;
}

function align(anchors, nAr, nEn) {
  const blocks = [];
  const bounds = [{ en: -1, ar: -1 }, ...anchors, { en: nEn, ar: nAr }];
  for (let k = 1; k < bounds.length; k++) {
    const a = bounds[k - 1], b = bounds[k];
    const enGap = [], arGap = [];
    for (let e = a.en + 1; e < b.en; e++) enGap.push(e);
    for (let r = a.ar + 1; r < b.ar; r++) arGap.push(r);

    const pairs = Math.min(enGap.length, arGap.length);
    for (let i = 0; i < pairs; i++) {
      const isLast = i === pairs - 1;
      const extra = isLast && enGap.length > arGap.length ? enGap.slice(pairs) : [];
      blocks.push({
        arabicIndices: [arGap[i]],
        englishIndices: [enGap[i], ...extra],
        verified: false,
        note: extra.length
          ? 'Inferred from position between two verse anchors; the translation expands this paragraph.'
          : 'Inferred from position between two verse anchors.',
      });
    }
    for (let i = pairs; i < arGap.length; i++) {
      blocks.push({
        arabicIndices: [arGap[i]], englishIndices: [], verified: false,
        note: 'No English in this gap — untranslated.',
      });
    }
    if (pairs === 0 && enGap.length) {
      blocks.push({
        arabicIndices: [], englishIndices: enGap, verified: false,
        note: 'English with no Arabic paragraph in this gap.',
      });
    }
    if (k < bounds.length - 1) {
      blocks.push({
        arabicIndices: [b.ar], englishIndices: [b.en], verified: true,
        note: `Both cite Q ${b.verse}.`,
      });
    }
  }
  return blocks;
}

const out = {};
for (const id of LESSONS_WITH_ENGLISH) {
  const L = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'src', 'data', 'lessons', `${String(id).padStart(2, '0')}.json`), 'utf8'));
  if (!L.hasEnglish || !L.englishText) continue;
  const ar = arabicParagraphs(L.arabicBody || L.arabicText);
  const en = englishParagraphs(L.englishText);
  const anchors = anchorsFor(id, en);
  if (anchors.length < 3) {
    console.log(`  L${id}: ${anchors.length} anchor(s) — too few to interpolate from; no alignment written`);
    continue;
  }
  const blocks = align(anchors, ar.length, en.length);

  // the contract
  const seenAr = blocks.flatMap(b => b.arabicIndices);
  const seenEn = blocks.flatMap(b => b.englishIndices);
  const dupAr = seenAr.length !== new Set(seenAr).size;
  const dupEn = seenEn.length !== new Set(seenEn).size;
  if (dupAr || dupEn || seenAr.length !== ar.length || seenEn.length !== en.length) {
    throw new Error(
      `L${id}: contract broken — arabic ${seenAr.length}/${ar.length}` +
      `${dupAr ? ' (duplicated)' : ''}, english ${seenEn.length}/${en.length}${dupEn ? ' (duplicated)' : ''}`);
  }
  out[id] = { blocks, englishOnly: [] };
  const v = blocks.filter(b => b.verified).length;
  console.log(`  L${id}: ${ar.length} Arabic, ${en.length} English, ${anchors.length} anchors ` +
              `-> ${blocks.length} blocks (${v} verified, ${blocks.length - v} inferred)`);
}

fs.writeFileSync(OUT, JSON.stringify(out), 'utf8');
console.log(`Wrote a PROPOSAL for ${Object.keys(out).length} lesson(s) -> translation-drafts/bilingual-alignment-proposal.json`);
console.log('Not wired into the site: the anchors are unreliable. See the header.');
