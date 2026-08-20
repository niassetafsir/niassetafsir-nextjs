#!/usr/bin/env python3
"""
Recovers the half of each majlis that never reached the repo.

WHAT HAPPENED. AK digitised all fifty-six sessions into Google Docs. Whatever
imported them into src/data/lessons/NN.json stopped at roughly the halfway
point of each document: mapping the site's arabicBody onto its source shows the
text running monotonically from ~0.5% to ~50% and then simply ending, on a
paragraph boundary, mid-lesson. Median stop position across 56 lessons is
50.1%, with 49 of them inside a 45-55% band. That tightness is what rules out a
content boundary -- an Arabic/English split would scatter. About 1.9 million
characters of Arabic are missing.

APPEND, DO NOT REPLACE. The obvious fix -- rebuild arabicBody from the source
-- would be wrong. The stored text has had editorial work applied since import
(commit 4a7668e removed 32 leaked hadith-citation labels; there was a parallel
pass over lessons 29-56). A clean transform of the source reproduces the stored
text at only ~0.86 similarity, which is close enough to confirm the pairing and
nowhere near close enough to overwrite. So this script locates where the stored
text ends inside the source and appends only what follows. Existing text is
never touched.

METHOD, per lesson:
  1. Strip the source's title block (the ** lines) and its bare page-number
     lines, keeping every other non-empty line as a paragraph.
  2. Normalise both stored and source text -- drop [N] footnote markers,
     decompose and drop combining marks, fold alif variants, keep Arabic
     letters and spaces only -- while recording, for every normalised
     character, the index it came from in the untouched source. That index map
     is what makes it safe to cut the original at a position found in the
     normalised text.
  3. Find the stored text's closing 300 normalised characters in the source.
  4. Everything after that point is the recovery.

A lesson whose ending cannot be found is REPORTED AND SKIPPED, never guessed
at. Same for one that already reaches past 90% of its source.

  python3 scripts/recover-lesson-text.py            # dry run, reports only
  python3 scripts/recover-lesson-text.py --write    # writes the lesson JSONs

Sources are staged plain-text copies of the Drive documents, one per lesson,
in the directory given by --staged (default /home/claude/drive-lessons).
"""

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
LESSONS = REPO / 'src' / 'data' / 'lessons'

TITLE_LINE = re.compile(r'^[\*_]{1,2}.*[\*_]{1,2}$')
PAGE_LINE = re.compile(r'^\d{1,4}$')
RUNNING_HEAD = re.compile(r'^في\s*رياض\s*التفسير')
LESSON_ORDINAL = re.compile(r'^ا?لدرس\s')
FOOTNOTE_ENTRY = re.compile(r'^\(?\d{1,3}\s*[-–]\s*\S')
FOOTNOTE_MARKER = re.compile(r'\[\d+\]')
ARABIC_OR_SPACE = re.compile(r'[^؀-ۿ ]')
ANCHOR = 300


def paragraphs(raw: str) -> str:
    """Source document -> body text.

    Drops the running head and the lesson-number line, and the bare page
    numbers. Keeps everything else.

    An earlier version of this dropped EVERY emphasised line, which was wrong
    and quietly destructive: the sources mark sūra headings the same way they
    mark the document title, so "**سورة يس**", "**سورة الحديد**" and the
    "Meccan, 182 verses" notices under them were being thrown away with the
    running head. Lesson 55 alone carries fifty such lines -- it runs through
    twenty-five sūras -- and without them the recovered text is one
    undifferentiated block with no way to see where one sūra ends and the next
    begins. Only the running head and the lesson ordinal are boilerplate.
    """
    keep = []
    for line in raw.split('\n'):
        s = line.strip()
        if not s:
            continue
        if PAGE_LINE.match(s):
            continue
        bare = s.strip('*_ ').strip()
        if RUNNING_HEAD.match(bare) or LESSON_ORDINAL.match(bare):
            continue
        keep.append(bare if TITLE_LINE.match(s) and len(s) < 80 else s)
    return '\n'.join(keep)


def normalise(text: str):
    """Return (normalised, index_map) where index_map[i] is the position in
    `text` that normalised character i came from."""
    out, idx = [], []
    for i, ch in enumerate(text):
        if FOOTNOTE_MARKER.match(text[i:i + 8] or ''):
            pass  # handled below; markers survive as digits and get dropped
        for d in unicodedata.normalize('NFKD', ch):
            if unicodedata.combining(d):
                continue
            if d in 'ٱآأإ':
                d = 'ا'
            if ARABIC_OR_SPACE.match(d):
                d = ' '
            if d == ' ' and out and out[-1] == ' ':
                continue
            out.append(d)
            idx.append(i)
    return ''.join(out), idx


def recover(lesson_id: int, staged: Path):
    src_file = staged / f'{lesson_id:02d}.txt'
    json_file = LESSONS / f'{lesson_id:02d}.json'
    if not src_file.exists():
        return {'lesson': lesson_id, 'status': 'no source'}
    if not json_file.exists():
        return {'lesson': lesson_id, 'status': 'no lesson json'}

    data = json.loads(json_file.read_text(encoding='utf-8'))
    stored = data.get('arabicBody') or ''
    if not stored:
        return {'lesson': lesson_id, 'status': 'empty arabicBody'}

    body = paragraphs(src_file.read_text(encoding='utf-8'))
    nb, imap = normalise(body)
    ns, _ = normalise(stored)

    # Anchor on the stored text's closing window. When that fails it is almost
    # always because the editorial passes (commit 4a7668e and its 29-56
    # counterpart) deleted a leaked hadith-citation label inside the final few
    # hundred characters, so the stored ending no longer occurs in the source
    # verbatim. Slide the window backwards until one matches, then add back the
    # stored characters that followed it -- otherwise those characters would be
    # appended a second time.
    end_norm = -1
    for back in range(0, 4000, 150):
        hi = len(ns) - back
        lo = hi - ANCHOR
        if lo < 0:
            break
        window = ns[lo:hi].strip()
        if len(window) < 60:
            continue
        pos = nb.rfind(window)
        if pos >= 0:
            end_norm = pos + len(window) + back
            break
    if end_norm < 0:
        return {'lesson': lesson_id, 'status': 'ANCHOR NOT FOUND',
                'stored': len(stored), 'source': len(body)}
    end_norm = min(end_norm, len(nb))
    pct = 100.0 * end_norm / len(nb)
    if end_norm >= len(imap):
        cut = len(body)
    else:
        cut = imap[end_norm]

    raw_tail = body[cut:].strip()

    # The recovered half carries the compiler's footnote apparatus interleaved
    # with the commentary -- each printed page's notes following that page's
    # text, so they appear as isolated single lines ("1 - أخرج البخاري…"),
    # 17.9% of the recovered characters overall. They are al-Ibrāhīmī's notes,
    # not Niasse's words, and the site already keeps them in a separate system
    # (footnotesData.json, reached by [N] markers). Folding them into
    # arabicBody would put the compiler's voice inside the master's text, so
    # they are split out here and held for a proper footnote pass.
    body_lines, note_lines = [], []
    for line in raw_tail.split('\n'):
        s = line.strip()
        if not s:
            continue
        (note_lines if FOOTNOTE_ENTRY.match(s) else body_lines).append(s)

    return {
        'notes': '\n'.join(note_lines),
        'lesson': lesson_id,
        'status': 'ok',
        'stored': len(stored),
        'source': len(body),
        'ends_at': pct,
        'recovered': len('\n'.join(body_lines)),
        'tail': '\n'.join(body_lines),
        'json_file': json_file,
        'data': data,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--staged', default='/home/claude/drive-lessons')
    ap.add_argument('--write', action='store_true')
    ap.add_argument('--only', type=int, default=None)
    args = ap.parse_args()

    staged = Path(args.staged)
    ids = [args.only] if args.only else range(1, 57)

    rows, problems, written = [], [], 0
    for n in ids:
        r = recover(n, staged)
        if r['status'] != 'ok':
            problems.append(r)
            continue
        rows.append(r)
        if args.write and r['recovered'] > 0:
            d = r['data']
            d['arabicBody'] = (d['arabicBody'].rstrip() + '\n' + r['tail']).strip()
            r['json_file'].write_text(
                json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
            written += 1

    print(f'{"lesson":>6} {"stored":>9} {"source":>9} {"ends at":>8} {"recovers":>10}')
    for r in rows:
        flag = '' if r['ends_at'] < 90 else '   (already complete)'
        print(f'{r["lesson"]:>6} {r["stored"]:>9,} {r["source"]:>9,} '
              f'{r["ends_at"]:>7.1f}% {r["recovered"]:>10,}{flag}')

    tot_stored = sum(r['stored'] for r in rows)
    tot_rec = sum(r['recovered'] for r in rows)
    print()
    print(f'lessons processed : {len(rows)}')
    print(f'currently stored  : {tot_stored:,} chars')
    print(f'recoverable       : {tot_rec:,} chars')
    if tot_stored:
        print(f'corpus grows by   : {100.0 * tot_rec / tot_stored:.0f}%')
    complete = [r for r in rows if r['ends_at'] >= 90]
    print(f'already complete  : {len(complete)} '
          f'{[r["lesson"] for r in complete]}')

    if problems:
        print()
        print('SKIPPED — not guessed at:')
        for p in problems:
            print(f'  lesson {p["lesson"]}: {p["status"]}')

    if args.write:
        print()
        print(f'WROTE {written} lesson files.')
    else:
        print()
        print('Dry run. Nothing written. Re-run with --write to apply.')
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
