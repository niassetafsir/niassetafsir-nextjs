#!/usr/bin/env python3
"""
Repairs Ayat al-Kursi and its neighbours in Lesson 7, by hand.

WHY BY HAND. /verse/2/255 is the most looked-up verse in the mushaf, and the
site was rendering `la ilaha illa HAZ` for `la ilaha illa HUWA`. The passage
sits inside double quotes, and every earlier repair pass deliberately worked
only on ( ) and < >, on AK's rule that inside those a divergence from the aya
is an error by definition. Double quotes hold hadith too, so that rule does not
reach them.

Extending the general repair to " " was tried and abandoned. It proposed 323
changes to primary text across the corpus and did not fix this passage, because
quotes have no distinct open and close: `"A" B "C"` pairs correctly, `"A B "C"
D"` does not, and this passage is the second shape. A pass that rewrites 323
spans without fixing the one it was built for is not worth its risk.

WHY BY OFFSET AND CODEPOINT. The scan's Arabic carries combining marks in an
order no keyboard reproduces, and text typed into this repo does not survive
transport byte-identical. So nothing here is matched by a typed string. Each
correction names a position, the exact codepoint sequence expected there, and
the single letter to swap. If the file moves under it, the assert fires.

Each correction is settled by the Qur'an or by the compiler's own gloss beside
it:

  HAZ     -> HUWA      Q 2:255. The very next clause is his own gloss,
                       `hadha ismuhu huwa`. ha-zay against ha-waw is a
                       different skeleton, not a vowel.
  al-FAYYUM x4
          -> al-QAYYUM Q 2:255. The fa/qaf confusion this scan makes
                       constantly - and three of the four are immediately
                       glossed from q-w-m (`al-mubaligh fi al-qiyam bi-tadbir
                       khalqihi`, `alladhi yaqumu bi-tadbir khalqihi da'iman`).
                       At 40387 the same verse is quoted correctly with QAYYUM
                       seventy-seven characters earlier.
  MASHRATAHUM
          -> MASHRABAHUM  Q 2:60, `qad 'alima kullu unasin mashrabahum`. ra/ba.

NOT touched, though visible in the same passage: `al-HAYYU` written with alif
maqsura, `wa-HAWA` for `wa-huwa`, `alladhi` clipped to `alladhi-` . All three
are orthographic variants this scan produces throughout, and none reads as a
different word. Fixing them here and nowhere else would make one passage
inconsistent with the rest of the corpus for no gain to a reader.

  python3 scripts/repair-ayat-al-kursi.py          # dry run
  python3 scripts/repair-ayat-al-kursi.py --write
"""
import json, sys
from pathlib import Path

P = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'lessons' / '07.json'

FA, QAF = 'ف', 'ق'
TA, BA = 'ت', 'ب'

# offset, expected codepoints at that offset, index of the letter to swap, new letter
FIXES = [
    # HAZ -> HUWA: ha fatha zay sukun  ->  ha damma waw fatha (whole word)
    (10847, 'هَزْ', None, 'هُوَ'),
    # MASHRATAHUM -> MASHRABAHUM (unpointed): mim shin ra TA ha mim
    (10754, 'مشرتهم', 3, BA),
    # al-FAYYUM -> al-QAYYUM, four sites, alif/hamza lam sukun FA ...
    ( 9812, 'الْفَيُّومُ', 3, QAF),
    (10883, 'ألْفَيُّوم',       3, QAF),
    (11616, 'ألْفَيُّومٌ', 3, QAF),
    (40387, 'ألْفَيُّومُ', 3, QAF),
]


def main(write=False):
    L = json.loads(P.read_text(encoding='utf-8'))
    body = L['arabicBody']
    done = skipped = 0
    for off, old, idx, repl in sorted(FIXES, reverse=True):
        new = repl if idx is None else old[:idx] + repl + old[idx + 1:]
        assert len(new) == len(old)
        here = body[off:off + len(old)]
        # idempotent: a site already carrying the repair is left alone.  Without
        # this the script asserted its way to a crash on every run after the
        # first, because it looked for the damaged form it had itself replaced.
        if here == new:
            skipped += 1
            continue
        assert here == old, (
            f'{off}: found {[hex(ord(c)) for c in here]}, '
            f'expected {[hex(ord(c)) for c in old]} - Lesson 7 has changed'
        )
        body = body[:off] + new + body[off + len(old):]
        done += 1
        print(f'  {off:>6}  {old}  ->  {new}')
    print(f'\n{done} corrections in Lesson 7, {skipped} already in place')
    if write and done:
        L['arabicBody'] = body
        P.write_text(json.dumps(L, ensure_ascii=False), encoding='utf-8')
        print('WRITTEN')


if __name__ == '__main__':
    main('--write' in sys.argv)
