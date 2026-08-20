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

def last_sura(vr):
    """The final sura named in a sura-titled range -- 'Surat al-Ikhlas - Surat
    al-Nas' -> 114. Needed for the LAST session, which has no successor to
    chain against: without it the closing session drops out of the file
    entirely and al-Ikhlas, al-Falaq and al-Nas resolve to nothing."""
    parts = re.split(r'–', vr)
    m = re.search(r'S[ūu]rat\s+(.+)', parts[-1].strip())
    return BY_NAME.get(norm(m.group(1))) if m else None

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
        ls = last_sura(lessons[lid])
        if not ls:
            continue
        s2, a2, exact_end = ls, AYAH[ls], False
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


# ---------------------------------------------------------------------------
# Attestation density: how much of a session's span is actually in the text.
#
# The chain proves the RANGES tile the mushaf. It proves nothing about whether
# Niasse commented on every aya inside a range -- and he did not. The early
# sessions are close to verse-by-verse; the later ones cover a sura or more per
# majlis and are frankly selective. Recording the density here keeps the verse
# page from claiming a session "treats this aya" when the aya is nowhere in it.
#
# Counted from translation-drafts/verse-match-report.json across ALL match
# tiers including fuzzy -- deliberately generous, so the number is an upper
# bound on what is attested rather than an undercount.
# ---------------------------------------------------------------------------
try:
    rep = json.load(open('translation-drafts/verse-match-report.json', encoding='utf-8'))
except FileNotFoundError:
    rep = {}
    print('WARNING: no verse-match-report.json; attestation counts omitted')

def _count(r):
    (s, a), (e, b) = r['start'], r['end']
    n = 0
    while (s, a) <= (e, b) and s <= 114:
        n += 1
        if a < AYAH[s]: a += 1
        else: s += 1; a = 1
    return n

for lid, r in out.items():
    o = rep.get(lid) or {}
    hits = set()
    for span in o.get('spans', []):
        m = span.get('match')
        if not m: continue
        for v in (m['verse'].split('-') if '-' in m['verse'] else [m['verse']]):
            sv, av = map(int, v.split(':'))
            if tuple(r['start']) <= (sv, av) <= tuple(r['end']):
                hits.add((sv, av))
    r['span'] = _count(r)
    r['attested'] = len(hits)

json.dump(out, open('src/data/lessonRanges.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)

tot = sum(r['span'] for r in out.values())
att = sum(r['attested'] for r in out.values())
print(f'attestation: {att} of {tot} ayat in range are quoted somewhere in the transcription ({100*att/tot:.1f}%)')


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------
# Two of the checks this block used to print could not fail. "discontinuities:
# 0" compared each lesson's start against the previous lesson's end + 1, but the
# loop above DEFINES each end as prev_verse(the next start), so the equality
# holds by construction at every chained seam. "total āyāt covered: 6236" is an
# identity: any contiguous tiling running 1:1 to 114:6 sums to the Ḥafṣ total
# wherever its interior boundaries fall. Both passed on a file in which lesson
# 56's range was [112:1, 111:5] -- end before start, matching no āya at all,
# its three sūras taken by the placeholder 57.json.
#
# Everything below can fail, and the script exits non-zero if anything does.

def n(sa): return f'{sa[0]}:{sa[1]}'
def idx(s, a): return sum(AYAH[k] for k in range(1, s)) + a   # muṣḥaf position

failures = []
exact = sum(1 for v in out.values() if v['exact'])
print(f'lessons with a range: {len(out)}  (exact {exact}, sūra-level {len(out)-exact})')

# --- 1. every range must run forwards. This is what the old checks missed.
inverted = [(lid, v) for lid, v in out.items() if idx(*v['start']) > idx(*v['end'])]
print('inverted ranges:', len(inverted))
for lid, v in inverted:
    print('   lesson', lid, v['start'], '->', v['end'], '  <-- start is after end')
    failures.append(f"lesson {lid} ends before it starts: {n(v['start'])} -> {n(v['end'])}")

missing_ref = [lid for lid in out if out[lid]['volume'] is None]
print('lessons with no printed reference:', len(missing_ref), missing_ref)

# --- 2. seams. Vacuous where both sides are chained; has content wherever an
#        explicit range overrode the chained end, since that end was not
#        derived from the next start. Counted separately so the number cannot
#        be read as more than it is.
seams_tested = seams_failed = 0
prev_lid = prev_end = None
for lid in sorted(out, key=int):
    v = out[lid]
    if prev_end is not None:
        ps, pa = prev_end
        nxt = (ps, pa + 1) if pa < AYAH[ps] else (ps + 1, 1)
        if out[prev_lid]['exact'] or v['exact']:
            seams_tested += 1
            if tuple(v['start']) != nxt:
                seams_failed += 1
                failures.append(
                    f"lesson {lid} starts {n(v['start'])} but {prev_lid} ended {n(prev_end)}")
    prev_lid, prev_end = lid, tuple(v['end'])
print(f'seams with an explicit range on one side: {seams_tested} tested, {seams_failed} inconsistent')
print('   (the rest are chained end-to-start and cannot disagree)')

# --- 3. independent cross-check. src/lib/surahLessons.ts is a hand-curated
#        sūra -> lesson table built for the /surah view, with no input from this
#        script. Where the two disagree about which session a sūra opens in, one
#        of them is wrong. The curated table records where a sūra becomes a
#        session's PRIMARY subject, so a session that merely runs into a sūra's
#        opening āyāt is expected to differ; those are printed for reading, not
#        counted as failures.
sl = open('src/lib/surahLessons.ts', encoding='utf-8').read()
block = re.search(r'SURA_TO_LESSON[^{]*\{(.*?)\}', sl, re.S)
CURATED = {int(a): int(b) for a, b in re.findall(r'(\d+)\s*:\s*(\d+)', block.group(1))} if block else {}

def lesson_for(s, a):
    for lid in sorted(out, key=int):
        v = out[lid]
        if idx(*v['start']) <= idx(s, a) <= idx(*v['end']): return int(lid)
    return None

agree, early, late = 0, [], []
for s in sorted(CURATED):
    mine, theirs = lesson_for(s, 1), CURATED[s]
    if mine == theirs: agree += 1
    elif mine is not None and mine < theirs: early.append((s, mine, theirs))
    else: late.append((s, mine, theirs))
print(f'vs surahLessons.ts: {agree}/{len(CURATED)} sūras agree on the opening session')
print(f'   {len(early)} where the ranges open a sūra EARLIER than the curated table'
      ' -- expected, the session runs in before the commentary proper starts')
print(f'   {len(late)} where the ranges open it LATER -- not explained by that rule')
for s, mine, theirs in late[:14]:
    print(f'      Q{s} {NAME_EN.get(s,"?")}: ranges say lesson {mine}, curated says {theirs}'
          f'  [{"exact" if out[str(mine)]["exact"] else "inferred"}]')

# --- 4. the load-bearing assumption, measured. Every sūra-level lesson is given
#        a start of āya 1 of its first named sūra. The lessons that state their
#        own range are the only evidence for whether sessions actually begin on
#        sūra boundaries, so count them instead of assuming.
on_boundary = [lid for lid, v in out.items() if v['exact'] and v['start'][1] == 1]
print(f'of the {exact} explicit lessons, {len(on_boundary)} start at āya 1 of a sūra'
      f' -- the assumption behind all {len(out) - exact} sūra-level starts')

print('first:', n(out[min(out, key=int)]['start']), ' last:', n(out[max(out, key=int)]['end']))
if failures:
    print('\nFAILED:')
    for f in failures: print('  -', f)
    raise SystemExit(1)
