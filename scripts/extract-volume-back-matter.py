#!/usr/bin/env python3
"""
Moves each volume's printed back matter out of the lesson that was carrying it.

WHAT WAS WRONG. The lesson closing a volume ends, in the printing, with that
volume's fihris; volume 8 also carries the printer's colophon and volume 10 three
taqārīẓ and a chronogram. The import took all of it as commentary, so a reader of
Lesson 56 met a taqrīẓ qaṣīda and a table of contents for sūras 62-114 as though
the Shaykh had dictated them -- 135 of that lesson's 219 paragraphs, and between
4 and 23 in seven others.

THE BOUNDARY was read in every case, never matched. It is the first paragraph of
the fihris, `المحتويات`, except in Lesson 30 where the list begins seven
paragraphs before its own heading; a sūra name carrying dot leaders
(`سورة يوسف . ..`) is what tells a fihris line from a running head. For Lesson 56
it is the first taqrīẓ, which follows the khatm duʿāʾ that closes the whole
tafsīr. The Shaykh's closing address (`إخواننا جئناكم بتفسير موجز…`) is his words
and stays in the lesson.

LESSON 35 IS NOT LIKE THE OTHERS. It is volume 6 (al-Muʾminūn-al-Nūr), but from
paragraph 104 its body commentates al-Isrāʾ -- volume 5's last sūra, Lesson 30's
subject -- and the fihris after it lists Yūsuf to al-Isrāʾ, which is volume 5's
contents. The import handed Lesson 35 the tail of the wrong volume. Eight of
those seventeen paragraphs stand word-for-word in Lesson 30 already; the rest are
the same passage under different OCR. So its cut is at 104, not at the fihris,
and what comes out is filed as volume 5's. Volume 6's own fihris is nowhere in
the corpus, and neither is volume 1's, though both were printed with one -- import
gaps, not absences in the book.

NOTHING IS DELETED. Removed paragraphs go to src/data/volumeBackMatter.json,
keyed by volume, recording which lesson held them. No route reads that file yet:
this preserves the paratext, it does not publish it.

INDEX SPACE. These cuts count non-blank paragraphs. Every `paraIndex` downstream
counts the POEM-FILTERED array (src/lib/arabicCommentary.ts drops lines opening
`أعوذ بالله|بسم الله|اللهم صل`). The two agree in every lesson here except 56,
where raw 84 is rendered 83. Cutting at the tail, every surviving index is stable
either way.
"""
import json
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / 'src' / 'data'

CUTS = {12: 89, 19: 119, 25: 91, 30: 218, 35: 104,
        40: 119, 45: 142, 50: 159, 56: 84}

EXPECT = {12: 'المحتويات', 19: 'المحتويات', 25: 'المحتويات', 30: 'سورة يوسف . ..',
          35: 'سورة الإسراء', 40: 'المحتويات', 45: 'المحتويات', 50: 'المحتويات',
          56: 'تقري'}

# Lesson 35's removed run is not paratext. Paragraphs 104-120 are commentary on
# al-Isrāʾ -- Lesson 30's subject -- and only what follows is volume 5's fihris.
# Filing the whole run as "back matter" would call the Shaykh's exegesis a table
# of contents, so the two are kept apart.
MISFILED = {35: 5}
COMMENTARY_UNTIL = {35: 121}    # paragraphs [cut, this) are commentary, not paratext


def cut_offset(body, n):
    """Offset in the RAW body of the nth non-blank paragraph, so blank-line
    separators in the retained text are not disturbed."""
    seen = pos = 0
    for line in body.split('\n'):
        if line.strip():
            if seen == n:
                return pos
            seen += 1
        pos += len(line) + 1
    raise AssertionError('fewer than %d non-blank paragraphs' % n)


def main(write=False):
    out = {}
    for lesson, cut in sorted(CUTS.items()):
        p = DATA / 'lessons' / f'{lesson:02d}.json'
        L = json.loads(p.read_text(encoding='utf-8'))
        body = L['arabicBody']
        paras = [x for x in body.split('\n') if x.strip()]
        head = paras[cut].strip()
        assert head.startswith(EXPECT[lesson]), \
            f'L{lesson} para {cut} is {head[:40]!r}, expected {EXPECT[lesson]!r}'
        off = cut_offset(body, cut)
        keep = body[:off].rstrip('\n')
        moved = [x.strip() for x in body[off:].split('\n') if x.strip()]
        vol = MISFILED.get(lesson, L['volume'])
        e = out.setdefault(str(vol), {'volume': vol, 'fromLessons': [], 'paragraphs': []})
        e['fromLessons'].append(lesson)
        if lesson in MISFILED:
            e['note'] = (f'Lesson {lesson} is volume {L["volume"]}; this run is '
                         f'volume {vol} matter the import misfiled into it.')
        split = COMMENTARY_UNTIL.get(lesson)
        if split is not None:
            n_comm = split - cut
            e.setdefault('misfiledCommentary', []).extend(moved[:n_comm])
            e['paragraphs'].extend(moved[n_comm:])
        else:
            e['paragraphs'].extend(moved)
        print(f'L{lesson:02d} vol {L["volume"]:>2} -> filed under {vol:>2}: keep {cut}, '
              f'move {len(moved)} ({sum(map(len, moved))} chars) — {head[:38]}'
              + (f' [{COMMENTARY_UNTIL[lesson] - cut} of them commentary]'
                 if lesson in COMMENTARY_UNTIL else ''))
        if write:
            L['arabicBody'] = keep
            p.write_text(json.dumps(L, ensure_ascii=False), encoding='utf-8')
    if write:
        (DATA / 'volumeBackMatter.json').write_text(
            json.dumps(out, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print('\nwrote src/data/volumeBackMatter.json')


if __name__ == '__main__':
    import sys
    main('--write' in sys.argv)
