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


Sites are named by content, not by offset: see scripts/repair_anchors.py for
the scheme and for why. The `hint` in each row is the offset the row used to
carry, kept only to order the search and to appear in reports.


HOW A SITE IS IDENTIFIED (changed 21 September 2026)

This script no longer addresses its sites by a raw character offset.  Each row
carries the target word before and after the repair, plus the raw skeletons of
the words on either side as they stood when the row was minted; the old offset
survives only as `hint`, which orders the search and appears in reports.  The
resolver requires exactly one place in the field to carry that neighbourhood
and refuses to choose when more than one does.  Rows that share an anchor form
a group, and the group must name exactly as many places as it has rows -- that
is how a passage repeated verbatim inside one field is handled without ever
picking between its copies.

The change exists so that a repair may add or remove a character.  While every
row was an offset, nine scripts shared an unenforced contract that no pass ever
changed a length, and the whole class of dropped-letter damage was unreachable.
See scripts/repair_anchors.py.
"""
import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import repair_anchors as A

ROOT = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'lessons'
WRITE = '--write' in sys.argv

# lesson -> [(field, old codepoints, new codepoints, lead, tail, width, mult,
#             hint, note)]
ROWS = {
    7: [
        ('arabicBody', '0623064406520641064e064a0651064f06480645064f', '0623064406520642064e064a0651064f06480645064f',
         ['0628062d0642', '0633064806270647060c', '064806470648', '06270644062d064a', '06270644062f0627064a0645'],
         ['062706440630064a', '064a064206480645', '0628062a062f0628064a0631', '062e064406420647', '062f0627064a06450627060c'],
         5, 1, 40387, 'ayat al-kursi'),
        ('arabicBody', '0623064406520641064e064a0651064f06480645064c', '0623064406520642064e064a0651064f06480645064c',
         ['062706310627062f', '06270646', '064a06410636064406460627', '0628063a064a0631', '0627064406440647', '06410644064a0627062e0630', '0641063606440647', '06270644062d064a', '06270644062f0627064a0645', '06270644062806420627'],
         ['062706440645062806270644063a', '0641064a', '062706440642064a06270645', '0628062a062f0628064a0631', '062e064406420647060c', '0647063006270646', '0627064406270633064506270646', '0648063506410627', '0627064406440647', '062a0628062706310643'],
         10, 1, 11616, 'ayat al-kursi'),
        ('arabicBody', '0623064406520641064e064a0651064f06480645', '0623064406520642064e064a0651064f06480645',
         ['064706300627', '0627063306450647', '06470648060c', '06270644062d064a', '0627063306450647060c'],
         ['060c', '06440627', '062a0627062e06300647', '0627064406360645064a0631', '06390627064a062f'],
         5, 1, 10883, 'ayat al-kursi'),
        ('arabicBody', '0647064e06320652', '0647064f0648064e',
         ['064806360645064a0631', '0627064406440647', '06440627', '062706440647', '062706440627'],
         ['064706300627', '0627063306450647', '06470648060c', '06270644062d064a', '0627063306450647060c'],
         5, 1, 10847, 'ayat al-kursi'),
        ('arabicBody', '064506340631062a06470645', '064506340631062806470645',
         ['0627064406440647060c', '0642062f', '063906440645', '06430644', '0627064606270633'],
         ['0648064706300647', '062706440627064a0647', '0641064a06470627', '063006430631', '0627064406440647'],
         5, 1, 10754, 'ayat al-kursi'),
        ('arabicBody', '0627064406520641064e064a0651064f06480645064f', '0627064406520642064e064a0651064f06480645064f',
         ['06440627', '0645063906280648062f', '0628062d0642', '0641064a', '062706440648062c0648062f', '062706440627', '06470648', '06270644062d064a', '06270644062f0627064a0645', '06270644062806420627'],
         ['062706440645062806270644063a', '0641064a', '062706440642064a06270645', '0628062a062f0628064a0631', '062e064406420647', '063006430631', '06270646', '0627064406440647', '062a0628062706310643', '0648062a063906270644064a'],
         10, 1, 9812, 'ayat al-kursi'),
    ],
}


def main():
    applied = skipped = 0
    for lesson in sorted(ROWS):
        path = ROOT / f'{lesson:02d}.json'
        data = json.loads(path.read_text(encoding='utf-8'))
        touched = False
        by_field = {}
        for field, old, new, lead, tail, width, mult, hint, note in ROWS[lesson]:
            by_field.setdefault(field, []).append(
                ('|'.join(A.hx(x) for x in old.split('|')),
                 A.hx(new), [A.hx(x) for x in lead],
                 [A.hx(x) for x in tail], width, mult, hint, note))
        for field, rows in by_field.items():
            text = data.get(field) or ''
            text, a, s, log = A.apply_rows(text, rows, f'lesson {lesson:02d} {field}')
            if a:
                data[field] = text
                touched = True
                for hint, off, old, new, note in log:
                    print(f'  L{lesson:02d} {field:<16} hint@{hint:<6} now@{off:<6} '
                          f'{old} -> {new}   {note}')
            applied += a
            skipped += s
        if touched and WRITE:
            path.write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')
    verb = 'applied' if WRITE else 'would apply'
    print(f'{verb} {applied} repairs; {skipped} already in place')


if __name__ == '__main__':
    main()
