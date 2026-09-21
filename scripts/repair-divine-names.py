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

Both corrections swap a single letter, but RAJIM_SITES no longer relies on
that: each site is named by the words around it, not by a character offset, so
it still resolves when an earlier pass has added or removed a character. The
resolver refuses to choose when the neighbourhood matches twice -- which
matters here more than anywhere, since al-rajim is usually RIGHT and a site
picked by preference would make the Shaykh seek refuge from the Merciful.

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

sys.path.insert(0, str(Path(__file__).resolve().parent))
import repair_anchors as A

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

# lesson -> [(old word, new word, lead, tail, width, hint, what settles it)].
# Anchored on the surrounding words; the offset is a hint, not the identity.
RAJIM_SITES = {
   29: [
        ('0627064406310651064e062c0650064a0645064f', '0627064406310651064e062d0650064a0645064f',
         ['0646064a062e', '063906280627062f064a', '06270646064a', '062706460627', '06270644063a064106480631'],
         ['064806270646', '0639063006270628', '06470648', '062706440639063006270628', '0627064406270644064a0645'],
         5, 18101, 'Q 15:49, ana al-ghafur al-rahim'),
    ],
   33: [
        ('062706440631064e062c0650064a06450650', '062706440631064e062d0650064a06450650',
         ['0639063406310647', '0627064a0647', '062806330645', '0627064406440647', '062706440631062d06450646'],
         ['06270642062a06310628', '064206310628', '064806440644064606270633', '062706470644', '064506430647'],
         5, 33409, 'basmala, sura al-Anbiya'),
    ],
   36: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['064806330628063906480646', '0627064a0647', '0648062806330645', '0627064406440647', '062706440631062d0645064a'],
         ['062a062806270631062a', '062a063906270644064a', '062706440630', '064606320644', '062706440639063106410627062a'],
         5, 18701, 'basmala, sura al-Furqan'),
    ],
   37: [
        ('0627064406310651064e062c0650064a0645064f', '0627064406310651064e062d0650064a0645064f',
         ['0627064a064506270646', '064806270646', '063106280643', '064406470648', '0627064406390632064a0632'],
         ['06470648', '06270644063a062706440628', '063a064a0631', '062706440645063a064406480628060c', '0627064406450646062a06420645'],
         5, 3039, 'Q 26:9, inna rabbaka la-huwa al-aziz al-rahim'),
    ],
   40: [
        ('0627064406310651062c0650064a0645', '0627064406310651062d0650064a0645',
         ['062b06440627062b06480646', '0627064a0647', '0644062706460645', '0627064406440647', '0627064406450646'],
         ['062706440645', '062706440641', '06270639064406270645', '064406270645', '0644063206480645'],
         5, 14633, 'basmala, sura al-Sajda'),
    ],
   41: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['0648062706310628063906480646', '0627064a0647', '062806330645', '0627064406440647', '062706440631062d06450646'],
         ['06270644062d0645062f', '06440647', '062d0645062f', '062a063906270644064a', '0646064106330647'],
         5, 63003, 'basmala, sura Fatir'),
    ],
   42: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['0648062b06450627064606480646', '0627064a0647', '062806330645', '064406440647', '062706440631062d06450646'],
         ['06480631062f', '0641064a', '0635062f0631', '0627062d0627062f064a062b', '0643062b064a06310647'],
         5, 19697, 'basmala, sura al-Saffat'),
    ],
   43: [
        ('0627064406310651064e062c0650064a0645', '0627064406310651064e062d0650064a0645',
         ['0648062b06450627064606480646', '0627064a0647', '062806330645', '0627064406440647', '062706440631062d06450646'],
         ['0635', '0627064406440647', '0627063906440645', '0628064506310627062f0647', '06280647'],
         5, 8719, 'basmala, sura Sad'),
    ],
   44: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['064206310627', '062c0645', '062a06460632064a0644', '06450646', '062706440631062d06450646'],
         ['0643062a06270628', '064106350644062a', '0627064a062a0647', '0648', '060c'],
         5, 34797, 'Q 41:2, tanzilun min al-rahman al-rahim'),
    ],
   47: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['0648062706310628063906480646', '0627064a0647', '062806330645', '0627064406440647', '062706440631062d06450646'],
         ['0642', '0627064406440647', '0627063906440645', '0628064506310627062f0647', '06270644062d063106480641'],
         5, 43830, 'basmala, sura Qaf'),
    ],
   51: [
        ('062706440631064e062c0650064a06450650', '062706440631064e062d0650064a06450650',
         ['064306450627', '064106470645', '062806330645', '0627064406440647', '062706440631062d06450646'],
         ['064a06330628062d', '064406440647', '06450627', '0641064a', '062706440633064506480627062a'],
         5, 23368, 'basmala, sura al-Saff'),
    ],
   52: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['0648062e0645063306480646', '0627064a0647', '062806330645', '0627064406440647', '062706440631062d06450646'],
         ['06270644062d062706410647', '062706440642064a062706450647060c', '06330645064a', '064a06480645', '062706440642064a062706450647'],
         5, 33007, 'basmala, sura al-Haqqa'),
    ],
   53: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['06390634063106480646', '0627064a0647', '062806330645', '0627064406440647', '062706440631062d0645'],
         ['064a0627064a06470627', '062706440645063206450644', '06410645', '063306280628', '0646063206480644'],
         5, 14251, 'basmala, sura al-Muzzammil'),
    ],
   55: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['0639063406310647', '0627064a0647', '062806330645', '0627064406440647', '062706440631062d06450646'],
         ['064806270644063406450633', '060c', '0627064206330645', '06270644062c0644064a0644', '062806270644063406450633'],
         5, 27282, 'basmala, sura al-Shams'),
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['062e06450633', '0627064a0627062a', '062806330645', '0627064406440647', '062706440631062d06450646'],
         ['064406450627', '062f06390627', '0627064406460628064a', '06350644064a', '0627064406440647'],
         5, 67350, 'basmala, sura al-Masad'),
    ],
   56: [
        ('06270650064406310651064e062c0650064a06450650', '06270650064406310651064e062d0650064a06450650',
         ['062a062c062f', '06270644062c064406270644', '064a062c06390644', '0627064406410627062a062d0647', '0641064a', '0627063306410644', '0627064406450635062d0641', '062806330645', '0627064406440647', '062706440631062d06450646'],
         ['06420648064406480627', '06270644062d0645062f', '064406440647', '06310628', '06270644063906440645064a0646', '0627064a', '06450644064306470645', '062706440631062d06450646', '062706440631062d064a0645', '062706440645064606390645060c'],
         10, 20716, 'basmala, sura al-Fatiha'),
    ],
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
    for old, new, lead, tail, width, hint, why in sites:
        off = A.plan(body, [(A.hx(old), A.hx(new), [A.hx(x) for x in lead],
                             [A.hx(x) for x in tail], width, 1, hint, why)],
                     f'L{lesson:02d} al-rajim')[0][0]
        w = WORD.match(body, off).group(0)
        if RAHIM.match(skel(w)):
            continue          # already repaired; the script is idempotent
        assert RAJIM.match(skel(w)), (
            f'L{lesson} hint@{hint} -> {off}: found '
            f'{[hex(ord(c)) for c in w]}, not al-rajim')
        assert w.count(JIM) == 1
        body = body[:off] + w.replace(JIM, HA) + body[off + len(w):]
        print(f'    hint@{hint:<6} now@{off:<6} -> al-rahim   ({why})')
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
