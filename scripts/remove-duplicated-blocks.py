#!/usr/bin/env python3
"""
Removes four blocks of text the import scanned twice.

Each is a run of consecutive paragraphs that appears once, then again a few
paragraphs later. Lesson 8's second copy is even introduced by a page running
head (`سورة ال عمران` — its internal space is why
scripts/strip-page-furniture.py did not catch it), which is the clearest sign of
what happened: the same printed page went through the scanner twice.

WHICH COPY GOES. The second, in all four — but that was decided by reading the
places where the two copies disagree, not by preferring the earlier one:

  L8   ¶48–52 == ¶54–58, byte for byte. Nothing to choose between them.
  L13  ¶112–122 == ¶123–133, identical but for one paragraph: ¶117 runs 460
       characters against ¶128's 441, so the first copy is the fuller.
  L22  ¶1–3 == ¶4–6, 98% of words shared. The difference is inside the lemma of
       Q 2:189: the first reads `وَالْحَجُّ` and the second `وَالْحَتِحُ`. The
       first has the word; the second has noise.
  L30  ¶19–21 == ¶22–24. ¶23 carries one word more at its head, but its
       Qurʾānic lemma is wrecked — `(إنَهُ لَيْسَ لَهْد سُلْطَرَ)` against ¶20's
       correct `(إِنَّهُۥ لَيْسَ لَهُۥ سُلْطَٰنٌ)`, Q 16:99. In an edition whose
       whole apparatus keys off the bracketed citations, the intact lemma wins.

The script checks that the two copies really are near-identical before deleting
anything, so a shifted body aborts instead of cutting live text.

  python3 scripts/remove-duplicated-blocks.py          # dry run
  python3 scripts/remove-duplicated-blocks.py --write
"""
import json, re, sys, unicodedata
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'lessons'

# lesson: (first copy start, second copy start, how many paragraphs,
#          extra paragraphs to drop immediately before the second copy)
BLOCKS = {8: (48, 54, 5, 1), 13: (112, 123, 11, 0),
          22: (1, 4, 3, 0), 30: (19, 22, 3, 0)}
# A real shift scores near zero; a paragraph the scanner read badly twice still
# scores high. So the block as a whole must be almost identical, while any one
# paragraph is allowed to be poor — L13 ¶117/¶128 sit at 0.77, which is the OCR
# divergence that decided which copy to keep, not evidence of a shift.
MIN_MEAN = 0.95
MIN_ONE = 0.65


def norm(s):
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r'[أإآٱ]', 'ا', s).replace('ى', 'ي')
    return re.sub(r'[^ء-ي]', '', s)


def sim(a, b):
    a, b = set(norm(a)[i:i+4] for i in range(len(norm(a)) - 3)), \
           set(norm(b)[i:i+4] for i in range(len(norm(b)) - 3))
    return len(a & b) / max(1, len(a | b))


def main(write=False):
    total = 0
    for lesson, (a0, b0, n, extra) in sorted(BLOCKS.items()):
        p = DATA / f'{lesson:02d}.json'
        L = json.loads(p.read_text(encoding='utf-8'))
        raw = L['arabicBody'].split('\n')
        nb = [k for k, line in enumerate(raw) if line.strip()]
        scores = [sim(raw[nb[a0 + i]], raw[nb[b0 + i]]) for i in range(n)]
        worst = min(scores); mean = sum(scores) / len(scores)
        assert mean >= MIN_MEAN and worst >= MIN_ONE, \
            f'L{lesson}: block similarity mean {mean:.2f}, worst {worst:.2f} — body has shifted'
        drop = {nb[k] for k in range(b0 - extra, b0 + n)}
        print(f'L{lesson:02d}  keep ¶{a0}–{a0+n-1}, drop ¶{b0-extra}–{b0+n-1} '
              f'({len(drop)} paragraphs, {sum(len(raw[k].strip()) for k in drop)} chars) '
              f'— copies agree {mean:.2f} mean, {worst:.2f} worst')
        if extra:
            print(f'      including the running head before it: {raw[nb[b0-1]].strip()}')
        total += len(drop)
        if write:
            L['arabicBody'] = '\n'.join(l for k, l in enumerate(raw) if k not in drop)
            p.write_text(json.dumps(L, ensure_ascii=False), encoding='utf-8')
    print(f'\n{total} paragraphs')
    if write:
        print('WRITTEN')


if __name__ == '__main__':
    main('--write' in sys.argv)
