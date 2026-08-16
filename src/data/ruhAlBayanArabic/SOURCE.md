# Source

Arabic text of Ismāʿīl Ḥaqqī al-Burūsawī's *Rūḥ al-bayān fī tafsīr al-Qurʾān*,
retrieved from Usul.ai's digital edition: https://usul.ai/t/ruh-bayan
(publisher per Usul's own metadata: Dār al-Fikr, Beirut). This is the same
edition as the partial copy found on al-Maktaba al-Shāmila
(shamela.ws/book/23612), but Usul's copy goes further.

**Note on edition:** Wright (2024, *Islamic Africa* 15: 69–97) cites the
Dār al-Kutub al-ʿIlmiyya (Beirut, 2003) edition as the scholarly reference
for this work. This is a *different* print edition (Dār al-Fikr). The
underlying tafsīr text should be substantively identical across reprints,
but pagination and possibly minor editorial choices (e.g. inclusion of
Persian poetry, which some editions omit per the Wright/Bursevi background
article) may differ. Treat citations to a specific print page as referring
to *this* Dār al-Fikr edition, not the 2003 Dār al-Kutub al-ʿIlmiyya one,
until cross-checked.

## 01.txt (al-Fātiḥa)

Retrieved 2026-08-16 via Usul.ai's reader (`/t/ruh-bayan/{page}`), pages
7–26 of volume 1. Format matches `src/data/jalalaynArabic/`: `[surah:verse]`
markers, parsed by the same `parseJalalayn()` in
`src/components/JalalaynVerseView.tsx`.

**Known gap:** page 6 (which Usul's own table of contents lists as the
start of the sūrah, covering the sūrah heading and the opening of the
basmala commentary) returned a 404 from Usul's server on every attempt —
confirmed not transient by retrying. **Verse 1's text here is missing its
opening** as a result; it picks up mid-discussion on page 7. This is a
genuine gap in the source, not a scraping bug — flagged here so it isn't
mistaken for complete.

**Verse boundaries were determined editorially, not by the source's own
pagination** (unlike the Jalālayn file, where Shamela's sidebar gives an
authoritative per-verse page index). Rūḥ al-bayān's commentary style is
discursive rather than lemma-by-lemma, and a single verse's discussion
often runs several print pages, mixing in Sufi poetry, hadith, and
anecdotes at length before the next Qurʾānic phrase is taken up. Verse
breaks in this file were placed at the point where each verse's phrase is
introduced as a new heading in the source (e.g. "مَالِكِ يَوْمِ الدِّينِ
اليوم في العرف عبارة..."). One judgment call: the discussion of *why the
sūrah is named al-Fātiḥa* (its alternate names, etc.) falls between the
basmala discussion and the dedicated "الحمد لله" heading — this is
sūrah-level front matter, not really verse-1-specific, but has been kept
attached to the end of verse 1's block since there's no separate slot for
sūrah-level material in the current file format. Worth revisiting if a
cleaner structure is wanted later.

**Not yet done:** sūrahs 2–56. Usul.ai's reader exposes a full table of
contents (embedded as JSON in the page's React payload — search page HTML
for the sūrah name to find `{"title":..., "page":{"vol":..,"page":N}}`
entries) with per-verse page numbers for most sūrahs (unlike al-Fātiḥa,
which is listed as one combined range `الآيات ١ إلى ٧`) — that per-verse
breakdown should make future sūrahs *faster* to segment than this one was.
