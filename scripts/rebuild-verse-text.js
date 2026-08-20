#!/usr/bin/env node
/**
 * Replaces src/data/verse_text.json with a COMPLETE verse-keyed Qur'an
 * text file. The existing one turned out to be truncated -- long verses
 * were cut off at ~90-100 characters (confirmed on 2:255 and 7:27), which
 * was silently sabotaging scripts/match-verses.js: citations quoting the
 * back half of a long verse could never match, no matter how good the
 * normalization was, because that text simply wasn't stored.
 *
 * Source: fawazahmed0/quran-api (github.com/fawazahmed0/quran-api), served
 * via jsDelivr. Arabic edition is "ara-quranwarsh" -- Warsh ʿan Nāfiʿ, the
 * riwāya of North and West Africa and of the Tijānī tradition in which the
 * tafsīr was delivered.
 *
 * It was "ara-quranuthmanihaf" (Ḥafṣ ʿan ʿĀṣim) until 20 August 2026, under
 * a comment claiming Ḥafṣ was standard "almost everywhere, including West
 * Africa". That is wrong about the Maghrib and West Africa, and it put the
 * reference text at odds with the edition's own Editorial Conventions page,
 * which states that the Qurʾānic text follows the Warsh rasm. The mismatch
 * was not cosmetic: quotations in the tafsīr are Warsh, so the Ḥafṣ
 * reference could not match them. Switching gained 211 inline citations and
 * 118 distinct verses. Verse numbering is identical between the two
 * editions, and Amiri covers every codepoint the Warsh text uses.
 *
 * Do not revert AR_URL to a Ḥafṣ edition.
 *
 * English edition is "eng-mohammedmarmadu" (Pickthall, 1930, public domain,
 * sourced from tanzil.net). It is shown on the site only as a named base
 * translation beneath AK's own rendering, never unattributed.
 *
 * The OLD (truncated) file is renamed to verse_text.truncated.bak.json
 * rather than deleted, in case anything needs to be cross-checked later.
 *
 * Run with: node scripts/rebuild-verse-text.js
 */

const fs = require('fs');
const path = require('path');

const AR_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranwarsh.json';
const EN_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/eng-mohammedmarmadu.json';

const OUT_FILE = path.join(__dirname, '..', 'src', 'data', 'verse_text.json');
const BAK_FILE = path.join(__dirname, '..', 'src', 'data', 'verse_text.truncated.bak.json');

async function fetchJson(url, label) {
  console.log(`Fetching ${label}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${label} fetch failed: HTTP ${res.status}`);
  const data = await res.json();
  if (!data || !Array.isArray(data.quran)) throw new Error(`${label}: unexpected shape, no "quran" array`);
  console.log(`  got ${data.quran.length} verses`);
  return data.quran;
}

async function main() {
  const [arVerses, enVerses] = await Promise.all([
    fetchJson(AR_URL, 'Arabic (Warsh ʿan Nāfiʿ)'),
    fetchJson(EN_URL, 'English (Pickthall)'),
  ]);

  const enByKey = new Map();
  for (const v of enVerses) enByKey.set(`${v.chapter}:${v.verse}`, v.text);

  const out = {};
  for (const v of arVerses) {
    const key = `${v.chapter}:${v.verse}`;
    out[key] = { ar: v.text, en: enByKey.get(key) || '' };
  }

  if (Object.keys(out).length < 6200) {
    throw new Error(`Only got ${Object.keys(out).length} verses -- expected 6236. Aborting without overwriting.`);
  }

  if (fs.existsSync(OUT_FILE) && !fs.existsSync(BAK_FILE)) {
    fs.copyFileSync(OUT_FILE, BAK_FILE);
    console.log(`Backed up old (truncated) file to ${path.relative(process.cwd(), BAK_FILE)}`);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(out), 'utf8');
  console.log(`\nWrote ${Object.keys(out).length} complete verses to ${path.relative(process.cwd(), OUT_FILE)}`);
  console.log('Next: rerun  node scripts/match-verses.js');
}

main().catch(err => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
