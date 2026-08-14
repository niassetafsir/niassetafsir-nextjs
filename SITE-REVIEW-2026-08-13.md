# niassetafsir.org — Site Review

*Prepared 13 August 2026*

## Overall picture

The codebase is more ambitious than the content behind it. The Next.js app already has routes and components for a concordance, a hadith index, a glossary graph, a scholar network, thematic browsing, annotations, clips, bookmarks, and a Jalālayn comparison view — most of the reading-experience architecture a serious digital tafsīr edition needs is already built. What's thin is the corpus itself: only 8 of 56 lessons carry an English translation, several lessons still contain leaked OCR artifacts (bracketed citation numbers sitting in the Arabic prose, duplicated paragraphs from double-scanned pages), and the Arabic-English pairing that the bilingual view depends on doesn't actually work correctly for most lessons yet. The site is closer to "well-engineered shell around a half-digitized primary source" than "finished edition." That's not a criticism — digitizing 56 lessons of handwritten-tradition tafsīr commentary is real philological labor that can't be shortcut — but it means the highest-leverage work from here is data work, not feature work.

## Data completeness — the real bottleneck

English coverage: lessons 1, 2, 10, 11, 18, 20, 27, 29 have translations. That's 14% of the corpus. Everything else renders Arabic-only, which means the bilingual reading view, the Jalālayn comparison feature, and the EN/FR/AR language switcher (itself unwired — see below) are all built around a spine of content that mostly isn't there yet.

The dataset also has a schema fracture: lessons 3–35 encode "no English yet" as `hasEnglish: false` / `englishText: null`, while lessons 36–56 use `englishText: ""` and drop the `hasEnglish` key entirely. Any code checking `lesson.hasEnglish` will silently behave differently across those two ranges. Worth normalizing to one convention.

Two more issues surfaced during this session's work and are worth flagging explicitly since they touch primary-source accuracy:

- **Leaked citation numbers.** Bracketed digits like `[1]` still appear inline in the Arabic body prose in multiple lessons (confirmed in Lesson 51: `فالأمي سب في حق كل إنسان إلا[1]`), rather than being rendered as proper footnote markers. This reads as though it's part of the text itself. Fixing this in the underlying JSON turned out to be far more tool-intensive than expected — a single duplicate-paragraph fix in Lesson 51 alone took dozens of small edits because retyping vocalized Arabic (with its stacked diacritics) through this editing pipeline is unreliable. The other 11 lessons flagged for similar issues (07, 13, 20, 22, 23, 29, 34, 37, 41, 43, 47) are still pending — see the open task list.
- **`arabicText` vs `arabicBody` divergence.** For at least Lessons 1–2, these are two different versions of the same lesson with different paragraph counts (`arabicBody` is a trimmed cut missing the title, durūd invocation, and an Ibn ʿAbbās transmission aside). The site renders `arabicBody` when present. A previously-drafted Arabic↔English alignment map (`src/lib/bilingualAlignment.ts`) was built against the wrong field and is currently disabled rather than shipped wrong — it's sitting in the code as a documented, inactive draft.

Net effect: the bilingual view currently pairs Arabic and English paragraphs by raw array index, which is close to meaningless once the two texts diverge in length or ordering (which they do, per the lesson-1 audit done earlier this year).

## Navigation and UX

Two independent navigation systems exist side by side — `SiteNav` (a top dropdown) and `PersistentNav` (a fixed bottom tab bar that hides on `/lesson/*`) — each with its own route-matching logic. They're not obviously redundant (different contexts) but they are two things to keep in sync when routes change.

The homepage volume grid had a real bug, now fixed this session: because the whole document is `dir="rtl"` (`<html lang="ar" dir="rtl">` in the root layout), the grid was laying volumes out right-to-left without an explicit override, so "Volume 1" sat in the top-right rather than top-left. Fixed by adding `dir="ltr"` to the grid container. Volume numbering also used to display Roman numerals (`volume.roman`) instead of the plain number AK asked for; also fixed.

Sidebar font sizing (`MobileLessonDrawer`, `LessonPageNavigator`) is now unified at 8px for volume and lesson numbers in both components — previously 10px in one and 9px in the other, inconsistent with each other even though each was internally consistent.

## Search

`src/app/search/page.tsx` is entirely client-side: it fetches a pre-built `search-main.json` (2,176 indexed passages) on page load, strips Arabic diacritics, and does exact-substring matching first, falling back to a tight-threshold Fuse.js fuzzy search. Filterable by Arabic/English/Jalālayn. This is a reasonable design for a corpus this size — no backend needed — but there's no verse-number-aware lookup (searching "Q.2:255" only works if that literal string happens to appear in an indexed passage, not as a structured Qurʾān-reference query). If AK wants "search by sūra or verse" as a first-class feature (as mentioned for the future homepage redesign), that needs a structured verse index, not just full-text search.

## Audio

Fragmented. Three separate components maintain their own hardcoded audio-URL maps — `app/audio/page.tsx`, `LessonAudioBar.tsx`, and an apparently unused third component `AudioPanel.tsx` — all pointing at the same UploadThing-hosted files, all capped at roughly sūras/lessons 1–18/1–30, with everything past that marked "recordings forthcoming." The `Lesson.arabicAudioUrl` field exists in the schema and is populated in none of the 57 lesson JSONs; the real audio URLs live only in these hardcoded component-level maps. Worth consolidating into the one shared `public/data/audio_index.json` that already exists but currently isn't imported anywhere.

## SEO

The root layout has solid metadata (OpenGraph, Twitter card, keywords, `robots: {index:true, follow:true}`), and 23 routes export their own per-page metadata. But there's no `sitemap.ts`/`sitemap.xml` and no `robots.ts`/`robots.txt` anywhere in the app or `public/` folder. For a content site this size that wants to be found via search, that's a real gap — a generated sitemap is cheap to add and meaningfully helps discovery of the deeper lesson/volume pages.

## Redundant / inactive code

- `AudioPanel.tsx` is never imported — dead component, superseded by `LessonAudioBar`.
- `src/data/search-index.json`, `search-jalalayn.json`, and `jalalayn_verse_map_01.json` aren't referenced anywhere in `src/`; the live search page reads `public/data/search-main.json` instead. These look like superseded snapshots from an earlier iteration of the search feature.
- The `LangSwitcher` component (EN/FR/AR toggle) is present in the UI but not wired to anything — `TODO.json` confirms this is the one open item on record. Right now it's a control that does nothing when clicked, which is worse for a user than not having it.
- `ComingSoonApparatus` is a placeholder screen for the not-yet-built research tools, referencing a forthcoming *Islamic Africa* article — fine as a holding pattern, just flagging it's not a bug.
- A `niassetafsir/` folder sits inside the repo root and shows up as untracked in `git status`. I checked it directly: it's empty, not (as initially reported to me) a second full copy of the project. Safe to delete or add to `.gitignore` to stop it showing up in status checks.
- `font-english` in the Tailwind config is set to `["IBM Plex Sans Arabic", "system-ui", "sans-serif"]` — the same primary typeface as `font-arabic`. English text on the site is being rendered in an Arabic-optimized font family rather than a Latin-tuned one. This may be an intentional visual-consistency choice, but it's worth a deliberate look — Latin text often reads worse in fonts optimized for Arabic letterforms.

## Priorities, in rough order

1. **Corpus accuracy over corpus features.** The leaked-citation cleanup (11 lessons remaining) and the `arabicBody`/`arabicText` field reconciliation are the highest-value work, because every downstream feature (bilingual view, search, Jalālayn comparison) inherits whatever's wrong with the source text.
2. **English translation coverage** is the real constraint on the bilingual reading experience being useful at all. Everything built around it — Jalālayn hover-compare, bilingual pairing — is waiting on this.
3. **Sitemap + robots.txt** — a few hours of work, meaningful SEO upside, currently entirely absent.
4. **Audio consolidation** — collapse three hardcoded maps into the one shared index file that already exists.
5. **Cheap cleanup** — delete the empty `niassetafsir/` folder, remove `AudioPanel.tsx` and the orphaned search JSON snapshots, either wire up `LangSwitcher` or remove it.

None of this is urgent in the sense of broken-for-users; the site works. It's a prioritization question about where the next block of effort is best spent, and the honest answer is: on the text, not the UI.
