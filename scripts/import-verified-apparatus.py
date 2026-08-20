#!/usr/bin/env python3
"""
Rebuild the footnote apparatus for the lessons AK has verified, from his
"Verified Lessons - Citations Fixed" .docx files.

WHY. The site's apparatus for these lessons is broken in two different ways at
once. Lessons 5 and 6 carry no [N] markers at all, so none of their 48 and 57
notes is reachable from the text. Lessons 1-3 carry markers whose footnoteOrder
names ids that do not exist in footnotesData.json -- 47 of Lesson 1's 51, 11 of
Lesson 2's 13, 36 of Lesson 3's 39 -- so most markers there link to nothing.

WHAT THE .docx GIVES US that nothing else did: Word footnote elements carry an
inline reference at the exact character position the compiler keyed the note to.
No inference. Earlier attempts to reconstruct positions by matching footnote
blocks to preceding paragraphs agreed with known-good markers only 69% of the
time and were abandoned.

METHOD, per lesson:
  1. Read the .docx: body text with a sentinel at each footnote reference, and
     the footnote texts themselves. Separator "footnotes" (those carrying a
     w:type attribute) are not notes and are skipped.
  2. For each anchor, take the ~45 normalised characters that precede it and
     locate them in the *repo's* arabicBody, scanning forward. The repo text is
     kept, not replaced: it has had editorial work the .docx does not carry
     (the two agree to 0.95-0.99 by normalised length).
  3. Insert [k] at each located position, k sequential in document order.
  4. Rebuild footnoteOrder from the located anchors only. An anchor that cannot
     be located is REPORTED and its note is still written to the apparatus --
     it simply has no inline link, which is the honest state.
  5. Carry existing metadata (scholar, work, genre, enHeader, enTranslation,
     volRef ...) across by matching normalised Arabic text to the old rows, so
     AK's classification and translation work is not lost.

  python3 import_verified.py           # dry run, reports only
  python3 import_verified.py --write
"""
import sys, os, re, json, glob, unicodedata
from difflib import SequenceMatcher
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract import read_docx, norm_map, strip_all, MARK

SRC   = '/mnt/user-data/uploads/Verified Lessons - Citations Fixed'
REPO  = '/tmp/ntfs'
LESSON= re.compile(r'[Ll]esson\s*(\d+)')
WRITE = '--write' in sys.argv

def nkey(s):
    n,_ = norm_map(s)
    return n[:80]

def build(lesson, path, old_rows):
    text, notes = read_docx(path)
    lp   = os.path.join(REPO, 'src/data/lessons/%02d.json' % lesson)
    data = json.load(open(lp))
    # Drop the existing markers before doing anything else. On Lessons 1-3 most
    # of them were broken anyway -- 47 of Lesson 1's 51 named footnote ids that
    # do not exist -- and leaving them in place while splicing the verified ones
    # produced a body with both sets, 100 markers against 51 notes.
    body = re.sub(r'\[\d+\]', '', data['arabicBody'])
    nb, bidx = norm_map(strip_all(body))

    # AK's fixes changed the wording of many notes, so exact keys miss. Match on
    # best similarity above a threshold instead, each old row used at most once,
    # so his scholar/work/genre/volRef classification carries across.
    old_norm = []
    for r in old_rows:
        n, _ = norm_map(r.get('arabic') or '')
        if n:
            old_norm.append([n, r, False])

    def best_match(arabic):
        na, _ = norm_map(arabic)
        if not na:
            return None
        best, score = None, 0.0
        for e in old_norm:
            if e[2]:
                continue
            sm = SequenceMatcher(None, na[:300], e[0][:300])
            if sm.real_quick_ratio() < 0.55 or sm.quick_ratio() < 0.55:
                continue
            r_ = sm.ratio()
            if r_ > score:
                best, score = e, r_
        if best and score >= 0.62:
            best[2] = True
            return best[1]
        return None

    parts   = MARK.split(text)
    acc     = ''
    cursor  = 0
    inserts = []          # (body_char_index, seq)
    rows    = []
    unplaced= []
    seq     = 0
    for i in range(0, len(parts) - 1, 2):
        acc += parts[i]
        fid  = int(parts[i + 1])
        seq += 1
        na, _ = norm_map(re.sub(r'\[\d+\]', '', acc))
        probe = na[-45:]
        pos   = None
        if len(probe) >= 15:
            j = nb.find(probe, cursor)
            if j < 0:
                j = nb.find(probe)
            if j >= 0:
                end    = j + len(probe)
                cursor = end
                pos    = bidx[min(end, len(bidx) - 1)]

        arabic = notes.get(fid, '')
        old    = best_match(arabic)
        row = {
            'id': 'fn-%d-%d' % (lesson, seq),
            'lessonId': lesson,
            'num': seq,
            'displayNum': seq,
            'arabic': arabic,
            'scholar':      (old or {}).get('scholar'),
            'work':         (old or {}).get('work'),
            'sourceType':   (old or {}).get('sourceType', 'Other'),
            'genre':        (old or {}).get('genre', 'Other'),
            'enHeader':     (old or {}).get('enHeader', '[Citation]'),
            'enTranslation':(old or {}).get('enTranslation'),
            'volRef':       (old or {}).get('volRef'),
            'lessonTitleEn':(old_rows[0].get('lessonTitleEn') if old_rows else None),
            'verseRange':   (old_rows[0].get('verseRange') if old_rows else None),
            'anchored': pos is not None,
        }
        rows.append(row)
        if pos is None:
            unplaced.append(seq)
        else:
            inserts.append((pos, seq))

    # splice markers back-to-front so earlier offsets stay valid
    newbody = body
    for pos, k in sorted(inserts, reverse=True):
        newbody = newbody[:pos] + '[%d]' % k + newbody[pos:]

    order   = ['fn-%d-%d' % (lesson, k) for _, k in sorted(inserts)]
    carried = sum(1 for r in rows if r['scholar'] or r['enTranslation'] or r['volRef'])
    return data, lp, newbody, order, rows, unplaced, carried

def main():
    fnp  = os.path.join(REPO, 'src/data/footnotesData.json')
    allf = json.load(open(fnp))
    kept = [r for r in allf if r['lessonId'] > 7]
    newrows = []
    print('lesson  notes  placed  unplaced  metadataCarried  oldRows->newRows')
    for path in sorted(glob.glob(os.path.join(SRC, '*.docx')),
                       key=lambda p: int(LESSON.search(os.path.basename(p)).group(1))):
        n = int(LESSON.search(os.path.basename(path)).group(1))
        old = [r for r in allf if r['lessonId'] == n]
        data, lp, newbody, order, rows, unplaced, carried = build(n, path, old)
        newrows += rows
        print('  L%-2d %6d %7d %9d %16d  %d -> %d'
              % (n, len(rows), len(order), len(unplaced), carried, len(old), len(rows)))
        if unplaced:
            print('        unplaced anchors (note kept, no inline link):', unplaced)
        if WRITE:
            data['arabicBody']    = newbody
            data['footnoteOrder'] = order
            json.dump(data, open(lp, 'w'), ensure_ascii=False)
    if WRITE:
        out = sorted(newrows + kept, key=lambda r: (r['lessonId'], r.get('num') or 0))
        json.dump(out, open(fnp, 'w'), ensure_ascii=False)
        print('\nWROTE %d rows (%d for lessons 1-7, %d untouched for 8-56)'
              % (len(out), len(newrows), len(kept)))
    else:
        print('\ndry run — nothing written. Re-run with --write')

main()
