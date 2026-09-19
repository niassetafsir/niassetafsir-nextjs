#!/usr/bin/env python3
"""
Removes the printed page's running heads from the lesson bodies.

WHAT THIS IS. Every page of the printed edition carries the book's title and
the sūra's name at its head. The OCR swept both into the text as though the
Shaykh had said them, so they now sit inside his sentences and cut them in two:

    …والذي خوطب بخذ ذهب    سورة المالية    لا نعطي شيئا من أموالنا بعد النبي…

READ, NOT MATCHED. Ninety-seven bare sūra-name lines are in the corpus and most
of them are real section headings that must stay. The two are told apart by
whether the paragraph interrupts: a heading sits where a sentence has ended and
the next thing begins (`مكية`, `بسم الله`, a verse count); a running head lands
mid-clause. All 97 were classified that way and the 24 interrupting ones were
then read individually. Twenty-two are furniture. Two are not, and stay:

  L1  ¶67  `سورة البقرة`, followed by `مائتان وست وثمانون آية` — the heading
           that opens al-Baqara, with its verse count.
  L43 ¶113 `سورة الزمر`, followed by the sūra's Meccan/Medinan note.

The scan's own spelling is the corroboration. A heading the compiler set would
not be misspelt four different ways: `سورة المالية`, `سورة المالمية`,
`سورة المان.` and `سورة المالة` are all one running head, المائدة, read badly
four times. Same for `الأنوام`/`الأمر` (الأنعام), `الإمراء` (الإسراء),
`الكهز` (الكهف), `الشعرء` (الشعراء).

THE BOOK TITLE, 25 lines, needs no list: a short line ending in `رياض التفسير`
is the running title and nothing else, and every one of the 25 was read in
context before this was written. The OCR mangles its first word too — `بي`,
`بى`, `بن`, `بل`, `فى`, `ا` for في — which is why it is matched on the tail.

NOT TOUCHED HERE: 53 bare page or ḥadīth numbers and 162 fragments under eight
characters. Those are a separate class and need their own reading.

  python3 scripts/strip-page-furniture.py          # dry run
  python3 scripts/strip-page-furniture.py --write
"""
import json, re, sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'lessons'

# (lesson, paragraph index) -> the text that must be there, or the run aborts
RUNNING_HEADS = {
    (14, 68): 'سورة المالية', (14, 113): 'سورة المالمية',
    (15, 21): 'سورة المان.', (15, 79): 'سورة المالة',
    (15, 106): 'سورة الأنعام', (15, 117): 'سورة الأنوام',
    (15, 121): 'سورة الأنعام', (15, 131): 'سورة الأنعام',
    (15, 134): 'سورة الأمر', (15, 139): 'سورة الأنعام',
    (15, 145): 'سورة الأنعام', (15, 151): 'سورة الأنعام',
    (30, 198): 'سورة الإمراء', (31, 74): 'سورة الكهز',
    (33, 27): 'سورة ط', (33, 77): 'سورة طر',
    (37, 82): 'سورة الشعرء', (43, 93): 'سورة مى', (43, 103): 'سورة فى',
    (56, 32): 'سورة الفلق', (56, 36): 'سورة الفلق', (56, 51): 'سورة الناس',
}
TITLE = re.compile(r'رياض\s+التفسير\s*$')


def main(write=False):
    heads = titles = 0
    for i in range(1, 57):
        p = DATA / f'{i:02d}.json'
        L = json.loads(p.read_text(encoding='utf-8'))
        raw = L['arabicBody'].split('\n')
        # index over non-blank paragraphs, the numbering everything else uses
        nb = [k for k, line in enumerate(raw) if line.strip()]
        drop = set()
        for n, k in enumerate(nb):
            txt = raw[k].strip()
            if (i, n) in RUNNING_HEADS:
                assert txt == RUNNING_HEADS[(i, n)], \
                    f'L{i} ¶{n} is {txt!r}, expected {RUNNING_HEADS[(i, n)]!r}'
                drop.add(k); heads += 1
                print(f'  L{i:02d} ¶{n:<4} running head   {txt}')
            elif len(txt) < 26 and TITLE.search(txt):
                drop.add(k); titles += 1
                print(f'  L{i:02d} ¶{n:<4} book title     {txt}')
        if drop and write:
            L['arabicBody'] = '\n'.join(l for k, l in enumerate(raw) if k not in drop)
            p.write_text(json.dumps(L, ensure_ascii=False), encoding='utf-8')
    print(f'\n{heads} running heads + {titles} book-title lines = {heads + titles} paragraphs')
    if write:
        print('WRITTEN')


if __name__ == '__main__':
    main('--write' in sys.argv)
