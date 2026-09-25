# Fī Riyāḍ al-Tafsīr — niassetafsir.org

Digital edition of Shaykh Ibrāhīm Niasse's *Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm*, set from
the ten-volume Majmaʿ al-Yamāma printing (Tunis, December 2022), compiled with footnotes by
Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī. Fifty-six lessons of Arabic text, a
partial English translation, the compiler's apparatus, and the research layers built on
them: a verse concordance, a glossary, a scholar and source index, full-text search.

Next.js 14 (App Router), TypeScript, Tailwind, deployed on Vercel. No database — every
layer of content is a JSON file under `src/data/`, written either at build time or by a
one-off script in `scripts/`.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run check    # tsc --noEmit && node --test tests/*.test.js
npm run build    # prebuild runs the search index, citation status, snippets, then the tests
```

`npm run build` fails if the tests fail. That is the point of them: the pieces they guard
break silently rather than loudly.

This file states no coverage figures. `src/lib/coverage.ts` counts them from the data at
build time and the homepage prints what it counts; a number written here would rot and
then be believed.

## Where things are

| Path | What it holds |
| --- | --- |
| `src/app/` | Routes. Lesson reader (`lesson/[id]`, plus a `print` variant), `surah/[id]`, `verse/[surah]/[ayah]`, `term/[slug]`, `volume/[id]`, search, glossary, hadith, footnotes, audio, the `get-involved` pages, and two API routes (`footnotes`, `suggest`). |
| `src/lib/` | Readers over the data. One module per layer: `lessons`, `coverage`, `verseIndex`, `verseRanges`, `textInject`, `apparatus`, `corpus`, `draftTranslations`, and so on. Nothing in `src/app` should parse JSON itself. |
| `src/data/` | The edition. `lessons/` (one file per lesson), `verse_text.json` and the reference corpus, `verseCitations.json`, `verseCitationStatus.json`, `footnotesData.json`, `concordance.json`, `glossary.json`, the Jalālayn and Rūḥ al-Bayān texts. |
| `scripts/` | Build steps, audits, and the OCR repair passes. |
| `tests/` | `node --test`, no dependencies. |
| `CLAUDE.md` | The working log: what was tried, what was wrong, and the contracts below in full. Read it before changing the citation system. |

## The verse citations

The Qurʾānic quotations inside the lesson bodies are not tagged in the text. They are found
by comparison and rendered at request time.

- `scripts/match-verses.js` locates quoted spans by comparing dot-folded Arabic against the
  reference corpus.
- `scripts/build-verse-citations.js` records what was found.
- `scripts/build-citation-status.js` decides, per span, whether it stands in the printed āya
  as written, diverges from it, or could not be placed, and writes
  `src/data/verseCitationStatus.json`.
- `src/lib/textInject.ts` injects the verse number as a superscript when the page renders.

The join key is positional — `(lessonId, paraIndex, spanIndex)` — and is recomputed on every
render, never stored in the text. So the span-extraction regex must stay byte-identical in
`scripts/match-verses.js`, `src/lib/textInject.ts`, and `scripts/check-citation-neighbours.js`.
Change one copy and every mark after it moves without any error. `tests/corpus.test.js`
asserts that the marks and the verse index agree about which span is which.

After any change to a lesson body, run the pipeline in order:

```bash
node scripts/match-verses.js
node scripts/build-verse-citations.js
node scripts/build-citation-status.js
node scripts/add-editorial-verse-index.js --write
node scripts/build-search-index.js
node scripts/prune-stale-para-indices.js --write
```

Alif practice belongs to the printing, not to the reading: the reference writes some alifs
superscript, the printing writes them plene or not, sometimes inconsistently within one
word. `build-citation-status.js` treats each such alif as independently optional rather than
reporting the difference as a divergence.

## The repair scripts

`scripts/repair-*.py` correct OCR damage in the Arabic. They share a discipline that is
worth keeping in any new one:

- Mint a row per site carrying its surrounding context (`scripts/repair_anchors.py`), then
  apply by anchor. A rerun against a file that has since changed refuses instead of
  corrupting it.
- Fold for comparing; substitute on raw characters. Three separate searches for the bare-hamza
  class found nothing because they substituted on folded forms, where `ء` folds to alif.
- Refuse rather than guess. Sites the audit cannot confirm are recorded as refusals and left
  for AK. A pass that silently normalises real Arabic words is worse than no pass.
- Confine a class to the flagged citation unless it is safe corpus-wide. `ة`→`ه` looks like a
  clean class until it reaches `عهدة` and `زوجة`.

`scripts/replay-repairs.py` re-runs a recorded pass. Each pass has a report in the project docs.

## Reader feedback

`src/app/api/suggest/route.ts` takes a correction attached to a citation mark and opens a
GitHub issue. It reads `GITHUB_TOKEN` and, optionally, `GITHUB_REPO`. With no token it
reports itself unconfigured on `GET` and `src/components/CitationFeedback.tsx` degrades to
an email link. The route validates the citation key against `verseCitationStatus.json`
before writing anything, requires evidence, caps lengths, fences the reader's text, and
never returns an upstream error body.

## Conventions

- Lesson JSONs are stored single-line. `git diff --numstat` must read `1 1` per changed
  file; anything else means a formatter ran over the corpus.
- Those files exceed a normal read. Sample them with `grep -o`, not by reading them whole.
- Arabic does not survive a shell heredoc byte-identical. Build it with `chr(0x...)` or
  extract it from a file.
- There is no ESLint config and no `lint` script. `tsc --noEmit` and `npm test` are the gates.
- `next build` will not run in a sandboxed Linux VM against a macOS `node_modules` (the SWC
  binary is platform-specific). Use `npm run check`.

## Unfinished

Editorial work that only AK can do: most of the English translation, footnote anchoring for
the majority of lessons, the comparative transcription of the sūra headings, the audio
sessions, the bilingual paragraph pairing, and the divergent readings that the citation
audit flagged and refused to settle. `CLAUDE.md` carries the current state of each and the
reasoning behind the calls already made.

## Rights

`LICENSE` places the edition -- transcription, translation, apparatus, indices --
under CC BY-NC-ND 4.0, and says what it does not cover: the Qur'anic text, the
underlying tafsir, third-party comparative texts, and vendored fonts. It is the
restrictive default and a poor fit for the application code, which forbids
distributing a modified version; relicense `src/` and `scripts/` under a software
licence if the code should be reusable.
