#!/usr/bin/env python3
"""
Six letter confusions settled by a parallel copy of the same sentence.

THE WARRANT IS DIFFERENT from the other three passes, which is why this is its
own file. scripts/repair-quranic-letter-confusions.py and
scripts/complete-quranic-letter-confusions.py settle a reading against the Warsh
text; scripts/repair-footnote-letter-confusions.py settles it against the
repaired body, or against the Warsh text where there is no body twin. These six
are settled by neither. The compiler repeats himself -- the same hadith, the
same anecdote, the same isnad -- and the scan did not fail the same way twice,
so a passage that is broken in one place stands correct in another. That copy is
the witness, and it is named per site below.

Five of the six are hadith or anecdote, not Qur'an, so no aya reaches them. The
sixth, Q 2:260, would have been reachable, but it sits in a hadith quoting the
aya rather than in a bracketed citation, which is where the earlier passes look.

WHERE THEY ARE. Four of these were reported to me as defects in `arabicBody`.
They are not: `arabicBody` does not contain them anywhere in the corpus. They
are in `arabicFootnotes`, which is a separate field and was only repaired this
week. A fifth was reported in Lesson 52; Lesson 52 has no `arabicFootnotes` at
all -- lessons 31-56 are empty -- and the sentence is in Lesson 27. Only the
Lesson 18 site is in `arabicBody`, and it is there twice over, once in each
field. Check the field and the lesson before trusting a report of either.

DO NOT TREAT footnotesData.json AS AUTHORITATIVE. It looks authoritative from
outside and it is the witness for four of these six, but for the Lesson 18
sentence it is broken in two of its six copies: fn-24-b008, fn-46-b023,
fn-48-b015 and fn-51-b032 read `yasta`tib`, while fn-18-1-9 and fn-54-b017 read
the scan's `basta`tib` -- including the record keyed to Lesson 18 itself, the
very lesson being corrected. A witness that is wrong in a third of its copies is
not a witness. The Lesson 18 reading here is taken from lesson 24
`arabicFootnotes` @2584, which carries the identical Bukhari sentence intact
inside the lesson data. An earlier note in this project claimed
footnotesData.json had the correct form in six places; it does not.

THE SITES, each one letter, each inside the confusion classes the other passes
work in (ya/ba, ba/ya, ta/tha):

  L5  footnote  `marra YA-BAQI` al-Gharqad`     -> BI-BAQI`   (Umar at the Baqi`)
  L6  footnote  `la YAQRIN al-salata sakran`    -> YAQRABANNA (the crier's call)
  L7  footnote  `kayfa TAHBI l-mawta`           -> TUHYI      (Q 2:260 in hadith)
  L27 footnote  `qurashiyyan WA-TAQAFI`         -> WA-THAQAFI (glossed three
                words on by the compiler's own `aw thaqafiyyan wa-qurashi`)
  L18 body and footnote  `fa-la`allahu an BASTA`TIB` -> YASTA`TIB

`TAHBI` IS A REAL WORD ELSEWHERE and must not be repaired by form. Lesson 12
has `la yanbaghi laki illa an TUHIBBI ma uhibb` -- `that you love what I love`,
correct as it stands -- in `arabicBody` @36760, in `arabicFootnotes` @46458 and
in footnotesData.json fn-12-1-18. Nothing here matches on a form; every site is
an offset, and the assert fires if the word at that offset is not the one
expected.

ANCHORING is as in the other three: an offset into the named field, the exact
codepoints expected there, one letter for one letter so lengths and offsets
hold, and a site already carrying the repaired word is skipped.

  python3 scripts/repair-witnessed-letter-confusions.py          # dry run
  python3 scripts/repair-witnessed-letter-confusions.py --write
"""
import json, sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'lessons'

# lesson, field, offset, expected word as codepoints, index of the letter to
# swap, its replacement, before -> after, what the sentence is, the witness
SITES = [
    (  5, 'arabicFootnotes',   9878, '064a06280642064a0639', 0, '0628',
     'ybqy` -> bbqy`',
     'marra bi-Baqi` al-Gharqad',
     'footnotesData.json fn-5-10, same sentence, reads bi-Baqi`'),
    (  6, 'arabicFootnotes',  26461, '064a06420631064a0646', 3, '0628',
     'yqryn -> yqrbn',
     'la YAQRABANNA al-salata sakran',
     'footnotesData.json fn-6-23, same sentence, reads yaqrabanna'),
    (  7, 'arabicFootnotes',  27052, '062a062d0628064a', 2, '064a',
     'tHby -> tHyy',
     'Q 2:260 kayfa TUHYI l-mawta, inside `nahnu ahaqqu bi-l-shakk min Ibrahim`',
     'footnotesData.json fn-7-25 reads tuhyi; Q 2:260 settles it independently'),
    ( 27, 'arabicFootnotes',  39527, '0648062a06420641064a', 1, '062b',
     'wtqfy -> wthqfy',
     'qurashiyyan wa-THAQAFI, glossed three words on by `aw thaqafiyyan wa-qurashi`',
     'footnotesData.json fn-52-b021, same sentence, reads wa-thaqafi'),
    ( 18, 'arabicBody',  27327, '06280633062a0639062a0628', 0, '064a',
     'bst`tb -> yst`tb',
     'Bukhari, fa-la`allahu an YASTA`TIB',
     'lesson 24 arabicFootnotes @2584 carries the same sentence with yasta`tib'),
    ( 18, 'arabicFootnotes',  26600, '06280633062a0639062a0628', 0, '064a',
     'bst`tb -> yst`tb',
     'Bukhari, fa-la`allahu an YASTA`TIB',
     'lesson 24 arabicFootnotes @2584 carries the same sentence with yasta`tib'),
]


def hx(s):
    return ''.join(chr(int(s[i:i + 4], 16)) for i in range(0, len(s), 4))


def main(write=False):
    done = skipped = 0
    classes = Counter()
    by_lesson = {}
    for row in SITES:
        by_lesson.setdefault(row[0], []).append(row)
    for lesson in sorted(by_lesson):
        p = ROOT / f'{lesson:02d}.json'
        L = json.loads(p.read_text(encoding='utf-8'))
        touched = 0
        print(f'  lesson {lesson:02d}')
        # descending offset per field, so earlier swaps cannot move later ones
        for les, field, off, word, idx, cp, note, what, witness in sorted(
                by_lesson[lesson], key=lambda r: (r[1], -r[2])):
            text = L.get(field) or ''
            old = hx(word)
            new = old[:idx] + chr(int(cp, 16)) + old[idx + 1:]
            here = text[off:off + len(old)]
            if here == new:
                skipped += 1
                continue
            assert here == old, (
                f'lesson {lesson:02d} {field} @{off}: found '
                f'{[hex(ord(c)) for c in here]}, expected '
                f'{[hex(ord(c)) for c in old]} - the file has moved under this table')
            assert len(new) == len(old)
            L[field] = text[:off] + new + text[off + len(old):]
            classes[f'{ord(old[idx]):04x}>{cp}'] += 1
            print(f'    {field:16s} @{off:<6} {note:<16} {what}')
            print(f'    {"":16s} {"":7} witness: {witness}')
            touched += 1
            done += 1
        if write and touched:
            p.write_text(json.dumps(L, ensure_ascii=False), encoding='utf-8')
    print(f'\n{done} words repaired'
          + (f', {skipped} already repaired' if skipped else ''))
    for k, v in classes.most_common():
        print(f'  {k}  {v}')
    if write:
        print('WRITTEN')


if __name__ == '__main__':
    main('--write' in sys.argv)
