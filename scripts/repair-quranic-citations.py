#!/usr/bin/env python3
"""
Repair the Qurʾānic citations in the lesson Arabic against the Warsh text.

AK's rule, from the repair programme: inside ( ) and « » a divergence from the
āya is an error by definition; outside them the words are Niasse's. This script
acts only inside those marks, and only where a span matches a run of the muṣḥaf
well enough to be certain which run it is.

How it decides. Each sūra is treated as one continuous stream of words, so a
citation that runs across an āya boundary matches as one thing. Words are
compared with the diacritics and orthography stripped, since that is exactly
what the scan destroys. A span is repaired when the best matching window scores
at or above the threshold AND the next-best window elsewhere in the muṣḥaf
scores clearly worse -- a span that matches two places equally is left alone.

Nothing is written without --write. Every change is reported.
"""
import json, io, os, re, sys, unicodedata
from collections import defaultdict

REPO = os.environ['HOME'] + '/mnt/Documents/GitHub/niassetafsir-nextjs'
MARKS = set(range(0x0610, 0x0620)) | set(range(0x064B, 0x0660)) | set(range(0x06D6, 0x06ED + 1)) | {0x0670}

def norm_char(ch):
    if ch in 'أإآٱ': return 'ا'
    if ch == 'ى': return 'ي'
    if ch == 'ة': return 'ه'
    if ch in 'ؤئ': return 'ء'
    return ch

def skel(s):
    """Skeleton + index map back into s."""
    out, idx = [], []
    for i, ch in enumerate(s):
        if ord(ch) in MARKS or unicodedata.category(ch) == 'Mn':
            continue
        out.append(norm_char(ch)); idx.append(i)
    return ''.join(out), idx

def words_of(s):
    """[(skeleton_word, start_in_s, end_in_s)] for a raw Arabic string."""
    sk, idx = skel(s)
    res, cur, start = [], [], None
    for k, ch in enumerate(sk):
        if ch.isspace():
            if cur:
                res.append((''.join(cur), start, idx[k - 1] + 1)); cur = []
            continue
        if not cur: start = idx[k]
        cur.append(ch)
    if cur: res.append((''.join(cur), start, idx[len(sk) - 1] + 1))
    return [(w, a, b) for (w, a, b) in res if w]

def sim(a, b):
    """Cheap character similarity, 0..1. OCR damage is mostly single letters."""
    if a == b: return 1.0
    if not a or not b: return 0.0
    if abs(len(a) - len(b)) > 2: return 0.0
    same = sum(1 for x, y in zip(a, b) if x == y)
    return same / max(len(a), len(b))

# ── the muṣḥaf as one stream per sūra ────────────────────────────────
VERSES = json.load(io.open(REPO + '/src/data/verse_text.json', encoding='utf-8'))
streams = {}   # sura -> {'text': str, 'words': [(skel,a,b)], 'verse_at': [key per word]}
for key in sorted(VERSES, key=lambda k: (int(k.split(':')[0]), int(k.split(':')[1]))):
    s, a = key.split(':')
    s = int(s)
    ar = VERSES[key]['ar'] if isinstance(VERSES[key], dict) else VERSES[key]
    st = streams.setdefault(s, {'text': '', 'words': [], 'verse_at': []})
    off = len(st['text'])
    if off: st['text'] += ' '; off += 1
    st['text'] += ar
    for w, x, y in words_of(ar):
        st['words'].append((w, x + off, y + off)); st['verse_at'].append(key)

# inverted index on rare-ish words for candidate generation
index = defaultdict(list)
for s, st in streams.items():
    for i, (w, _, _) in enumerate(st['words']):
        if len(w) >= 3:
            index[w].append((s, i))
DF = {w: len(v) for w, v in index.items()}

def score_window(span_words, s, start):
    st = streams[s]['words']
    if start < 0 or start + len(span_words) > len(st): return 0.0
    tot = 0.0
    for k, sw in enumerate(span_words):
        tot += sim(sw, st[start + k][0])
    return tot / len(span_words)

def best_matches(span_words, limit=2):
    """Return the top windows as (score, sura, start)."""
    votes = defaultdict(int)
    anchors = sorted(((DF.get(w, 10 ** 9), j, w) for j, w in enumerate(span_words) if len(w) >= 3))[:6]
    for df, j, w in anchors:
        if df > 400: continue
        for (s, i) in index.get(w, ()):
            votes[(s, i - j)] += 1
    # near-miss anchors: allow one-letter damage on the rarest word
    if not votes:
        for df, j, w in anchors[:2]:
            for cand, positions in index.items():
                if sim(cand, w) >= 0.8:
                    for (s, i) in positions: votes[(s, i - j)] += 1
    scored = []
    seen = set()
    for (s, start), v in sorted(votes.items(), key=lambda kv: -kv[1])[:400]:
        for d in (-1, 0, 1):
            k = (s, start + d)
            if k in seen: continue
            seen.add(k)
            scored.append((score_window(span_words, s, start + d), s, start + d))
    scored.sort(reverse=True)
    return scored[:limit]

SPAN_RE = re.compile(r'\(([^()]{2,400})\)|«([^»]{2,400})»', re.S)
MIN_WORDS = 4
ACCEPT = 0.82
MARGIN = 0.10

def repair_text(ar, report, lesson_id):
    out = []
    last = 0
    for m in SPAN_RE.finditer(ar):
        inner = m.group(1) if m.group(1) is not None else m.group(2)
        open_ch, close_ch = ('(', ')') if m.group(1) is not None else ('«', '»')
        sw = [w for (w, _, _) in words_of(inner)]
        if len(sw) < MIN_WORDS:
            continue
        top = best_matches(sw)
        if not top: continue
        score, s, start = top[0]
        runner = top[1][0] if len(top) > 1 else 0.0
        if score < ACCEPT or (score - runner) < MARGIN:
            if score >= 0.6:
                report['skipped'].append((lesson_id, inner[:60], round(score, 3), round(runner, 3)))
            continue
        if score >= 0.999:
            continue  # already correct
        st = streams[s]
        a = st['words'][start][1]
        b = st['words'][start + len(sw) - 1][2]
        correct = st['text'][a:b]
        vfrom = streams[s]['verse_at'][start]
        vto = streams[s]['verse_at'][start + len(sw) - 1]
        out.append((m.start(), m.end(), open_ch + correct + close_ch))
        report['fixed'].append((lesson_id, vfrom if vfrom == vto else vfrom + '–' + vto.split(':')[1],
                                round(score, 3), inner.strip()[:70], correct[:70]))
    if not out: return ar, 0
    buf = []
    for (a, b, rep) in out:
        buf.append(ar[last:a]); buf.append(rep); last = b
    buf.append(ar[last:])
    return ''.join(buf), len(out)

def main():
    write = '--write' in sys.argv
    only = [a for a in sys.argv[1:] if a.isdigit()]
    report = {'fixed': [], 'skipped': []}
    d = REPO + '/src/data/lessons'
    total = 0
    for fn in sorted(os.listdir(d)):
        if not fn.endswith('.json'): continue
        L = json.loads(io.open(d + '/' + fn, encoding='utf-8').read())
        if not isinstance(L, dict) or L.get('id', 0) > 56: continue
        if only and str(L['id']) not in only: continue
        key = 'arabicBody' if L.get('arabicBody') else 'arabicText'
        if not L.get(key): continue
        new, n = repair_text(L[key], report, L['id'])
        total += n
        if n and write:
            L[key] = new
            io.open(d + '/' + fn, 'w', encoding='utf-8').write(json.dumps(L, ensure_ascii=False))
    print('=== REPAIRED %d spans%s ===' % (total, '' if write else '  (dry run — nothing written)'))
    for (lid, v, sc, was, now) in report['fixed']:
        print('L%-2s %-12s %.2f' % (lid, v, sc))
        print('    was: ' + was)
        print('    now: ' + now)
    print('\n=== LEFT ALONE: %d spans matched something but not confidently ===' % len(report['skipped']))
    for (lid, t, sc, rn) in report['skipped'][:40]:
        print('L%-2s %.2f (runner %.2f)  %s' % (lid, sc, rn, t))
    if len(report['skipped']) > 40:
        print('... and %d more' % (len(report['skipped']) - 40))

main()
