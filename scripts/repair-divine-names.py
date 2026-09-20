#!/usr/bin/env python3
"""
Repairs the two divine names of the basmala across the corpus.

The scan makes two errors here, both of them on the line that opens most of the
sura commentaries, and one of them says something the Shaykh did not say.

1. al-RAHMAN read as al-RAHMAL. Final nun taken for final lam - the two differ
   by a dot and the depth of the bowl. 65 sites. `al-rahmal` is not a word;
   r-h-m-l is not a root. Every site was read: 38 are the basmala itself, the
   rest are Qur'anic quotations where al-Rahman is the subject (Q 19:58, 19:61,
   19:69, 19:78, 19:85, 19:87, 19:88, 19:93, 20:5, 20:90, 20:109, 25:60, 36:11,
   41:2, 43:19, 43:20, 55:1, 67:3, 67:19, 67:20) and one is the Shaykh naming
   al-Rahman among the ninety-nine. No site is ambiguous, so this one runs by
   rule: any word whose skeleton is al-RAHMAL, last lam to nun.

2. al-RAHIM read as al-RAJIM. Ha taken for jim - again one dot. This one does
   NOT run by rule, because al-rajim IS a word and is usually right: the corpus
   has 42 occurrences and 26 of them are correct - `a'udhu bi-llahi min
   al-shaytan al-rajim`, and the running title of the Rima7 (`rimah hizb
   al-rahim 'ala nuhur hizb al-rajim`), which sits at the head of many pages.
   Turning those into `al-rahim` would make the Shaykh seek refuge from the
   Merciful. So the 16 errors are named one by one, each settled by the formula
   it sits in.

Both corrections swap a single letter and preserve length, so the offsets in
RAJIM_SITES stay valid while the rahman pass runs.

Nothing here is matched by a typed string: the scan's marks come in an order no
keyboard reproduces, and text typed into this repo does not survive transport
byte-identical. Positions and codepoints only.

Known and NOT repaired here, because each is a single site needing its own
reading: `li-l-RAHMAL` for li-l-Rahman at Q 25:60 (lesson 36), and `al-DIYL`
for al-din at Q 1:4 (lesson 56).

  python3 scripts/repair-divine-names.py          # dry run
  python3 scripts/repair-divine-names.py --write
"""
import json, re, sys, glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'lessons'

ALIF, HAMZA, LAM, NUN, JIM, HA = ('ا', 'أ', 'ل', 'ن',
                                  'ج', 'ح')
MARKS = set(range(0x64B, 0x660)) | {0x670, 0x6E1} | set(range(0x6D6, 0x6ED))
# al-RAHMAL with the prefixes the text actually carries: bare, bi-, li-,
# wa-, fa-, ka-, and the article written with alif, hamza, wasla, or dropped.
RAHMAL = re.compile(r'^[بلوفك]?[اأٱ]?ل?رحمل$')
RAJIM = re.compile(r'^[اأٱ]لرجيم$')
RAHIM = re.compile(r'^[اأٱ]لرحيم$')
WORD = re.compile(r'[؀-ۿ]+')

# lesson -> offsets where al-rajim stands for al-rahim, with what settles it
RAJIM_SITES = {
    29: [(18101, 'Q 15:49, ana al-ghafur al-rahim')],
    33: [(33407, 'basmala, sura al-Anbiya')],
    36: [(18701, 'basmala, sura al-Furqan')],
    37: [( 3039, 'Q 26:9, inna rabbaka la-huwa al-aziz al-rahim')],
    40: [(14633, 'basmala, sura al-Sajda')],
    41: [(63002, 'basmala, sura Fatir')],
    42: [(19697, 'basmala, sura al-Saffat')],
    43: [( 8719, 'basmala, sura Sad')],
    44: [(34796, 'Q 41:2, tanzilun min al-rahman al-rahim')],
    47: [(43830, 'basmala, sura Qaf')],
    51: [(23368, 'basmala, sura al-Saff')],
    52: [(33007, 'basmala, sura al-Haqqa')],
    53: [(14251, 'basmala, sura al-Muzzammil')],
    55: [(27282, 'basmala, sura al-Shams'), (67350, 'basmala, sura al-Masad')],
    56: [(20716, 'basmala, sura al-Fatiha')],
}


def skel(s):
    return ''.join(c for c in s if ord(c) not in MARKS)


def fix_rahman(body):
    out, n = [], 0
    last = 0
    for m in WORD.finditer(body):
        if not RAHMAL.match(skel(m.group(0))):
            continue
        w = m.group(0)
        i = w.rindex(LAM)
        out.append(body[last:m.start()])
        out.append(w[:i] + NUN + w[i + 1:])
        last = m.end()
        n += 1
    out.append(body[last:])
    return ''.join(out), n


def fix_rajim(body, sites, lesson):
    for off, why in sorted(sites, reverse=True):
        m = WORD.match(body, off)
        assert m, f'L{lesson} @{off}: no word here'
        w = m.group(0)
        if RAHIM.match(skel(w)):
            continue          # already repaired; the script is idempotent
        assert RAJIM.match(skel(w)), (
            f'L{lesson} @{off}: found {[hex(ord(c)) for c in w]}, not al-rajim'
        )
        assert w.count(JIM) == 1
        body = body[:m.start()] + w.replace(JIM, HA) + body[m.end():]
        print(f'    @{off:<6} -> al-rahim   ({why})')
    return body


def walk(node):
    """Rewrite every string in a JSON tree; returns (tree, count)."""
    if isinstance(node, str):
        return fix_rahman(node)
    if isinstance(node, list):
        out, n = [], 0
        for v in node:
            v, k = walk(v)
            out.append(v); n += k
        return out, n
    if isinstance(node, dict):
        out, n = {}, 0
        for key, v in node.items():
            v, k = walk(v)
            out[key] = v; n += k
        return out, n
    return node, 0


def main(write=False):
    total_n = total_j = 0
    for p in sorted(ROOT.glob('*.json')):
        raw = p.read_text(encoding='utf-8')
        L = json.loads(raw)
        numbered = p.stem.isdigit()
        lesson = int(p.stem) if numbered else None
        sites = RAJIM_SITES.get(lesson, [])
        if numbered and isinstance(L, dict) and 'arabicBody' in L:
            body, n = fix_rahman(L['arabicBody'])
            if n or sites:
                print(f'  lesson {lesson:02d}')
                if n:
                    print(f'    al-rahmal -> al-rahman  x{n}')
                body = fix_rajim(body, sites, lesson)
            L['arabicBody'] = body
        else:
            # sections_01 / sections_02: a second copy of lessons 1-2, kept for
            # the range builder and not rendered. Same rule, no rajim sites.
            L, n = walk(L)
            if n:
                print(f'  {p.name}')
                print(f'    al-rahmal -> al-rahman  x{n}')
        total_n += n
        total_j += len(sites)
        if write and (n or sites):
            p.write_text(json.dumps(L, ensure_ascii=False), encoding='utf-8')
    print(f'\n{total_n} al-rahman, {total_j} al-rahim')
    if write:
        print('WRITTEN')


if __name__ == '__main__':
    main('--write' in sys.argv)
