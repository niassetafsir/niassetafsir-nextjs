# Source

English translation of *Tafsīr al-Jalālayn* made **for this project, from the
Arabic**, not adopted from any existing English edition.

## Why it exists

`lesson.jalalaynText` in `src/data/lessons/*.json` holds a different English
Jalālayn, and on 2026-08-19 it was verified against altafsir.com to be Feras
Hamza's translation, © 2007 Royal Aal al-Bayt Institute for Islamic Thought.
Q 1:2 and Q 2:2 match the Institute's own PDF word for word. Publishing that on
this site would republish someone else's copyrighted work. These files replace
it. `src/app/lesson/[id]/page.tsx` reads this directory and never
`lesson.jalalaynText`.

## Base text

Translated from `src/data/jalalaynArabic/NN.txt` — al-Maḥallī (d. 864/1459) and
al-Suyūṭī (d. 911/1505), transcribed from al-Maktaba al-Shāmila
(https://shamela.ws/book/12876, Dār al-Ḥadīth, Cairo). The Arabic is centuries
out of copyright; a fresh translation of it is an original work belonging to
this project.

## Conventions

Follows `claude/english-translation-strategy.md`: IJMES transliteration, Brill
register, no condensation, and a visible line between the base text and anything
editorial.

- `{...}` encloses the Qurʾānic lemma being glossed, mirroring the braces the
  Arabic source itself uses. The reader can always see which words are scripture
  and which are commentary.
- `[...]` encloses editorial supplement — words with no counterpart in the
  Arabic, added because English needs them.
- `*italics*` mark transliterated Arabic (*ʿālam*, *tawḥīd*, *ghāfir al-dhanb*).
- Qurʾānic citations the commentary makes in passing carry a bracketed reference
  (`[Q. 40:16]`); the Arabic source does not supply these.

## Independence check — rerun it after any edit

The commentary tradition is fixed and the Arabic is terse, so any two faithful
English versions will converge on short stretches. What matters is that no
extended run is shared. Measured against the Hamza text still sitting in
`lesson.jalalaynText`:

| run length | shared |
|---|---|
| 10 words | 0 |
| 8 words | 1 |
| 7 words | 2 |

The single 8-word run is "master of the day of judgement that is" — a standard
rendering of *mālik yawm al-dīn* followed by "that is", which is how anyone
translates *ay*. Unavoidable, and too short and too functional to be anyone's
property.

Rerun with `node scripts/jalalayn-en-independence.mjs`. **If a run of 10 or more
words ever appears, rewrite that passage before shipping it.**

## Coverage

**01.txt (al-Fātiḥa)** — complete, 7 verses.

**Not yet done:** every other sūra. Lesson 1 also covers Q 2:1–5, for which the
Arabic itself has not been transcribed either (see
`src/data/jalalaynArabic/SOURCE.md`). Until a sūra has a file here, the
comparison view says so plainly rather than falling back to anything.

## Status

**Draft. Not reviewed by AK.** Produced 2026-08-19. It is a translation of a
technical grammatical commentary — *jumla khabariyya*, *badal*, *ṣifa
li-maʿrifa* — and choices in that register deserve a specialist's eye before
they stand as the project's own edition.
