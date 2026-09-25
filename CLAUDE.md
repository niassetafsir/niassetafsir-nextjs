# niassetafsir.org — notes for future sessions

Digital edition of Shaykh Ibrāhīm Niasse's *Fī Riyāḍ al-Tafsīr*, built on the
revised ten-volume Majmaʿ al-Yamāma print edition (Tunis, 2010), compiled with
footnotes by Muḥammad ibn Shaykh ʿAbd Allāh al-Tijānī al-Ibrāhīmī. Next.js 14
App Router, deployed on Vercel, no backend database — content lives in
`src/data/*.json`, generated at build time or by one-off scripts in `scripts/`.

## Stack facts worth not re-discovering

- `next.config.mjs` has no `output: 'export'` — dynamic Route Handlers
  (`request.nextUrl.searchParams`) work fine on this deployment.
- `resolveJsonModule: true` is already set in `tsconfig.json` — `import data
  from '@/data/x.json'` works directly, no fetch needed for build-time data.
- `@/*` maps to `./src/*`.
- No ESLint config in the repo (`eslint`/`eslint-config-next` aren't in
  `package.json`). `next build` does not enforce lint rules like import order.
- `npm run build` runs `prebuild` first (`scripts/build-search-index.js`) —
  don't add data files the search index depends on without also re-running it.
- Large single-line JSON files in `src/data/` (lesson files, footnotes,
  verse text) routinely exceed a normal file-read token limit. Use `Grep`
  with `-o`, `offset`/`head_limit` to sample structure instead of reading
  the whole file.

## Verse-citation system — the part most likely to break silently

Niasse's Arabic commentary quotes Qur'anic verses inline, marked only by
plain parentheses `()` or guillemets `«»` — no dedicated markup. Three
independent files each reimplement the *same* extraction logic
(`extractSpans()`-equivalent: regex `/\(([^()]{2,400})\)/g` and
`/«([^»]{2,400})»/g`, skip any span containing `.`/`{`/`}` without
incrementing the index, paragraph-split on `\n` after filtering out
poem/basmala lines):

- `scripts/match-verses.js` — source of truth. Produces the indices baked
  into `src/data/verseCitations.json` and `verseIndexAuto.json`.
- `src/lib/quranicFragments.ts` — redacts lesson-page Arabic down to cited
  fragments only (copyright reasons — see comment at top of file).
- `src/components/BilingualText.tsx` (`injectVerseNumbers`) — annotates the
  full-text sūrah-page view.

**These three must stay byte-identical.** If you touch the citation regex,
poem filter, or paragraph split in one, apply the same change to all three,
then re-run `scripts/match-verses.js`, `scripts/build-verse-citations.js` and
`scripts/build-citation-status.js` to regenerate the JSON, or verse numbers and
collation marks will silently attach to the wrong citation. `textInject.ts`
recounts spanIndex at render time and hands it to BOTH maps, so a drift breaks
the two together.

### Confidence tiers

- **Hand-curated** (lessons 1–3, in `src/lib/verseIndex.ts`): spot-checked
  individually, not from the matcher.
- **Auto, high-confidence** (lessons 4–56): matcher's substring/pair passes
  only. These are what's wired into the public UI (`verseCitations.json`,
  `verseIndexAuto.json`). Always marked `uncertain: true` in code even
  though they're the "confident" tier, since a paragraph can cover more than
  one verse and the match hasn't been individually verified by a human.
- **Fuzzy word-overlap matches**: deliberately excluded from everything
  public-facing. They're prone to misattributing formulaic/liturgical
  phrases (e.g. the istiʿādha matched a random unrelated verse purely on
  shared function words) to real citations. They only ever lived in the
  private working file `translation-drafts/verse-match-report.json`.

### Known caveat, not yet resolved

The site's own Arabic edition follows Warsh ʿan Nāfiʿ rasm (per the About
page); the reference corpus used to build/verify these indices is Ḥafṣ ʿan
ʿĀṣim. Content is nearly identical between the two but verse-boundary
numbering diverges in a handful of places. Treat auto-generated verse
numbers as reading-navigation aids, not citation-grade, until spot-checked
against the print edition's own numbering.

### Qur'an text corpus

`src/data/verse_text.json` was rebuilt in this session from
`fawazahmed0/quran-api` (via jsDelivr) — `ara-quranuthmanihaf` (Uthmani,
Ḥafṣ) and `eng-mohammedmarmadu` (Pickthall). The original file was silently
truncated at ~90–100 characters per verse for years; if verse text ever
looks clipped again, check `scripts/rebuild-verse-text.js` first before
assuming it's a matching bug. Backup of the old truncated file:
`src/data/verse_text.truncated.bak.json`.

## The verse page carries a lexicon panel — do not strip it

`/verse/[surah]/[ayah]` renders the āya through `src/components/RootPanel.tsx`,
which underlines each word the Quranic Arabic Corpus supplies a root for and
opens a lexicon card on hover or tap. It was rebuilt once already after a
session removed it while working on something else, so: if you are editing that
page and the āya block looks like it could be a plain `<p>`, it cannot.

Three things about it that are easy to undo by accident:

- **`src/data/verseRoots.json` is 634 KB and must stay on the server.** Only
  the one āya's array crosses into the client bundle. `src/lib/volumes.ts`
  documents what shipping reference data into a bundle costs.
- **The roots are Ḥafṣ, re-keyed to this Warsh text** by
  `scripts/align-warsh.mjs`. 125 of the 6,236 āyāt differ in word count between
  the riwāyāt, so a positional map built on Ḥafṣ cannot simply be laid over
  this text.
- **A word with no underline is deliberate silence**, not a gap to fill with a
  stemmer. `claude/lexicon-hover-commentary.md` has the measurement: a light
  stemmer gets the root right 64% of the time, which on a critical edition is
  worse than saying nothing. Niasse's own commentary carries no annotation at
  all, on the same grounds.

## Two agents on this repo at once

It has happened, and it cost a revert. Symptoms: your working tree looks
current but `origin/main` has commits you have never seen, and a file you
"changed" comes back different. Before editing, `git fetch` and check whether
`HEAD` is still an ancestor of `origin/main`; if you are running alongside
another session, take a separate worktree rather than sharing one checkout.
`src/app/globals.css` and `src/data/corpus.json` are the two files both
sessions reach for, and the CSS variables at the top of `globals.css` have
already been clobbered once by a whole-file rewrite — edit them in place.

## Editorial apparatus vs. body-text citations

`src/data/footnotesData.json` (served via `/api/footnotes`, see
`src/app/api/footnotes/route.ts`) is al-Ibrāhīmī's separate footnote
apparatus, linked to body text only by `[N]` markers — a completely
different regex/system from the verse-citation brackets above. The verse
matcher never touches this file.

Investigated directly (2026-08): is there any typographic convention in the
body text itself that distinguishes a genuine Qur'anic citation Niasse
makes from his own parenthetical gloss, or from any editorial insertion the
compiler might have made directly in the running prose (as opposed to a
footnote)? Checked the transcribed Arabic for Vol. 1, Lessons 1–6 directly:
no ornate Qur'anic brackets (﴾﴿), no Arabic text inside square brackets
(square brackets are only ever `[N]` footnote markers or English
translator glosses), curly braces appear twice total across six lessons and
read as OCR noise, not a convention. **Conclusion: no such convention
survives in the digitized text.** Whether the original print scans ever had
one is unconfirmed — the Google Drive PDFs in the FIR project folder
returned empty content through the Drive connector's `read_file_content`
(both a 63MB standalone Vol. 1 PDF and the six-volume shortcut folder), so
they were never actually viewed. If this needs settling, the working path
is a direct photo of a specific page, not the Drive connector.

## Footnotes exposure — mitigated, not solved

`public/data/footnotes.json` (unauthenticated, directly linkable, ~2000
entries) was moved to `src/data/footnotesData.json` and is now served
through `/api/footnotes?lessonId=N`. This removes the one-click bulk
download but does not prevent scraping of content that's meant to be
publicly readable — nothing short of a login wall does that, and adding one
is a product decision, not made here. `src/data/footnotes.json` (no
"Data" suffix) was a leftover, unreferenced file from before this move —
confirmed unreferenced (grepped the whole repo) and deleted 2026-08-16.

## Environment quirks (this agent's tooling, not the app)

Encountered and worked around this session, may recur:

- `Edit` calls with Arabic/diacritic text in `old_string` intermittently
  fail to match content `Read` just displayed identically (likely a Unicode
  normalization mismatch between typed and stored text). Workaround: use
  `Write` to replace the whole file instead of `Edit`.
- PDF rendering (`Read` tool) requires `pdftoppm`/poppler-utils, not
  available in this sandbox. Photos/screenshots of pages work; PDFs don't.
- Sandbox `bash` has previously failed entirely (`useradd` / disk space
  errors) for an entire session — if that happens again, write scripts for
  AK to run locally via Terminal and read the output files back afterward.

## Table of contents — consolidated 2026-08-16

The site used to have four independent, partially-duplicate implementations
of "browse the lessons": `LessonPageNavigator.tsx` (desktop sidebar, bare
lesson-number chips), `MobileLessonDrawer.tsx` (mobile drawer, same but
worse), the homepage's `VolumeAccordion` (volume → lesson with title/sūrah,
no verse range), and `/read`'s hand-hardcoded `SURAS`/`LESSONS`/
`SURA_TO_LESSON`/`SURA_LESSON_END` arrays (verse ranges, but no volume
grouping, and a second copy of the sūrah→lesson map that already existed in
`src/lib/surahLessons.ts` for `/surah/[id]`). None of this was flagged
anywhere; it was found by directly reading each component.

Now: one shared tree component, `src/components/VolumeLessonTree.tsx`,
renders volume → lesson (title, sūrah, verse range, EN badge) in either a
`density="compact"` bare-number form (desktop sidebar) or a
`density="comfortable" search` form (mobile drawer, and the full `/read`
page via `src/components/ReadTableOfContents.tsx`). It's fed by
`volumesFromLessons()` (new sync helper in `src/lib/volumes.ts`, factored
out of `getVolumesWithLessons()`) so no file re-hardcodes lesson titles,
sūrah names, or verse ranges — those all come from `src/data/lessons/*.json`
via `getAllLessons()`, same as everywhere else on the site.

`/read`'s "Jump to Sūrah" section is kept as a *separate* section (not
folded into the tree) because it's a genuinely different index — by sūrah
number across lesson boundaries, matching `/surah/[id]` — not a second copy
of the volume/lesson browse. It now reads `SURAH_LIST` +
`getLessonIdsForSurah()` (the real data `/surah/[id]` already used) instead
of its own hardcoded 114-sūrah array.

`VolumeAccordion.tsx` (homepage) is deleted — the homepage now just links to
`/read` instead of embedding a second, slightly different lesson-browse
widget. `LessonPageNavigator` and `MobileLessonDrawer` both gained a
`lessons: Lesson[]` prop; `src/app/lesson/[id]/page.tsx` now calls
`getAllLessons()` once in the page component itself (it already called it
in `generateStaticParams()`, but that's a separate function scope) and
passes it down through `PanelJumpTabs` to `MobileLessonDrawer`.

## Jalālayn/Rūḥ al-Bayān verse-correspondence bug — fixed 2026-08-16

AK reported on the live site (lesson 1): the Shaykh Ibrāhīm excerpt shown
alongside each individual Jalālayn/Rūḥ al-Bayān verse was the same static
blob repeated under every verse; the English excerpt was likewise static and
repeated; and the Arabic/English halves of that static excerpt didn't even
correspond to the same content as each other. Root cause:
`JalalaynVerseView.tsx` computed ONE Niasse excerpt for the whole lesson
(Arabic via a crude `indexOf('ينبغي'/'قال')` heuristic, English via the
first 1000 characters of the translation) and rendered it identically inside
every per-verse card.

Fixed by hand-curating a real per-verse mapping for Lesson 1 / al-Fātiḥa
(the only lesson with real comparison-panel data so far): see
`src/lib/lesson1FatihaVerseMap.ts` for the paragraph-index maps (built by an
actual verse-by-verse reading of Niasse's Arabic and English commentary, not
an algorithm — his lecture bundles some verses together and covers others in
two separate, non-adjacent passes, which no generic "next verse starts here"
rule handles correctly; that file's header explains the reasoning in detail)
and `src/lib/niasseVerseExcerpt.ts` for the extraction function. `page.tsx`
computes this once server-side and passes it to `JalalaynVerseView` as
`niasseByVerse`, which now looks up the correct excerpt per verse instead of
computing its own. A verse with no curated data (or a lesson other than 1)
shows a plain "not yet curated" note instead of a wrong/reused excerpt.

**Known, disclosed gap:** the English translation appears to skip a
substantive discussion of verses 1:3 and 1:4 that IS present in the Arabic —
English paragraph 26 ("...Lord of all the worlds") jumps straight to
paragraph 29 ("You alone we worship"), verse 2 to verse 5 with nothing in
between. Represented honestly (`en: null` for those two verses, with an
explicit UI note) rather than papered over.

### Follow-up: two more real bugs caught during live verification — fixed same day

The fix above shipped, but checking it live on niassetafsir.org (rather than
trusting the RSC flight payload alone) turned up two more genuine bugs before
the "not yet curated" fallback actually went away:

1. **Bracket-key mismatch, `JalalaynVerseView.tsx`.** `parseJalalayn()`
   produces verse keys WITH brackets (`"[1:1]"`, via the regex split), but
   `niasseByVerse` — and `lesson1FatihaVerseMap.ts`'s `ARABIC_PARAS`/
   `ENGLISH_PARAS` it's built from — is keyed WITHOUT brackets (`"1:1"`).
   Every lookup was `undefined`, so every verse silently fell through to the
   "not yet curated" message — i.e. the verse-correspondence fix above had
   not actually reached users despite passing local review. Fixed by
   stripping brackets before lookup: `v.key.replace(/[\[\]]/g, '')`. This is
   exactly the kind of bug that a check of the SSR-serialized data (which
   was correct) will not catch — only checking what the client code that
   *consumes* that data actually renders will.

2. **Un-decoded HTML entities, `niasseVerseExcerpt.ts`.** Once (1) was
   fixed, the English excerpt text rendered literal `&#x27;` in place of
   apostrophes (e.g. "Allāh&#x27;s Name"). `lesson.englishText` is normally
   consumed via `dangerouslySetInnerHTML` elsewhere (`BilingualText.tsx`,
   the print page), which decodes entities for free; here the extracted
   paragraph text is rendered as a plain JSX text child
   (`{excerpt.en}`/`{excerpt.ar}`), which does not decode anything. Fixed by
   adding a `decodeEntities()` helper (handles hex `&#x27;`, decimal `&#39;`,
   and the named entities actually present in the data) applied to both the
   Arabic and English paragraph arrays before they're joined into excerpts.

Both confirmed fixed via a local production build (`next build && next
start`), not just `next dev` — screenshots showed genuinely distinct,
correctly-decoded Arabic+English Niasse commentary for verses 1:1, 1:2, 1:5,
and 1:7 under the Jalālayn panel.

**Unrelated environment note, not an app bug:** while debugging why a fresh
`next start` wasn't picking up code changes, found that stale `next-server`
processes left running across a `rm -rf .next && npm run build` cycle can
keep serving old client HTML referencing chunk hashes that no longer exist
in the new build (404s on click, breaking ALL client interactivity on the
affected page — not just this feature). Always fully kill old
`next start`/`next-server` processes (`pkill -9 -f`, then verify with
`ps`/`lsof`) before starting a server against a freshly rebuilt `.next`.

## Two hydration bugs found in a full-site QA sweep — fixed 2026-08-16

Crawled all 268 generated pages with Playwright (production build, headless
Chromium) checking for console/page errors, not just HTTP status. Found and
fixed two real, pre-existing bugs (both now confirmed clean across all 268
pages):

- **All 56 `/lesson/[id]/print` pages** threw a React hydration error
  (#418/#423) on every load. Cause: the page rendered its own
  `<html>/<head>/<body>`, but Next.js App Router only allows the ROOT layout
  to do that — the browser silently restructured the invalid nested markup,
  which didn't match what React expected. Fixed by making it a normal page
  inside the root layout: `SiteNav`, the new `SiteFooter` (extracted from
  `layout.tsx` for this reason), and `PersistentNav` (already did this) now
  all opt out of `/lesson/*/print` by pathname check, and a
  `body:has(> .lesson-print-page)` rule in `globals.css` resets the body's
  background/padding so the page still looks like a clean, independent
  document. The `window.print()` trigger moved from a `dangerouslySetInnerHTML`
  script injection to a real client component, `PrintButton.tsx`. Also hit a
  second-order issue on the same page while fixing the first: a raw
  `<style>{`...`}</style>` JSX text child gets HTML-entity-encoded by React's
  SSR (`'` → `&#x27;`) but not by the browser's own `<style>` parsing on the
  client, causing a text-content hydration mismatch — fixed by using
  `<style dangerouslySetInnerHTML={{__html: ...}} />` instead, which is
  inserted as raw HTML on both passes.

- **`/surah/1` and `/surah/2`** (only these two — the only sūrahs whose
  lessons currently have English translations) threw the same class of
  error. Cause: `SurahReader.tsx`'s English-paragraph rendering wrapped a
  complete `<p class="en-para">...</p>` HTML string (from `englishParagraphs()`)
  inside ANOTHER real `<p>` element via `dangerouslySetInnerHTML` — a `<p>`
  can't legally contain another `<p>`, so the browser closed the outer one
  early, again mismatching React's expectations. `BilingualText.tsx` already
  handles the identical situation correctly by wrapping in a `<div>` instead
  of a `<p>`; `SurahReader.tsx`'s `LessonBlock` now does the same.

## Lessons 1–6 Arabic rebuilt verbatim from Google Drive — 2026-08-16

AK's Google Drive has a folder "FIR — Consolidated Digitized Lessons (2022
10-vol. edition)" (parentId `1sKaOuyOODK4ouWtB588VFSbt5MRSwUgt`) containing
one Google Doc per lesson ("Copy of volume N Lesson M"), which AK actively
edits and treats as the verified source of truth — "my pilot ... I have
verified them on the google drive docs." Lessons 1–6 were checked against
these docs word-for-word (download as .docx via the Drive connector, extract
paragraphs with `python-docx`, normalize to NFC, diff word lists with
`difflib`) and real discrepancies were found and fixed directly in
`src/data/lessons/0{1..6}.json`:

- **Lessons 2, 4, 5, 6 had NO `openingInvocation` field at all** (not empty —
  entirely absent from the JSON), so the istiʿādha/ṣalawāt/poem preamble
  Panel never rendered for these four lessons. The text still existed,
  unused, in the legacy `arabicText` field. Restored from the Drive docs.
- **Stray print-transcription artifacts leaked into `arabicBody`**: literal
  page numbers (bare `59`, `61`, `65`, `70`, etc.) and horizontal-rule
  divider strings (`——————————`) sitting mid-sentence, from the Drive doc's
  own page-by-page transcription. Removed, rejoining the sentence on both
  sides.
- **Lesson 1 was missing its closing duʿāʾ** (the final paragraph beginning
  "اللهم صل على سيدنا محمد الفاتح لما أغلق...") — present in Drive, absent
  from the site. Appended.
- **A one-letter typo**, "العلي العظير" → should be "العلي العظير" →
  "العلي العظيم" (the invocation formula; "العظير" isn't a word), fixed
  where found.
- **Lessons 5 and 6 were substantially behind the Drive docs** — not a
  typo-level gap but real missing content: site's lesson 5 was ~43% shorter
  than Drive (5588 vs 9905 words), lesson 6 ~54% shorter (4171 vs 8963
  words). AK had evidently expanded both significantly on Drive after the
  site was last synced. Both `arabicBody` fields were fully rebuilt from the
  Drive docx's own paragraph structure (used as-is, unmerged — see note
  below on why), then verified to match Drive 100% word-for-word (9905/9905
  and 8963/8963).
  - Lesson 6's docx has a Volume-1 table-of-contents block ("المحتويات...")
    appended after the real content ends (at the paragraph ending "…وَإِنَّكَ
    لَمِنَ الْمُرْسَلِينَ)."،  Q. 2:252) — this is back-matter from the print
    volume, not part of the lesson; it's excluded from `arabicBody`.

**Two important process notes for next time:**

1. **The word-diff tool has false positives on repeated formulaic phrases.**
   Niasse's prose repeats short Qur'anic/liturgical phrases (e.g. the
   istiʿādha, or "يَسْتَحْيِ" appearing twice near each other in lesson 3's
   mosquito-parable passage) — `difflib.SequenceMatcher`'s LCS alignment can
   get confused by these and flag a `replace`/`insert` block that, on direct
   inspection, is byte-identical to the correct Drive text just aligned to
   the wrong occurrence. **Always read the full surrounding context in both
   sides before editing** — a first pass at "fixing" lesson 3's one flagged
   diff would have deleted a passage that was actually already correct and
   verbatim. Caught only by re-reading raw `arabicBody` context before
   writing, not by trusting the diff tool's opcode labels.
2. **Docx paragraph granularity is inconsistent across these Drive files,
   not just across lessons.** Lesson 1's docx paragraphs are short
   line-wrap fragments (one Google Docs paragraph ≈ one printed line, ~15–30
   words, mid-sentence breaks are normal) — the site's existing
   well-formed 86-paragraph `arabicBody` for lesson 1 was already a prior
   hand-merge of these fragments and was left untouched. Lessons 5 and 6's
   docx paragraphs, by contrast, are already genuine multi-sentence editorial
   paragraphs (avg. ~450 chars, up to 1700). For the lesson 5/6 rebuild this
   session, Drive's own paragraph breaks were used as-is with **no merge
   heuristic applied** — deliberately, to avoid the risk of a heuristic
   mis-joining or mis-splitting real content when rebuilding ~10,000 words
   of dense classical Arabic from scratch. If a future editorial pass wants
   lesson 5/6 paragraph granularity to visually match lessons 1–4's, that's
   a separate, lower-stakes styling task — content-wise both are already
   100% verified against Drive.

**Not done in this pass:** verifying that the English translations (task 2
of AK's original ask) correspond paragraph-for-paragraph to the
now-corrected Arabic, for lessons 1–6. Lesson 6 currently has no English
translation on the site at all (`hasEnglish: false`). Also not touched:
`arabicFootnotes`/`footnoteOrder` for any lesson — those are a separate,
already-built apparatus (bracket-marker system for 1–4, inline "N - ..."
text within `arabicBody` itself for 5–6, matching how Drive's own
transcription handles footnotes per lesson) and weren't re-derived from
Drive this session.

## Long-term vision (not scoped, not started)

AK's *Majmaʿ al-Tafsīr* concept — a longer-term shape for this project
beyond the current single-edition reader — has been discussed but is
explicitly not a current build target. Don't start on it without AK
re-raising it as an actual request.

## Full Arabic commentary text published site-wide — 2026-08-16

While starting task 2 of AK's Arabic/English matching request (see the
section above), found that **the Tafsir panel and the print page did not
display the full Arabic commentary text at all** — only bare Qur'anic
verse-citation fragments extracted out of it. This was `src/lib/quranicFragments.ts`
(deliberate redaction, comment cited unconfirmed reproduction rights for
the Majmaʿ al-Yamāma 2010 revised print edition's specific Arabic
commentary text). The print page additionally computed the full Arabic
body into a `body` variable and then never rendered it at all — dead code,
apparently orphaned when the Arabic side of the print edition was pulled.

Told AK directly rather than assuming either way, since this is a rights
question about a specific print edition, not a call to make unilaterally.
**AK confirmed (2026-08-16): he holds reproduction rights across the whole
revised edition and wants the fragment-only redaction lifted site-wide**,
not just for Lessons 1–6.

Worth noting: the redaction was already inconsistently applied before this
change — `SurahReader.tsx` (the `/surah/[id]` continuous-reading view) was
already receiving and rendering `lesson.arabicBody` in full, unredacted,
via its `SurahLessonData.arabicBody: string` prop. That's what confirmed
the old restriction was leaky in practice, not evidence it was safe to
leave the Tafsir panel as-is.

**What changed:**

- `src/lib/quranicFragments.ts` deleted. Replaced by
  `src/lib/arabicCommentary.ts`'s `splitArabicCommentary()`, which returns
  full paragraphs (poem lines separated out) instead of redacting to
  citation fragments. Same paragraph indexing as before (index-parallel to
  `VERSE_INDEX` paraIndex / `verseCitations.json`), so nothing downstream
  that depends on paragraph index broke.
- `BilingualText.tsx`: `arabicFragments` prop renamed `arabicParagraphs`,
  now full text. Added a `citations` prop so `injectVerseNumbers()` can
  still badge quoted verses with their `surah:ayah` reference, matching
  `SurahReader.tsx`'s existing treatment. The "no alignment yet" two-box
  fallback (still the common case — `BILINGUAL_ALIGNMENT` is empty) now
  shows full Arabic commentary next to the full English translation,
  relabeled "Arabic commentary" (was "Qur'anic citations", with a caveat
  that's no longer true). The Arabic-only tab and the alignment-block
  rendering path both got the same treatment, plus footnote-link injection
  the Arabic-only tab was previously missing.
- Extracted `isPoem`, `injectFootnoteLinks`, `injectVerseNumbers`,
  `highlightEnVerses`, `stripEnFootnotes` out of `BilingualText.tsx` (a
  `'use client'` file) into a new plain module, `src/lib/textInject.ts`, so
  the print page (a Server Component) can call them directly rather than
  importing from a client-boundary module. `BilingualText.tsx` re-exports
  them from there, so `SurahReader.tsx`'s existing `import ... from
  './BilingualText'` didn't need to change.
- `src/app/lesson/[id]/print/page.tsx`: the orphaned `body` variable is now
  actually rendered — a new "Arabic Commentary" section (RTL, Amiri serif,
  footnote links, verse-number badges, opening poem/invocation lines)
  before the existing "English Translation" section. Previously this page
  silently showed English only.

**Deliberately left alone:** `public/data/search-main.json` and the script
that builds it, `scripts/build-search-index.js`. That file was emptied
specifically as an "emergency stopgap" after being caught as a single
unauthenticated fetchable URL exposing the full corpus in bulk — a
different, narrower risk (one-request full-book scraping) than the
per-lesson-page display question AK just answered. Its own header comment
still describes it as reduced to Qur'anic-citation fragments, matching the
old (now-removed) per-page redaction — it's now inconsistent with what the
lesson pages themselves show, but re-exposing a single bulk-fetchable
full-text endpoint is a distinct decision from "show the full text when
someone reads a lesson page," and wasn't part of what AK confirmed. Flag
this to him explicitly before touching it.

## Task 2 (English/Arabic correspondence) — in progress

AK's original ask, part 2: verify the English translations correspond
exactly to the (now Drive-verified) Arabic, lessons 1–6. Two things found
so far, both already in the codebase before this session:

- `src/lib/draftTranslations.ts`: lessons 3, 4, 5 are already flagged
  `DRAFT_TRANSLATION_LESSONS` — first-draft English, not yet reviewed
  word-for-word against the Arabic. This is presumably exactly the gap AK
  is asking about.
- `src/lib/bilingualAlignment.ts`: a disabled (`BILINGUAL_ALIGNMENT = {}`)
  paragraph-level Arabic↔English alignment map, hand-drafted for lessons
  1–2 against the OLD `arabicText`/pre-rebuild `arabicBody` indexing —
  needs a full rebuild against the current `arabicBody` (which changed
  substantially for 1, 2, 4, 5, 6 this session) before it can ship. Its own
  comments document real content gaps found in that draft pass (e.g.
  lesson 1: Arabic paragraphs 9–18 and 24–30 have no confirmed English
  match; lesson 2: paragraphs 11–12, 17–18 unmatched) — worth reading
  before redoing the work from scratch.
- Lesson 6 has no English translation at all (`hasEnglish: false`) — needs
  AK's input on whether/how to source one before this can be closed out.

### Bare letters that are NOT scan damage

A survey of all 56 lessons (16 September 2026) found 2,079 places where a single
letter stands where a word should. Most are the scan flattening a word — مِن
comes out as م (561), ص (420) and س (31); فِي comes out as ي (74) — and
`SCAN_HYPOTHESES` in `scripts/repair-quranic-citations.py` handles those inside
citations.

**Two are conventions, not damage. Do not "fix" them.**

- **و** — 532 instances. The compiler writes `و(الرَّحِيمِ)` and `و«الرَّجِيمِ»`,
  and 52 times `وَ) اذكر (`, where the wāw of the āya sits outside the bracket
  and the gloss follows. This is how the printed apparatus works; rewriting it
  breaks the lemma/gloss structure.
- **ج** — 14 instances, every one beside a volume and page: `ابن كثير ج ١/٣٦١`,
  `الجامع لأحكام القرآن ج ١٥/٥١`. It is *juzʾ*.

**Four are mixed and wait on AK**: ه، ن، ا، ل (268 between them). One ه in
Lesson 2 is Jibrīl naming a letter to the Prophet — correcting it would corrupt
the passage. ن is عِندَ in one place and مِنَ in another; ا is sometimes the
interrogative hamza; ل is often a split proclitic لِي.

## Repairing the Qurʾānic citations

`scripts/repair-quranic-citations.py` rewrites a bracketed or guillemeted span
to the Warsh text of the run it quotes. It acts only inside `( )` and `« »`,
which is where AK's rule makes a divergence from the āya an error by
definition; outside them the words are Niasse's and the script does not touch
them. Each sūra is treated as one stream of words so a citation crossing an āya
boundary matches as one thing, and words are compared with the diacritics and
orthography stripped, since that is what the scan destroys. A span is rewritten
only when the best window scores ≥ 0.82 and beats the next-best elsewhere in the
muṣḥaf by ≥ 0.10 — a span that matches two places equally is left alone, and so
is a span that mixes Niasse's gloss in with the quotation.

Dry run by default; `--write` applies; a lesson id limits it to that lesson. The
run of 15 September 2026 rewrote 2,345 spans across all 56 lessons and left
1,937 alone; the full before/after is in
`translation-drafts/quranic-citation-repair-2026-09-15.txt`.

**Re-run the citation pipeline afterwards, in this order**, or the indices
describe text that no longer exists:

```
node scripts/match-verses.js
node scripts/build-verse-citations.js
node scripts/add-editorial-verse-index.js --write   # MUST follow the line above
```

## Quotation brackets — the glyph, never the span

`scripts/repair-quotation-brackets.py`. The scan renders one delimiter as three
different glyphs. Corpus-wide the edition closes 13,899 spans with `( )`, 1,228
with `« »` and 207 with `{ }` — and 173 of the 207 are Lesson 7, whose body came
from AK's verified document rather than the scan. Outside Lesson 7 there are
1,359 `{` against 124 `}`. An opener that almost never closes is the scanner
misreading `(`, so Lesson 7 is excluded outright and the rest are candidates.

**Deletions ran on 16 September (124 of them).** A doubled opener — `({`, `{(`
or `{{` with nothing but space between — is the scan printing one bracket twice.
Removing the brace cannot invent a quotation, cannot move a boundary and cannot
change which characters fall inside the span, so it needs no judgement. The diff
is 46 files, one line each, and the only bytes removed are 124 `{`.

**Conversions (`{X)` → `(X)`, 918 of them) have NOT run.** They await AK. An
adversarial read of all 1,062 original candidates found the reason: converting
the glyph assumes the span is sound, and the span is exactly what this script
promises not to inspect. Where the scan dropped a footnote or a paragraph of the
Shaykh's spoken commentary into the middle of an āya, repairing the bracket turns
a visibly broken quotation into a clean-looking false one — publishing a lexical
note from the *Lisān* as part of Q 11:88, or al-Durr al-Manthūr as part of
Q 59:18. The guards now catch those (see the docstring), but two further things
are true and unresolved:

- Every `{X)` conversion consumes a `)` that a naive matcher currently pairs with
  an earlier `(`. Across Lessons 41–56 the count of openers with no closer goes
  161 → 301. That is the true state being exposed rather than a defect being
  created — the scan really did drop those closers — but `scripts/match-verses.js`
  extracts `/\(([^()]{2,400})\)/g`, so the conversion changes what it sees. Run
  the verse pipeline after, in the order this file already specifies.
- `*` is a fourth misread delimiter glyph — `(وَالْحِكْمَةُ * سُنة النبي` wants `)`
  at the asterisk. It needs its own pass, because `**` also carries Markdown bold
  on the sūra headers.

Left alone deliberately: `«X)` and `(X»` (154 spans — both are real delimiters
here, so reading is the only way to tell which glyph is right), balanced `{X}`,
and any opener with no closer anywhere.

Two corpus defects surfaced by the same audit and not yet fixed: Lesson 13
contains a ~1.76 kB passage twice, and Lesson 30 duplicates a block around
offsets 8890 and 10398.

## CORRECTED 19 Sept — the footnote anchors DO exist, in the OCR text

The section below is wrong and is kept only so the mistake is not repeated. It
concluded the anchors were unrecoverable because the Drive documents carry no
Word footnote elements — no `w:footnoteReference`, no `word/footnotes.xml`. That
test was the wrong test. **These documents are OCR of photographed pages**, so
the compiler's superscript numerals come through as ordinary text, and so does
the footnote block printed at the foot of each page:

    …إن سورة الإخلاص تعدل ثلث القرآن 1. من قرأ…      ← the marker
    1 - أخرج البخاري في كتاب التوحيد…                ← the note

In Lesson 56 alone: 16 inline markers and 21 block openers, numbered per printed
page and restarting — which is exactly the `num` pattern in `footnotesData.json`
(never above 5, constantly restarting). Page boundaries are recoverable too,
since the OCR keeps the bare page number as its own paragraph.

So the programme is: per page, pair marker *k* with block *k*. Counts do not yet
align — 16 markers against 21 candidate blocks against the 10 notes on file for
Lesson 56 — so the pairing needs building and auditing before anything is
written. But it is a text problem, not a missing-source problem.

## SUPERSEDED — the earlier conclusion, and why it was wrong

Checked exhaustively on 16 September, so it is not re-attempted. All 2,034 notes
are in `src/data/footnotesData.json`; 324 are published (Lessons 1–7), 1,710 are
not. The blocker is not the notes. It is where each note attaches.

- The repo's own `[N]` markers are unusable. In every lesson from 8 to 56 the
  last marker sits 35–53% through the body (median 45%) — the signature of the
  truncated import, matching the 50.1% median cut in
  `claude/site-text-truncated-at-half.md`. Marker count, note count and
  `footnoteOrder` length disagree three ways (L30: 44 / 54 / 59).
- The notes carry no position of their own. `num` never exceeds 5 anywhere in
  Lessons 8–56 and restarts constantly: these are the printed edition's
  per-page numbers. `volRef` is the *lesson's* first page repeated, not the
  note's own page (L9: 60 notes all reading "Vol. 2, p. 46").
- The Drive sources do not have anchors. The Google Docs in "FIR — Consolidated
  Digitized Lessons" carry no `w:footnoteReference` and no `word/footnotes.xml`
  at all — checked on Lesson 56. `scripts/recover-lesson-text.py` recovered the
  missing half from *plain-text* exports, which is why the recovered half has no
  markers.
- AK's `Lesson_NN_Bilingual.docx` files (Lessons 1–30, on disk) carry zero
  footnote references. The verified "Citations Fixed" documents that fixed
  Lessons 1–7 are not on disk or in Drive under that name.

So the anchor exists in exactly one place: the superscript numerals on the
printed page. Recovering them means reading the page images, not running a
script. `claude/footnote-markers-missing-in-recovered-half.md` records why
deriving positions by paragraph was measured at 69% and rejected; nothing has
changed that.

## The 268 bare letters are not a scan substitution — do not automate them

Ruled 16 September, with AK's leave to use judgement, and the judgement is to
leave them alone.

`ص → من` was worth a rule: one mapping, 420 occurrences, the Qurʾān deciding
every one. `ه ن ا ل` are not that. Of 268, only 127 sit inside a bracketed or
guillemeted span where the āya can arbitrate at all, and of those only 12 sit in
a span that matches its āya well enough to align. Those 12 align to **twelve
different words**:

    ه → الله · بالله · لن        ن → فسوف · نزلنا · دائبين · نب
    ا → ان · الذين · وارتقبوا    ل → اولئك · ان · لا

No mapping repeats. These are not one letter standing for one word; they are
what is left when the scan breaks a word apart and strands a letter — so the
repair is to restore the word, which means editing the text around the letter,
not substituting the letter. That is hand work on individual passages, and a
rule applied across 268 of them would invent 268 readings.

The same reasoning that kept 546 instances of `و` and `ج` out of
`SCAN_HYPOTHESES` applies here, and for the same reason: frequency is not
evidence of a substitution when the targets do not agree.

## Lesson 55 contained the whole of Lesson 56 — cut 16 September

Its `arabicBody` ran to 100,513 characters, twice the corpus median, because
paragraph 222 was the bare heading `سورة الإخلاص` and everything after it was
Lesson 56: al-Ikhlāṣ, al-Falaq, al-Nās, then volume 10's back matter. Thirty-four
paragraphs over 200 characters sat in both lessons, including 1,848 characters
on al-Ikhlāṣ. It is the only cross-lesson duplication in the corpus.

Lesson 55 now ends at paragraph 221, the second half of the al-Masad ḥadīth
citation (Bukhārī 4770 / Muslim 307). All 35 of its `[N]` markers are in the
retained text, so `footnoteOrder` is untouched. **Lesson 56 was not modified.**

### What was tried first, and why it was wrong

The obvious move — give Lesson 56 the copy from Lesson 55's tail, which is
fuller by ~1,300 characters of inline bibliographic citations (Rūḥ al-Maʿānī
30/265–266, al-Durr al-Manthūr 8/682–683, Bayhaqī 7061, Muslim 1344 and others)
— was built, audited and reverted. The premise was backwards. Lesson 56's copy
is editorially cleaned; Lesson 55's tail is the raw OCR stream, and taking it
would have imported 12 page running-heads breaking sentences mid-clause, six
markdown backslashes, six more bare footnote digits, and 139 paragraphs of
volume-10 back matter — a taqrīẓ qaṣīda, the colophon, and the fihris — into a
239-paragraph lesson whose commentary ends at paragraph 99. It would also have
destroyed the only surviving record of where Lesson 56's ten notes attach.

The tail is kept at `translation-drafts/lesson-55-tail-removed.txt`. Merging its
citations into Lesson 56 is worth doing and is a per-paragraph edit, not a
replacement.

### Also fixed here

`suras` described neither lesson: 55 held `[87…99]` and 56 held `[100…111]` —
the twelve sūras that are Lesson 55's. Both now agree with `lessonRanges.json`
and `surahLessons.ts`: 55 → 87–111, 56 → 112–114.

### Closed — re-measured 25 September

Everything this section listed as open had in fact been done, and the note was
never struck off. A stale worklist costs more than no worklist: a later session
began cutting Lesson 56's back matter before measuring, and the back matter was
already gone. Measure first, and strike items off when they close.

- **Lesson 56's volume-10 back matter — gone.** The lesson now runs 80
  paragraphs and ends on the khatm duʿāʾ, as it should. No colophon
  (`تم الكتاب`), no `المحتويات` heading, no fihris dot leaders, no taqrīẓ.
  The paratext is preserved in `src/data/volumeBackMatter.json`, three to five
  entries for each of volumes 2–5 and 7–10.
- **Repeated paragraphs — none.** All 56 lessons swept for any paragraph of 200
  characters or more standing twice in the same lesson: zero, where this
  section named seven across L8, L13, L22 and L30.
- **Term-concordance loci pointing past the end of their lesson — none.** All
  873 loci carry a lesson and a paragraph index that exists, where this section
  and the audit above it named 62 stale and ~25 drifted.

## Volume back matter is not commentary — cut 19 September

Every volume closes, in the printing, with its fihris; volume 8 adds the
printer's colophon and volume 10 three taqārīẓ and a chronogram. The import read
all of it as the Shaykh's words. Lesson 56 was the worst: 135 of its 219
paragraphs were a taqrīẓ qaṣīda and a table of contents for sūras 62–114, so a
reader of the final lesson met them as tafsīr. Eight other volume-final lessons
carried 4 to 23 paragraphs of the same.

`scripts/extract-volume-back-matter.py` cuts them and writes all 246 paragraphs
to `src/data/volumeBackMatter.json`, keyed by volume. **Nothing is deleted, and
nothing renders it yet** — this preserves the paratext, it does not publish it.
Every boundary was read; the guard in `EXPECT` fails loudly if a body shifts.
Two boundaries are not the `المحتويات` heading: Lesson 30's fihris starts seven
paragraphs earlier (dot leaders, `سورة يوسف . ..`, are what tell a fihris line
from a running head), and Lesson 56's cut is the first taqrīẓ, after the khatm
duʿāʾ that closes the whole work.

### Lesson 35 was handed the wrong volume's tail

It is volume 6 (al-Muʾminūn–al-Nūr), but from paragraph 104 its body
commentates **al-Isrāʾ** — volume 5's last sūra, Lesson 30's subject — and the
fihris after it lists Yūsuf to al-Isrāʾ, volume 5's contents. Eight of those
seventeen paragraphs stand word-for-word in Lesson 30 already. They are filed
under volume 5 and, because they are exegesis rather than paratext, kept in a
separate `misfiledCommentary` array: calling them back matter would file the
Shaykh's commentary as a table of contents.

Consequences worth knowing: **volume 6's own fihris is nowhere in the corpus,
and neither is volume 1's**, though both were printed with one. Those are import
gaps, not absences in the book.

### Index space

These cuts count non-blank paragraphs; every `paraIndex` downstream counts the
poem-filtered array. They agree in every lesson here except 56, where raw 84 is
rendered 83. Cutting at the tail, surviving indices are stable either way.

## Stale paragraph indices — prune after any body change

`scripts/prune-stale-para-indices.js`. A `paraIndex` past the end of its lesson
is a citation to a paragraph that does not exist: the verse-jump button renders
and silently does nothing, and `src/lib/corpus.ts` emits a locus for it marked
`transcriptionStatus: 'verified'` — the site asserting it checked a passage it
cannot show. Neither `build-verse-citations.js` nor `add-editorial-verse-index.js`
prunes, so they accumulate. Twenty-four were found on 19 September, ten of them
left by the Lesson 55 cut three days earlier and eight in lessons nothing had
touched. **Run it last in the pipeline, after every body change.**

### Still open

`public/data/term_concordance.json` holds 873 loci, of which **62 point past the
end of their lesson** — nearly all pre-existing (Lessons 5, 20, 22 were never
cut). Its generator is not in `scripts/`, so it was left alone rather than
hand-edited. The audit also found ~25 more whose recorded context no longer
matches their recorded index.

## What has actually been verified, and by whom — AK, 19 September

The site had been asserting more than anyone had done. Both claims below were
live and both are now corrected in `src/lib/corpus.ts`.

**Prose: Lessons 1–6 only.** AK has read the Arabic of those six against the
printing. Lessons 7–56 have had no such pass — they are uncorrected OCR. Every
derived Fī Riyāḍ locus was nevertheless born `transcriptionStatus: 'verified'`,
so the "not yet proofread" notice in `VerseLocusCard` never appeared for any
lesson and a scanned lesson looked exactly like a checked one. Now: `'verified'`
for 1–6, `'ocr'` for 7–56, with a notice of its own.

**Verses: none, in any lesson.** Not Lessons 1–3, not 1–6. `HAND_CURATED_LESSONS
= {1,2,3}` tagged those links `confidence: 'curated'`, which renders as "●
verified" with the tooltip *"This attribution was checked against the text by a
human."* Nobody has. The index they come from says as much in its own header:
built by matching guillemet-quoted clauses against a **Ḥafṣ** reference while
the edition follows **Warsh**, and "not citation-grade until spot-checked
against the print edition's own numbering". An extra machine pass over three
lessons is not a human reading them. All derived links are now `'auto'` —
"matched, unchecked".

The 93 `curated` links in `corpus.json` are untouched: all are Ḥikam and Mawsūʿa
loci AK entered by hand, none are Fī Riyāḍ.

**Do not re-tag anything `curated` without AK saying he read it.**

## Is there more misfiled matter? Two answers

**Whole misfiled blocks: no more found.** A shingled scan (10-word runs,
normalised for OCR drift — the method that would have caught Lesson 35, which
exact matching missed) turns up only three lesson pairs, all innocent: L37/L52
share a ḥadīth of al-Zuhrī the compiler footnotes twice, L30/L50 the passage on
al-Raḥmān as the greatest name, L8/L24 the ḥadīth of God addressing the people
of Paradise. Oral commentary repeats itself; that is the Shaykh, not the import.

**Paratext inside bodies: 312 fragments, still there.** Different class — single
paragraphs, not blocks:

- 97 bare sūra running heads (`سورة النساء`). Some are genuine section headings;
  some are page furniture that breaks a sentence in two. Only reading tells
  which — the test is whether the paragraphs on either side join up.
- 53 bare page or ḥadīth numbers (`193\.`, `6713)`, `.7932`)
- 162 orphan fragments under 8 characters (`.`, `-`, `من بعض.`)

Worst: L15 (19), L55 (18), L56 (15), L27 (13), L54 (13). This is the next body
of text work and it needs the running heads read, not matched.

## Page furniture in the lesson bodies — 47 paragraphs removed 19 September

Every printed page carries the book's title and the sūra's name at its head. The
OCR took both for commentary, so they sat inside the Shaykh's sentences and cut
them in half:

    …والذي خوطب بخذ ذهب  ⟦سورة المالية⟧  لا نعطي شيئا من أموالنا بعد النبي…

`scripts/strip-page-furniture.py`. **Read, not matched.** Ninety-seven bare
sūra-name lines are in the corpus and most are real section headings that must
stay. They separate on whether the paragraph interrupts: a heading sits where a
sentence has ended and the next thing begins (`مكية`, `بسم الله`, a verse
count); a running head lands mid-clause. That test isolated 24, each of which
was then read. Twenty-two are furniture; **two are not and stay** — L1 ¶67
`سورة البقرة` followed by `مائتان وست وثمانون آية`, and L43 ¶113 `سورة الزمر`
followed by its Meccan note.

The scan's own spelling corroborates it. A heading the compiler set would not be
misspelt four ways: `المالية`, `المالمية`, `المان.`, `المالة` are one running
head — المائدة — read badly four times. Likewise `الأنوام`/`الأمر` for الأنعام,
`الإمراء` for الإسراء, `الكهز` for الكهف, `الشعرء` for الشعراء.

The 25 book-title lines need no list: a short line ending `رياض التفسير` is the
running title and nothing else. Its first word is mangled too — `بي`, `بى`,
`بن`, `بل`, `فى`, `ا` for في — so it is matched on the tail. All 25 were read in
context first; every one interrupts.

The script asserts the expected text at each listed index, so a shifted body
aborts rather than deleting the wrong paragraph.

### Still open in this class

53 bare page or ḥadīth numbers sitting in the prose (`193\.`, `6713)`, `.7932`)
and 162 fragments under eight characters (`.`, `-`, `من بعض.`). A separate
class, needing their own reading — a digit in this text may be a page number, a
ḥadīth number, or a footnote marker, and only the third should go.

## Four blocks the scanner read twice — removed 19 September

`scripts/remove-duplicated-blocks.py`. Each is a run of consecutive paragraphs
appearing once and then again a few paragraphs later. Lesson 8's second copy is
introduced by a page running head — `سورة ال عمران`, whose internal space is why
`strip-page-furniture.py` missed it — which says plainly what happened: the same
printed page went through twice.

| | kept | dropped | copies agree |
|---|---|---|---|
| L8 | ¶48–52 | ¶53–58 (with the running head) | 1.00 |
| L13 | ¶112–122 | ¶123–133 | 0.98 mean, 0.77 worst |
| L22 | ¶1–3 | ¶4–6 | 0.99 |
| L30 | ¶19–21 | ¶22–24 | 0.98 |

**Which copy goes was read, not assumed.** It happens to be the second every
time, but that was decided where the copies disagree:

- L13 ¶117 runs 460 characters against ¶128's 441 — the first is fuller.
- L22's difference sits inside the lemma of Q 2:189: the first reads
  `وَالْحَجُّ`, the second `وَالْحَتِحُ`. One has the word, the other noise.
- L30 ¶23 carries one extra word at its head, but its lemma is wrecked —
  `(إنَهُ لَيْسَ لَهْد سُلْطَرَ)` against ¶20's correct
  `(إِنَّهُۥ لَيْسَ لَهُۥ سُلْطَٰنٌ)`, Q 16:99. In an edition whose apparatus
  keys off the bracketed citations, the intact lemma wins.

So three of the 23 dropped paragraphs are not byte-identical to anything left —
they are the losing variants above, and that is the point. The guard requires
the block to agree 0.95 on average and no paragraph below 0.65, so a shifted
body aborts while a paragraph the scanner read badly twice still passes.

No paragraph over 200 characters now repeats inside any lesson.

## Citation sanity check — run it last

`scripts/check-citation-neighbours.js`. Reports two things on every run: a
citation whose neighbouring āya fits the span clearly better (off by one), and a
citation resting on fewer than three content words. It **reports and changes
nothing** — a straddling span really does cover two āyāt, and which one it
should name is an editorial call.

Run order for anything that touches a lesson body:

    match-verses.js → build-verse-citations.js → build-citation-status.js
    → add-editorial-verse-index.js --write
    → build-search-index.js → prune-stale-para-indices.js --write
    → check-citation-neighbours.js

`build-citation-status.js` keys off the SAME (lessonId, paraIndex, spanIndex)
triple as build-verse-citations.js, and writes what the edition may say about
the TEXT of each citation — collated, diverges, unplaced — as against the verse
number, which says which āya it is. It runs in `prebuild` too, so the figures
on /translators-note and the mark beside each citation cannot drift apart.

As of 19 September: 4,563 checked, 2 flagged, 9 thin spans — all nine
distinctive phrases rather than errors. The five hand-found cases of 16
September were measured against a corpus that still held Lesson 56 inside Lesson
55, the volume back matter and four double-scanned pages; most of what looked
like matcher error was the body being wrong underneath it. See
`translation-drafts/verse-citations-to-check.md`.

## term_concordance.json was stale — re-anchored 19 September

`scripts/reanchor-term-concordance.js`. Its 873 loci point at paragraphs by
index, and this week's body work moved most of those indices; 67 pointed past
the end of their lesson. No generator for the file exists in the repo, so it is
edited in place.

Nothing was deleted. Every occurrence carries the `context` it was recorded
against, so each was FOUND again: 707 by exact context, 36 more by the longest
run of distinctive words that still occurs exactly once. **Across the whole file
not one context matched two paragraphs** — every hit was unique, which is what
makes this safe. 743 re-anchored, 0 now out of range.

The 130 that could not be found are flagged `anchorLost: true` and clamped into
range, rather than left pointing at whatever paragraph now sits at the old
index. All 130 fall in Lessons 1–30 — text that has had OCR repairs since the
file was built in August, so the wording it recorded no longer exists.

**Reader-visible impact: none.** `src/app/glossary/page.tsx` links by a text
query (`?q=<context>`), not by `paraIndex`, so nothing was broken on the page.
The dataset is published, though, and should be right.

One thing measured and worth not re-deriving: only 273 of the 873 contexts
contain their term's headword form — the file records `matchedForm` separately
because it indexes morphological variants. So a locus whose paragraph does not
literally contain `الفيضة` is normal, not a mis-anchoring.

## Presentation pass — 20 September

A reader was sent round the live site. Four things it found, three fixed here.

**Fifty-one of the fifty-six lessons looked broken.** `/lesson/1` sets its
bilingual text in two ~600px columns and reads well; the moment English is
absent the page fell through to the Arabic-only view, which had no width
constraint and centred its prose — justified lines of two hundred characters
across a 1400px viewport. That view is the site's main reading surface, since
only five lessons carry English. It now takes `max-w-[46rem]`, the measure the
bilingual column reaches on desktop, and `text-justify` to match how the Arabic
is set there. Centring belongs to the container, not the prose.

**The tafsīr tab promised a translation on every lesson.** `hint:
'Shaykh Ibrāhīm, with translation'` was false on 51 of 56 pages, and it was the
first thing a reader saw. Now conditional on `hasTranslation`.

**The glossary exposed "Show pending"** — a checkbox revealing unconfirmed edges
in the term graph. What counts as verified is the editor's call, not a reader's
toggle. Replaced with a statement of how many are held back.

**A verse page headed "across the corpus" that shows only Fī Riyāḍ** reads as a
claim that the other works were searched and had nothing. They were not
searched: 156 āyāt of 6,236 (2.5%) carry a link from the Ḥikam, the fatwās,
Kāshif, the Qanābīl or the Tafsīr Maʿānī cassettes. The closing note now says
so, counting from the data rather than a typed figure.

Note for whoever reads the audit: it reported that "every entry on every verse
page comes from one work — Fī Riyāḍ itself." That is wrong, and checking it
before acting mattered. The 152 hand-curated links come from six OTHER works;
Fī Riyāḍ's entries are the derived ones. The reader had looked at Q 2:255 and
Q 78:1, neither of which is in the 2.5%.

### Not fixed — cannot reproduce from here

`/saved` was reported rendering dark-green with near-invisible footer text while
the rest of the site is cream. The theme is a global `data-theme` on `<html>`
from localStorage, defaulting to light, so a single page cannot diverge — unless
the client component paints before the theme script, or the `/clips` redirect
flashes the unthemed default. Needs reproducing in a browser with the theme set
to light.
