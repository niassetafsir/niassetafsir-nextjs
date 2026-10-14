#!/usr/bin/env python3
"""A dot at a time, inside a citation the aya already identifies.

scripts/repair-quranic-citations.py replaces a whole span with the mushaf's
text. That is the right instrument where the span is clean, and it is
deliberately cautious: it refuses any span whose best candidate it cannot
confirm from its neighbours, because its v1 substituted five wrong ayat. Run
over Lessons 1-6 it repairs eleven spans and declines a hundred and eighty.

Most of what it declines does not need replacing. It needs a dot. The spans in
these lessons carry the Maghribi-dotting damage this printing's scan produces --

    nafsahu      printed as  namsahu    (mim for fa)
    al-shaytan               al-shaytar (ra for nun)
    am hasibtum              am hasibtumra
    tafaluu                  tamaluu

-- and leaving them is the worse error, because a tafsir whose lemmata are
misspelt is not reporting the Qur'an.

THE WARRANT, AND WHY IT CANNOT PUT THE WRONG VERSE ANYWHERE

This never replaces a span. It aligns the span against one aya word by word and
changes individual letters, so the span it started from is the span it ends
with, one dot different. A misidentified aya cannot overwrite the text; at
worst it fails to match and nothing happens.

A letter changes only where all of these hold:

  * The span and the aya agree on at least 80% of their words, and that aya is
    the best candidate by a clear margin. One aya, not a tie.
  * The two words are the same length and differ at exactly one position.
  * The two letters there share an undotted skeleton -- b/t/th/n/y, j/h/kh,
    d/dh, r/z, s/sh, s/d, t/z, '/gh, f/q, or a final waw read as a ra. That is
    the class the scan gets wrong. A difference outside it is a different word
    and is left alone.
  * The words are not equal once alif, hamza and a final waw or ya are set
    aside. `ibrahim` written plene against the mushaf's defective spelling is
    this printing's orthography, not damage.

The marks on the raw character survive: the substitution is made at the one
character whose folded form is the wrong letter, so the vowels around it are
untouched.

Usage: dry run by default; pass --write to apply. Lesson ids limit it.
Idempotent.

   python3 scripts/repair-citation-dots.py 1 2 3 4 5 6
"""
import json, os, re, sys, unicodedata
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WRITE = '--write' in sys.argv
ONLY = {int(a) for a in sys.argv[1:] if a.isdigit()} or set(range(1, 57))

MARKS = set(range(0x0610, 0x061B)) | set(range(0x064B, 0x0660)) | {0x0670} \
    | set(range(0x06D6, 0x06EE)) | {0x0656, 0x0657, 0x065E}
SUB = {0x06CC: 'ي', 0x0649: 'ي', 0x06D2: 'ي', 0x0626: 'ي',
       0x06A9: 'ك', 0x0629: 'ه', 0x06BE: 'ه', 0x06C1: 'ه',
       0x0622: 'ا', 0x0623: 'ا', 0x0625: 'ا', 0x0671: 'ا',
       0x0624: 'و', 0x0640: ''}

#: Letters this printing's hand leaves the scanner guessing between. Each set is
#: one undotted skeleton.
SKELETONS = [set('بتثني'), set('جحخ'),
             set('دذ'), set('رز'), set('سش'),
             set('صض'), set('طظ'), set('عغ'),
             set('فق'), set('ور')]


def fold_char(c):
    o = ord(c)
    if o in MARKS:
        return ''
    c = SUB.get(o, c)
    if c == '':
        return ''
    return c if 0x0621 <= ord(c) <= 0x064A else ' '


def fold(s):
    return ' '.join(''.join(fold_char(c) for c in
                            unicodedata.normalize('NFKC', s or '')).split())


def same_skeleton(x, y):
    return any(x in g and y in g for g in SKELETONS)


#: Every letter mapped to one representative of its skeleton, so a word and the
#: same word misdotted fold to the same string. This is what makes the aya
#: findable at all: the damage is in the dots, and the skeleton survives it.
SKEL_OF = {}
for _g in SKELETONS:
    _rep = sorted(_g)[0]
    for _c in _g:
        SKEL_OF[_c] = _rep


def skel(w):
    return ''.join(SKEL_OF.get(c, c) for c in w)


def one_letter(a, b):
    """The single index at which equal-length a and b differ, else None."""
    if len(a) != len(b):
        return None
    d = [i for i in range(len(a)) if a[i] != b[i]]
    return d[0] if len(d) == 1 else None


def rasm(w):
    """The word with the letters the two orthographies disagree on removed."""
    for c in 'ءؤئا':
        w = w.replace(c, '')
    while w and w[-1] in 'وي':
        w = w[:-1]
    return w


def raw_fix(raw, a, b, i):
    """Swap the one raw character whose folded form is a[i]; marks untouched."""
    out, k, done = [], 0, False
    for ch in raw:
        f = fold_char(ch)
        if f and not f.isspace():
            if k == i:
                if f != a[i]:
                    return None
                out.append(b[i]); done = True; k += 1
                continue
            k += 1
        out.append(ch)
    return ''.join(out) if (done and k == len(a)) else None


# --- the mushaf -------------------------------------------------------------
verses = json.load(open(os.path.join(ROOT, 'src/data/verse_text.json'), encoding='utf-8'))
AYA = []
for key, v in verses.items():
    w = fold(v['ar'] if isinstance(v, dict) else v).split()
    if w:
        AYA.append((key, w, set(w)))
BYWORD = {}
for n, (key, w, s) in enumerate(AYA):
    for x in s:
        BYWORD.setdefault(skel(x), []).append(n)
COMMON = 500


def best_aya(words):
    """(share, index) of the aya covering most of these words, and the runner-up."""
    seen = Counter()
    for x in {skel(w) for w in words}:
        rows = BYWORD.get(x)
        if not rows or len(rows) > COMMON:
            continue
        for n in rows:
            seen[n] += 1
    scored = []
    for n, _ in seen.most_common(40):
        sk = {skel(x) for x in AYA[n][2]}
        c = sum(1 for x in words if skel(x) in sk) / len(words)
        scored.append((c, n))
    scored.sort(reverse=True)
    if not scored:
        return 0.0, None, 0.0
    runner = scored[1][0] if len(scored) > 1 else 0.0
    return scored[0][0], scored[0][1], runner


#: Citations as the lesson marks them. Mirrors extractSpans in match-verses.js:
#: parentheses and guillemets, and a span carrying a brace or a full stop is not
#: a citation.
SPAN = re.compile(r'\(([^()]{6,400})\)|«([^»]{6,400})»')

total = Counter()
examples = []
for lid in sorted(ONLY):
    path = os.path.join(ROOT, 'src/data/lessons/%02d.json' % lid)
    if not os.path.exists(path):
        continue
    data = json.load(open(path, encoding='utf-8'))
    body = data.get('arabicBody') or ''
    new = body
    for m in SPAN.finditer(body):
        span = m.group(1) or m.group(2)
        if re.search(r'[{}.\[\]0-9]', span):
            continue
        raws = span.split()
        folded = [fold(t) for t in raws]
        words = [f for f in folded if f]
        if len(words) < 4:
            continue
        score, n, runner = best_aya(words)
        if n is None or score < 0.8 or score - runner < 0.08:
            total['span not confidently one aya'] += 1
            continue
        aw = AYA[n][1]
        for pos, (rawtok, f) in enumerate(zip(raws, folded)):
            if not f or f in AYA[n][2]:
                continue
            # the aya word with this one's skeleton, one letter away
            cands = [x for x in aw
                     if skel(x) == skel(f) and one_letter(f, x) is not None]
            if len(cands) != 1:
                total['no single aya word one letter away'] += 1
                continue
            good = cands[0]
            i = one_letter(f, good)
            if not same_skeleton(f[i], good[i]):
                total['the two letters are not one skeleton'] += 1
                continue
            if rasm(f) == rasm(good):
                total["the printing's own orthography"] += 1
                continue
            fixed = raw_fix(rawtok, f, good, i)
            if fixed is None or new.count(rawtok) != 1:
                total['could not place the letter safely'] += 1
                continue
            new = new.replace(rawtok, fixed, 1)
            total['letters corrected'] += 1
            if len(examples) < 40:
                examples.append((lid, AYA[n][0], f, good))
    if WRITE and new != body:
        data['arabicBody'] = new
        json.dump(data, open(path, 'w', encoding='utf-8'), ensure_ascii=False)

for k, v in total.most_common():
    print('%6d  %s' % (v, k))
print()
for lid, key, a, b in examples:
    print('   L%-2d Q %-9s %s  ->  %s' % (lid, key, a, b))
print('\n%s' % ('written' if WRITE else 'dry run -- pass --write'))
