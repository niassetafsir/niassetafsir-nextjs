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
