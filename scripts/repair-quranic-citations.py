#!/usr/bin/env python3
"""
Repair the Qurʾānic citations in the lesson Arabic against the Warsh text. v2.

v1 (reverted in 5217d2f) corrupted five āyāt by substituting a different verse,
clipped the trailing mark off every span it touched, and imported the rubʿ
al-ḥizb sign into the text. Five changes answer those failures:

  1. A word ends after its trailing combining marks, not at its last consonant,
     so a case vowel or a silent ṣila yāʾ is no longer clipped.
  2. Any span carrying a stray delimiter, a footnote digit, a brace, Latin
     script, or a token with no Arabic letter at all is skipped outright. Those
     tokens were counted as words and displaced the whole matching window.
  3. The muṣḥaf slice is cleaned of ۞ and of the bidi marks; a division sign is
     no part of an āya.
  4. Word similarity is Levenshtein, not positional character overlap. Under v1
     a single OCR insertion inside a word scored it 0.0 and handed the span to
     the wrong candidate.
  5. A span must agree with its neighbours. Spans are read in document order and
     a running position is carried; a candidate that continues where the last
     accepted span left off is preferred, and one that jumps to another sūra
     must beat its rivals by a wide margin to be believed. Every one of v1's
     eight wrong-verse substitutions sat inside a run of its true neighbours.

Dry run by default. --write applies. A lesson id limits it to that lesson.
"""
import json, io, os, re, sys, unicodedata
from collections import defaultdict

REPO = os.environ['HOME'] + '/mnt/Documents/GitHub/niassetafsir-nextjs'
MARKS = set(range(0x0610, 0x0620)) | set(range(0x064B, 0x0660)) | set(range(0x06D6, 0x06ED + 1)) | {0x0670}
STRIP_FROM_SLICE = {0x06DE, 0x200E, 0x200F, 0x061C}          # ۞ and the bidi marks
ARABIC = lambda ch: 0x0620 <= ord(ch) <= 0x064A or ch in 'ءآأؤإئا'
DIGITS = set('0123456789٠١٢٣٤٥٦٧٨٩')
FORBIDDEN_IN_SPAN = set('{}[]()«»<>') | DIGITS

def norm_char(ch):
    if ch in 'أإآٱ': return 'ا'
    if ch == 'ى': return 'ي'
    if ch == 'ة': return 'ه'
    if ch in 'ؤئ': return 'ء'
    return ch

def words_of(s):
    """[(skeleton, start, end)] — end runs past the word's trailing marks."""
    res, cur, start, last = [], [], None, None
    for i, ch in enumerate(s):
        if ord(ch) in MARKS or unicodedata.category(ch) == 'Mn':
            continue
        if ch.isspace():
            if cur: res.append((''.join(cur), start, last)); cur = []
            continue
        if not cur: start = ch and i
        cur.append(norm_char(ch)); last = i
    if cur: res.append((''.join(cur), start, last))
    out = []
    for w, a, b in res:
        e = b + 1
        while e < len(s) and (ord(s[e]) in MARKS or unicodedata.category(s[e]) == 'Mn'):
            e += 1
        if w: out.append((w, a, e))
    return out

def lev(a, b, cap=4):
    if a == b: return 0
    la, lb = len(a), len(b)
    if abs(la - lb) > cap: return cap + 1
    prev = list(range(lb + 1))
    for i in range(1, la + 1):
        cur = [i] + [0] * lb
        best = cur[0]
        for j in range(1, lb + 1):
            cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] != b[j - 1]))
            best = min(best, cur[j])
        if best > cap: return cap + 1
        prev = cur
    return prev[lb]

def sim(a, b):
    if a == b: return 1.0
    if not a or not b: return 0.0
    d = lev(a, b)
    m = max(len(a), len(b))
    return max(0.0, 1.0 - d / m)

VERSES = json.load(io.open(REPO + '/src/data/verse_text.json', encoding='utf-8'))
streams = {}
for key in sorted(VERSES, key=lambda k: (int(k.split(':')[0]), int(k.split(':')[1]))):
    s, _ = key.split(':'); s = int(s)
    ar = VERSES[key]['ar'] if isinstance(VERSES[key], dict) else VERSES[key]
    st = streams.setdefault(s, {'text': '', 'words': [], 'verse_at': []})
    off = len(st['text'])
    if off: st['text'] += ' '; off += 1
    st['text'] += ar
    for w, x, y in words_of(ar):
        st['words'].append((w, x + off, y + off)); st['verse_at'].append(key)

index = defaultdict(list)
for s, st in streams.items():
    for i, (w, _, _) in enumerate(st['words']):
        if len(w) >= 3: index[w].append((s, i))
DF = {w: len(v) for w, v in index.items()}

def clean_slice(t):
    return ''.join(c for c in t if ord(c) not in STRIP_FROM_SLICE)

def score_window(span_words, s, start):
    st = streams[s]['words']
    if start < 0 or start + len(span_words) > len(st): return 0.0
    return sum(sim(sw, st[start + k][0]) for k, sw in enumerate(span_words)) / len(span_words)

def candidates(span_words, limit=4):
    votes = defaultdict(int)
    anchors = sorted(((DF.get(w, 10**9), j, w) for j, w in enumerate(span_words) if len(w) >= 3))[:6]
    for df, j, w in anchors:
        if df > 400: continue
        for (s, i) in index.get(w, ()): votes[(s, i - j)] += 1
    if not votes:
        for df, j, w in anchors[:2]:
            for cand, pos in index.items():
                if sim(cand, w) >= 0.8:
                    for (s, i) in pos: votes[(s, i - j)] += 1
    scored, seen = [], set()
    for (s, start), _ in sorted(votes.items(), key=lambda kv: -kv[1])[:400]:
        for d in (-1, 0, 1):
            k = (s, start + d)
            if k in seen: continue
            seen.add(k)
            scored.append((score_window(span_words, s, start + d), s, start + d))
    scored.sort(reverse=True)
    return scored[:limit]


def span_chars(inner):
    return ''.join(w for (w, _, _) in words_of(inner))

def window_chars(s, start, n):
    st = streams[s]['words']
    if start < 0 or start + n > len(st): return None
    return ''.join(w for (w, _, _) in st[start:start + n])

def boundary_ok(inner, s, start, n):
    """
    The guard v2 lacked, and the one that mattered.

    v2 skipped a span carrying a stray bracket, a digit or a Latin letter. It
    had no answer to the scan MERGING two words into one or SPLITTING one in
    two, which is not any of those things: the span then holds one token too
    few or too many, the window slides by a word, and the replacement deletes a
    word the Shaykh quoted or prepends one he did not. Eight spans went out
    that way in ae6847e -- Q 14:45 lost أنفسهم, Q 12:11 lost لناصحون, Q 7:170
    lost إنّا, Q 9:17 lost وفي.

    Character-level edit distance over the whole span settles it. If any
    neighbouring window -- shifted or extended by a word at either end -- fits
    the scribe's characters better than the chosen one, the alignment is wrong
    and the span is left alone. Tested against those eight: it rejects all of
    them and nothing else.
    """
    target = span_chars(inner)
    if not target: return False
    def d(st, nn):
        w = window_chars(s, st, nn)
        return None if w is None else lev(w, target, cap=max(8, len(target) // 3))
    base = d(start, n)
    if base is None: return False
    for (st, nn) in ((start - 1, n), (start + 1, n), (start, n + 1), (start, n - 1),
                     (start - 1, n + 1), (start, n + 2), (start - 1, n + 2)):
        if nn < 1: continue
        alt = d(st, nn)
        if alt is not None and alt < base: return False
    return True

SPAN_RE = re.compile(r'\(([^()]*)\)|«([^»]*)»', re.S)
MIN_WORDS = 4
ACCEPT_CTX = 0.85      # continuing where the last span left off
ACCEPT_JUMP = 0.93     # landing somewhere else in the muṣḥaf
MARGIN_CTX = 0.08
MARGIN_JUMP = 0.18
CTX_REACH = 300        # words

def skippable(inner):
    if any(ch in FORBIDDEN_IN_SPAN for ch in inner): return 'stray delimiter or digit'
    if re.search(r'[A-Za-z]', inner): return 'latin script'
    if '\ufffd' in inner: return 'replacement character'
    for tok in inner.split():
        if not any(ARABIC(c) for c in tok): return 'non-Arabic token: ' + tok[:12]
    return None

def repair_text(ar, report, lid):
    out, ctx = [], None       # ctx = (sura, end_word_index)
    for m in SPAN_RE.finditer(ar):
        inner = m.group(1) if m.group(1) is not None else m.group(2)
        op, cl = ('(', ')') if m.group(1) is not None else ('«', '»')
        sw = [w for (w, _, _) in words_of(inner)]
        if len(sw) < MIN_WORDS: continue
        why = skippable(inner)
        if why:
            report['skipped'].append((lid, inner.strip()[:50], why)); continue
        cands = candidates(sw)
        if not cands: continue
        best = None
        for (sc, s, start) in cands:
            in_ctx = ctx and s == ctx[0] and 0 <= start - ctx[1] <= CTX_REACH
            need, marg = (ACCEPT_CTX, MARGIN_CTX) if in_ctx else (ACCEPT_JUMP, MARGIN_JUMP)
            rivals = [c[0] for c in cands if (c[1], c[2]) != (s, start)]
            runner = max(rivals) if rivals else 0.0
            if sc >= need and (sc - runner) >= marg:
                best = (sc, s, start, bool(in_ctx)); break
        if not best:
            sc, s, start = cands[0]
            report['unsure'].append((lid, inner.strip()[:50], round(sc, 3)))
            continue
        sc, s, start, in_ctx = best
        if not boundary_ok(inner, s, start, len(sw)):
            report['bounds'].append((lid, inner.strip()[:60], round(sc, 3)))
            continue
        ctx = (s, start + len(sw))
        if sc >= 0.999: continue
        st = streams[s]
        a, b = st['words'][start][1], st['words'][start + len(sw) - 1][2]
        correct = clean_slice(st['text'][a:b])
        vf, vt = st['verse_at'][start], st['verse_at'][start + len(sw) - 1]
        out.append((m.start(), m.end(), op + correct + cl))
        report['fixed'].append((lid, vf if vf == vt else vf + '–' + vt.split(':')[1],
                                round(sc, 3), 'ctx' if in_ctx else 'jump',
                                inner.strip(), correct))
    if not out: return ar, 0
    buf, last = [], 0
    for (a, b, rep) in out:
        buf.append(ar[last:a]); buf.append(rep); last = b
    buf.append(ar[last:])
    return ''.join(buf), len(out)

def main():
    write = '--write' in sys.argv
    only = [a for a in sys.argv[1:] if a.isdigit()]
    rep = {'fixed': [], 'skipped': [], 'unsure': [], 'bounds': []}
    d = REPO + '/src/data/lessons'; total = 0
    for fn in sorted(os.listdir(d)):
        if not fn.endswith('.json'): continue
        L = json.loads(io.open(d + '/' + fn, encoding='utf-8').read())
        if not isinstance(L, dict) or L.get('id', 0) > 56: continue
        if only and str(L['id']) not in only: continue
        key = 'arabicBody' if L.get('arabicBody') else 'arabicText'
        if not L.get(key): continue
        new, n = repair_text(L[key], rep, L['id']); total += n
        if n and write:
            L[key] = new
            io.open(d + '/' + fn, 'w', encoding='utf-8').write(json.dumps(L, ensure_ascii=False))
    print('=== REPAIRED %d spans%s ===' % (total, '' if write else '   (dry run — nothing written)'))
    print('    of which continuing a neighbouring citation: %d ; jumping elsewhere: %d\n'
          % (sum(1 for r in rep['fixed'] if r[3] == 'ctx'), sum(1 for r in rep['fixed'] if r[3] == 'jump')))
    for (lid, v, sc, kind, was, now) in rep['fixed']:
        print('L%-2s %-12s %.2f %s' % (lid, v, sc, kind))
        print('    was: ' + was)
        print('    now: ' + now)
    print('\n=== SKIPPED, span not clean: %d ===' % len(rep['skipped']))
    for r in rep['skipped']: print('L%-2s %-46s %s' % (r[0], r[1], r[2]))
    print('\n=== SKIPPED, window boundary not settled: %d ===' % len(rep['bounds']))
    for r in rep['bounds']: print('L%-2s %.2f  %s' % (r[0], r[2], r[1]))
    print('\n=== SKIPPED, no confident match: %d ===' % len(rep['unsure']))
    for r in rep['unsure']: print('L%-2s %.2f  %s' % (r[0], r[2], r[1]))

main()
