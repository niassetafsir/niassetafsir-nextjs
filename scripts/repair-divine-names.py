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
         ['06280628062c', '063906280627062f0628', '062706280628', '062706280627', '062706280639064106480631'],
         ['064806270628', '0639062f06270628', '06470648', '062706280639062f06270628', '062706280627062806280645'],
         5, 18101, 'Q 15:49, ana al-ghafur al-rahim'),
    ],
   33: [
        ('062706440631064e062c0650064a06450650', '062706440631064e062d0650064a06450650',
         ['0639063306310647', '062706280647', '062806330645', '0627062806280647', '062706280631062c06450628'],
         ['06270641062806310628', '064106310628', '064806280628062806270633', '062706470628', '064506430647'],
         5, 33409, 'basmala, sura al-Anbiya'),
    ],
   36: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['064806330628063906480628', '062706280647', '0648062806330645', '0627062806280647', '062706280631062c06450628'],
         ['06280628062706310628', '06280639062706280628', '06270628062f', '062806310628', '0627062806390631064106270628'],
         5, 18701, 'basmala, sura al-Furqan'),
    ],
   37: [
        ('0627064406310651064e062c0650064a0645064f', '0627064406310651064e062d0650064a0645064f',
         ['06270628064506270628', '064806270628', '063106280643', '062806470648', '062706280639063106280631'],
         ['06470648', '062706280639062706280628', '063906280631', '0627062806450639062806480628060c', '0627062806450628062806410645'],
         5, 3039, 'Q 26:9, inna rabbaka la-huwa al-aziz al-rahim'),
    ],
   40: [
        ('0627064406310651062c0650064a0645', '0627064406310651062d0650064a0645',
         ['062806280627062806480628', '062706280647', '0628062706280645', '0627062806280647', '0627062806450628'],
         ['062706280645', '062706280641', '06270639062806270645', '062806270645', '0628063106480645'],
         5, 14633, 'basmala, sura al-Sajda'),
    ],
   41: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['0648062706310628063906480628', '062706280647', '062806330645', '0627062806280647', '062706280631062c06450628'],
         ['06270628062c0645062f', '06280647', '062c0645062f', '06280639062706280628', '0628064106330647'],
         5, 63003, 'basmala, sura Fatir'),
    ],
   42: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['0648062806450627062806480628', '062706280647', '062806330645', '062806280647', '062706280631062c06450628'],
         ['06480631062f', '06410628', '0635062f0631', '0627062c0627062f06280628', '06430628062806310647'],
         5, 19697, 'basmala, sura al-Saffat'),
    ],
   43: [
        ('0627064406310651064e062c0650064a0645', '0627064406310651064e062d0650064a0645',
         ['0648062806450627062806480628', '062706280647', '062806330645', '0627062806280647', '062706280631062c06450628'],
         ['0635', '0627062806280647', '0627063906280645', '0628064506310627062f0647', '06280647'],
         5, 8719, 'basmala, sura Sad'),
    ],
   44: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['064106310627', '062c0645', '06280628063106280628', '06450628', '062706280631062c06450628'],
         ['0643062806270628', '0641063506280628', '0627062806280647', '0648', '060c'],
         5, 34797, 'Q 41:2, tanzilun min al-rahman al-rahim'),
    ],
   47: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['0648062706310628063906480628', '062706280647', '062806330645', '0627062806280647', '062706280631062c06450628'],
         ['0641', '0627062806280647', '0627063906280645', '0628064506310627062f0647', '06270628062c063106480641'],
         5, 43830, 'basmala, sura Qaf'),
    ],
   51: [
        ('062706440631064e062c0650064a06450650', '062706440631064e062d0650064a06450650',
         ['064306450627', '064106470645', '062806330645', '0627062806280647', '062706280631062c06450628'],
         ['062806330628062c', '062806280647', '06450627', '06410628', '0627062806330645064806270628'],
         5, 23368, 'basmala, sura al-Saff'),
    ],
   52: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['0648062c0645063306480628', '062706280647', '062806330645', '0627062806280647', '062706280631062c06450628'],
         ['06270628062c062706410647', '0627062806410628062706450647060c', '063306450628', '062806480645', '0627062806410628062706450647'],
         5, 33007, 'basmala, sura al-Haqqa'),
    ],
   53: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['06390633063106480628', '062706280647', '062806330645', '0627062806280647', '062706280631062c0645'],
         ['06280627062806470627', '062706280645063106450628', '06410645', '063306280628', '0628063106480628'],
         5, 14251, 'basmala, sura al-Muzzammil'),
    ],
   55: [
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['0639063306310647', '062706280647', '062806330645', '0627062806280647', '062706280631062c06450628'],
         ['064806270628063306450633', '060c', '0627064106330645', '06270628062c062806280628', '062806270628063306450633'],
         5, 27282, 'basmala, sura al-Shams'),
        ('0627064406310651064e062c0650064a06450650', '0627064406310651064e062d0650064a06450650',
         ['062c06450633', '0627062806270628', '062806330645', '0627062806280647', '062706280631062c06450628'],
         ['062806450627', '062f06390627', '06270628062806280628', '063506280628', '0627062806280647'],
         5, 67350, 'basmala, sura al-Masad'),
    ],
   56: [
        ('06270650064406310651064e062c0650064a06450650', '06270650064406310651064e062d0650064a06450650',
         ['0628062c062f', '06270628062c062806270628', '0628062c06390628', '06270628064106270628062c0647', '06410628', '0627063306410628', '0627062806450635062c0641', '062806330645', '0627062806280647', '062706280631062c06450628'],
         ['06410648062806480627', '06270628062c0645062f', '062806280647', '06310628', '0627062806390628064506280628', '06270628', '06450628064306470645', '062706280631062c06450628', '062706280631062c06280645', '062706280645062806390645060c'],
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
                     f'L{lesson:02d} al-rajim', nfold=A.dotfold)[0][0]
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
