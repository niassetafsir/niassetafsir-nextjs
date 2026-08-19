#!/usr/bin/env python3
"""
Builds src/data/lessonRanges.json -- each majlis's span through the mushaf.

WHY: the automated citation matcher resolves a verse to the PARAGRAPH that
quotes it, which only exists for the 784 verses it managed to match. But the
fifty-seven sessions run consecutively through the whole Qur'an, so for any
aya there is a session that treats it. This derives that mapping from the
lessons' own verseRange fields.

Thirty-one lessons carry explicit "Q. x:y-z" ranges (exact: true). The other
twenty-six are titled by sura only ("Surat Maryam - Surat Taha"); their bounds
come from chaining -- each session ends where the next begins.

VALIDATION: the chain must close with no gaps from 1:1 to 114:6 and sum to
6,236 ayat (the Hafs total). If either check fails the mapping is wrong; the
script prints both. Do not ship a build where "discontinuities" is non-zero.

Volume and page come from edition2022.json, NOT from concordance.json, whose
volRef field still carries the off-by-one lesson-page bug (16 of its 30
lessons hold the PREVIOUS lesson's opening page).

Run from the repo root:  python3 scripts/build-lesson-ranges.py
"""

import json, re, glob, os


# ayah counts from SURAH_LIST
src = open('src/lib/verseRanges.ts', encoding='utf-8').read()
AYAH = {int(m.group(1)): int(m.group(2))
        for m in re.finditer(r'\{\s*id:\s*(\d+),\s*ayahCount:\s*(\d+)', src)}
NAME_EN = {int(m.group(1)): m.group(2)
           for m in re.finditer(r"\{\s*id:\s*(\d+),.*?nameEn:\s*'([^']+)'", src)}
assert len(AYAH) == 114, len(AYAH)

# normalise sura names for matching "Sūrat Al-Kahf"
def norm(s):
    return re.sub(r'[^a-z]', '', s.lower())
BY_NAME = {norm(v): k for k, v in NAME_EN.items()}

lessons = {}
for f in sorted(glob.glob('src/data/lessons/*.json')):
    if os.path.basename(f).startswith('sections_'): continue
    d = json.load(open(f, encoding='utf-8'))
    lessons[int(d['id'])] = d.get('verseRange') or ''

ed = json.load(open('src/data/edition2022.json', encoding='utf-8'))['lessons']

def explicit(vr):
    m = re.search(r'Q\.\s*(\d+):(\d+)\s*[–\-]\s*(?:(\d+):)?(\d+)', vr)
    if not m: return None
    s1, a1, s2, a2 = int(m.group(1)), int(m.group(2)), m.group(3), int(m.group(4))
    return (s1, a1, int(s2) if s2 else s1, a2)

def first_sura(vr):
    # "Sūrat Al-Muʾminūn – Sūrat Al-Nūr" -> 23
    parts = re.split(r'–', vr)
    m = re.search(r'S[ūu]rat\s+(.+)', parts[0].strip())
    if not m: return None
    return BY_NAME.get(norm(m.group(1)))

ids = sorted(lessons)
starts = {}
for lid in ids:
    e = explicit(lessons[lid])
    if e: starts[lid] = (e[0], e[1], True)
    else:
        s = first_sura(lessons[lid])
        starts[lid] = ((s, 1, False) if s else None)

def prev_verse(s, a):
    if a > 1: return (s, a - 1)
    s -= 1
    while s >= 1 and AYAH.get(s, 0) == 0: s -= 1
    return (s, AYAH[s]) if s >= 1 else None

out = {}
for i, lid in enumerate(ids):
    st = starts[lid]
    if not st: continue
    s1, a1, exact_start = st
    # end = the verse before the next lesson's start; last lesson keeps its own
    e = explicit(lessons[lid])
    if i + 1 < len(ids) and starts[ids[i + 1]]:
        ns, na, _ = starts[ids[i + 1]]
        pv = prev_verse(ns, na)
        s2, a2 = pv
        exact_end = exact_start and starts[ids[i + 1]][2]
    elif e:
        s2, a2, exact_end = e[2], e[3], True
    else:
        continue
    # an explicit range always wins over the chained end
    if e: s2, a2, exact_end = e[2], e[3], True
    ref = ed.get(str(lid))
    out[str(lid)] = {
        'start': [s1, a1], 'end': [s2, a2],
        'exact': bool(e),
        'volume': ref['volume'] if ref else None,
        'page': ref['page'] if ref else None,
    }

json.dump(out, open('src/data/lessonRanges.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)

# ---- report
exact = sum(1 for v in out.values() if v['exact'])
print(f'lessons with a range: {len(out)}  (exact {exact}, sura-level {len(out)-exact})')
def n(sa): return f'{sa[0]}:{sa[1]}'
covered = 0
prev_end = None
gaps = []
for lid in sorted(out, key=int):
    v = out[lid]
    s = v['start']; e2 = v['end']
    if prev_end:
        nxt = None
        ps, pa = prev_end
        nxt = (ps, pa + 1) if pa < AYAH[ps] else (ps + 1, 1)
        if tuple(s) != nxt: gaps.append((lid, n(prev_end), n(s)))
    prev_end = tuple(e2)
    # count verses in range
    ss, sa = s; es, ea = e2
    c = 0; cs, ca = ss, sa
    while (cs, ca) <= (es, ea) and cs <= 114:
        c += 1
        if ca < AYAH[cs]: ca += 1
        else: cs += 1; ca = 1
    covered += c
print('total āyāt covered by the 56 sessions:', covered)
print('discontinuities:', len(gaps))
for g in gaps[:6]: print('   lesson', g[0], 'starts', g[2], 'but previous ended', g[1])
print('first:', n(out[min(out,key=int)]['start']), ' last:', n(out[max(out,key=int)]['end']))
