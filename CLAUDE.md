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
then re-run `scripts/match-verses.js` and `scripts/build-verse-citations.js`
to regenerate the JSON, or verse numbers will silently attach to the wrong
citation.

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

## Long-term vision (not scoped, not started)

AK's *Majmaʿ al-Tafsīr* concept — a longer-term shape for this project
beyond the current single-edition reader — has been discussed but is
explicitly not a current build target. Don't start on it without AK
re-raising it as an actual request.
