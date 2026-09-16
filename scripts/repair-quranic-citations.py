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


# A bare ص is not a word in Arabic. It stands for مِن. 542 at the time it was
# first counted, 420 once the citation passes had taken their share. Reported by Imam Abdul
# Latif from Q 11:6 in Lesson 25: ( وَمَا صِ دَآبَّةٍ فِي الأَرْضِ … ).
#
# These spans scored below threshold because a one-letter token against a
# two-letter word is a large relative edit distance. The fix is not to relax the
# threshold — it is to offer the hypothesis and let the muṣḥaf refuse it. The
# substitution is used ONLY for scoring; the replacement text is sliced from the
# verse as always. Note what this does NOT do: span_chars() hypothesises too, so
# boundary_ok() compares مِن against the muṣḥaf rather than ص. It checks
# alignment, never the hypothesis itself. A في at that position would cost two
# edits inside the cap and pass unremarked. The hypothesis held for all 127
# instances audited -- but that audit covered ص ALONE. م, س and ي were added
# later on the survey's evidence and a 50-span audit of one batch, which is a
# weaker warrant. The hypothesis holds empirically, never by construction, and
# any new entry needs its own check.
SCAN_HYPOTHESES = {
    # A survey of every bare letter in the corpus (2,079 of them) found مِن
    # flattened three different ways and فِي a fourth. Counts are total
    # instances, citations and prose together:
    'ص': 'من',   # 420 — the one Imam Abdul Latif reported, from Q 11:6
    'م': 'من',   # 561 — مِ قَبْلِكُمْ, مِ رَبِّهِ, مِ السَّمَآءِ
    'س': 'من',   # 31  — (س شَعَائِرِ اللَّهِ), (س الْخَاسِرِينَ)
    'ي': 'في',   # 74  — (ي أَيَّامٍ مَعْدُودَاتٍ)
    #
    # NOT here, and not to be added:
    #   و (532) is the compiler's own convention, not damage — و(الرَّحِيمِ),
    #     and above all `وَ) اذكر (`, 52 times, where the wāw of the āya sits
    #     outside the bracket and the gloss follows.
    #   ج (14) is juzʾ in a bibliographic citation: ابن كثير ج ١/٣٦١.
    #   ه، ن، ا، ل each hide more than one word — one ه in Lesson 2 is Jibrīl
    #     naming a letter to the Prophet — and wait on AK's reading.
}

def hypothesise(w):
    return SCAN_HYPOTHESES.get(w, w)

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
    return ''.join(hypothesise(w) for (w, _, _) in words_of(inner))

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
                     (start - 1, n + 1), (start, n + 2), (start - 1, n + 2),
                     # (+1, -1) is the one that catches a lemma the scribe has
                     # already quoted and glossed being prepended a second time:
                     # L27's أولياء, L28's موسى. Without it all four got through.
                     (start + 1, n - 1), (start + 2, n), (start - 1, n - 1), (start, n - 2)):
        if nn < 1: continue
        alt = d(st, nn)
        if alt is not None and alt < base: return False
    return True


RANGE_RE = re.compile(r'(\d+)\s*:\s*(\d+)\s*[–\-—]\s*(?:(\d+)\s*:\s*)?(\d+)')

def declared_scope(lesson):
    """
    The lesson's own declared verse range, as a weak prior.

    A lesson's FIRST citation has no neighbour to continue from, so it faced the
    0.93 jump bar and lost: Q 11:6 opening Lesson 25 scored 0.91 and was left as
    ( وَمَا صِ دَآبَّةٍ … ), which is what Imam Abdul Latif reported. But a lesson
    declared "Q. 11:6–83" IS evidence about where its citations fall. Landing
    inside the declared range counts as context — the same 0.85 bar a neighbour
    would give, no lower.

    Deliberately a prior and not a filter: the metadata is not reliable
    everywhere (lesson 35 is declared Q 23–24 while its body commentates
    Q 17:90–109), so a citation outside the declared range is not rejected, it
    simply gets no help.
    """
    m = RANGE_RE.search(str(lesson.get('verseRange') or ''))
    if not m: return None
    s1, a1, s2, a2 = m.group(1), m.group(2), m.group(3), m.group(4)
    return (int(s1), int(a1), int(s2 or s1), int(a2))

def in_declared(scope, key):
    if not scope: return False
    su, ay = (int(x) for x in key.split(':'))
    s1, a1, s2, a2 = scope
    if su < s1 or su > s2: return False
    if su == s1 and ay < a1: return False
    if su == s2 and ay > a2: return False
    return True


def looks_scanned(inner):
    """
    Scanned muṣḥaf text carries ḥarakāt; typed prose does not.

    L15 quotes Q 5:116 twice — once as the lecturer's own unvocalised words
    inside his sentence, once as the scanned lemma two clauses later. The
    matcher preferred the clean typed one and rewrote it into full Warsh
    orthography, leaving two differently-dressed copies of the same āya three
    lines apart and leaving the actually damaged lemma alone. Density settles
    it: every genuinely scanned span in the corpus runs above 0.5 marks per
    letter; that one ran 0.02.
    """
    letters = sum(1 for c in inner if '\u0620' <= c <= '\u064A')
    marks = sum(1 for c in inner if ord(c) in MARKS)
    if letters < 8: return True
    return marks / letters >= 0.15

# Spans held back by hand, with the reason, because no general rule reaches them.
HAND_EXCLUDED = {
    # The scribe split وَيَوْمَ across his own gloss — (… المحضرين وَ) اذكر
    # (يَوْمَ يُنَادِيهِمْ …) — exactly as Jalālayn does. Restoring the wāw to the
    # second half would print it twice.
    (38, '28:62–63'),
}

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

def repair_text(ar, report, lid, scope=None):
    out, ctx = [], None       # ctx = (sura, end_word_index)
    for m in SPAN_RE.finditer(ar):
        inner = m.group(1) if m.group(1) is not None else m.group(2)
        op, cl = ('(', ')') if m.group(1) is not None else ('«', '»')
        sw = [hypothesise(w) for (w, _, _) in words_of(inner)]
        if len(sw) < MIN_WORDS: continue
        if not looks_scanned(inner):
            report['skipped'].append((lid, inner.strip()[:50], 'typed prose, not a scanned lemma')); continue
        why = skippable(inner)
        if why:
            report['skipped'].append((lid, inner.strip()[:50], why)); continue
        cands = candidates(sw)
        if not cands: continue
        best = None
        for (sc, s, start) in cands:
            # A window opening BEHIND where the last citation closed means the
            # lemma is being quoted twice -- L4's وما, L38's ويوم. The declared
            # range must not override that; it is a weaker signal than the
            # neighbour it would be contradicting.
            if ctx and s == ctx[0] and start < ctx[1]:
                continue
            in_ctx = (ctx and s == ctx[0] and 0 <= start - ctx[1] <= CTX_REACH) \
                     or in_declared(scope, streams[s]['verse_at'][start])
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
        label = vf if vf == vt else vf + '–' + vt.split(':')[1]
        if (lid, label) in HAND_EXCLUDED:
            report['skipped'].append((lid, inner.strip()[:50], 'held by hand — see HAND_EXCLUDED')); continue
        out.append((m.start(), m.end(), op + correct + cl))
        report['fixed'].append((lid, label,
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
        new, n = repair_text(L[key], rep, L['id'], declared_scope(L)); total += n
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
