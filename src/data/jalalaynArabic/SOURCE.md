# Source

Arabic text of *Tafsīr al-Jalālayn* (al-Maḥallī & al-Suyūṭī), transcribed
verbatim from the digital edition at al-Maktaba al-Shāmila:
https://shamela.ws/book/12876 (Dār al-Ḥadīth, Cairo).

Qur'ānic citations within the commentary are marked with `{...}` in the
source and preserved as-is. Format matches the existing English files in
`src/data/jalalayn/` — `[surah:verse]` markers, one file per sūrah, parsed
by `parseJalalayn()` in `src/components/JalalaynVerseView.tsx`.

**01.txt (al-Fātiḥa)** — complete, 7 verses. Verse 1 (the basmala) has no
independent gloss in this edition; Jalālayn's discussion of verse-count
conventions for the basmala appears as a headnote before the tafsīr proper
begins and isn't semantic commentary on the phrase itself, so it isn't
included here as a "gloss." Retrieved and cross-referenced against the
per-verse page index in Shamela's own table of contents (each verse's
starting page, confirmed against the sidebar navigation) 2026-08-16.

**Not yet done:** sūrahs 2–56 (matching lesson coverage). Text is available
at the same source; this was intentionally scoped to sūrah 1 as a working
proof of concept before scaling up. See project notes
(`jalalayn-ruhalbayan-sidebar-research.md`) for the plan.

**Rūḥ al-Bayān**: not yet sourced. `src/app/lesson/[id]/page.tsx` already
links out to https://usul.ai/t/ruh-bayan for this text (see the "Rūḥ
al-Bayān" panel) — worth checking whether Usul.ai's copy is more complete
than the partial one found on Shamela before committing to a source.
