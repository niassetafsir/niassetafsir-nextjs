# Five citations to check by eye

Surfaced 16 September, when the brace→paren conversion made 925 previously
skipped spans visible to `scripts/match-verses.js`. Every one of the 723 new
citations and 138 reassigned ones was checked against `verse_text.json`. These
five did not hold up. All sit in the auto tier, which CLAUDE.md already marks
`uncertain: true`; none is a regression, but each is wrong and findable.

| lesson | para | span | assigned | the span reads | should be |
|---|---|---|---|---|---|
| 30 | 182 | 3 | 17:82 | `إِنَّ ألْبطلَ كَانَ زَهُوفا` + commentary | 17:81 |
| 28 | 54 | 11 | 14:9 | `حَمِيدٌ` — one word | 14:8, if anything |
| 28 | 54 | 21 | 29:6 | `فَاطِرِ السَّمَٰوَٰتِ وَالأَرْضِ` | 14:10 / 35:1 / 39:46 — not 29:6 |
| 16 | 78 | 1 | 6:79 | `وقَالَ هَذَا رَتْيّ` + commentary | 6:78 |
| 48 | 93 | 2 | 53:59 | `بَاسْجُدُوا لِهِ` | 53:62 |

Two patterns, both worth a guard in the matcher rather than five hand fixes:

- **Off by one or a few āyāt.** The span is a real quotation and the matcher
  landed on a neighbour. Four of the five.
- **A span too thin to cite.** `حَمِيدٌ` is one word; it will match dozens of
  āyāt and means nothing as a citation. A minimum of two content words would
  drop it.

The 112 the checker could not resolve were its own limits, not defects: 35 are
range keys (`2:38-2:39`) it does not parse, and 77 are guillemet spans, which
`extractSpans` indexes in the same sequence as parens — the checker counted
only parens.


---

## Re-measured 19 September, after the body cleanups

The five above were found by hand on a corpus that still contained Lesson 56
inside Lesson 55, the volume back matter, 47 running heads and four
double-scanned pages. Removing those shifted most paragraph indices, so the list
was re-derived from scratch with `scripts/check-citation-neighbours.js` rather
than carried forward.

**4,563 citations checked. Two flagged, not five.**

| | assigned | fits better | |
|---|---|---|---|
| L45 ¶85 s11 | 43:14 | **43:13** | `سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا…` is Q 43:13 entire; 43:14 is `وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ`. Genuinely off by one. |
| L46 ¶170 s2 | 48:1 | 48:2 | Not an error. The span opens `إِنَّا فَتَحْنَا لَكَ فَتْحًا مُبِينًا` — Q 48:1 — and runs on into 48:2, so the neighbour scores higher on coverage while 48:1 is where the citation begins. A straddle, correctly named for its first āya. |

The thin-span weakness has gone: nine citations rest on fewer than three content
words, and each is a distinctive phrase (`فِي رَحْلِ أَخِيهِ`, Q 12:70), not the
one-word `حَمِيدٌ` that prompted the original note.

So the class did not need a matcher change — `MIN_SPAN_WORDS = 3` in
`match-verses.js` and the five-word run in `add-editorial-verse-index.js` were
already doing their work, and most of what looked like matcher error was the
body being wrong underneath it. What it needed was a standing check, which now
runs last in the pipeline and reports rather than corrects: which āya a
straddling span should name is an editorial call, not a scoring one.
