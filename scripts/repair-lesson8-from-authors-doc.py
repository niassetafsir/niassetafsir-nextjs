#!/usr/bin/env python3
"""Seventeen words in Lesson 8, corrected by AK's own Google Doc of the lesson.

WHERE THE CORRECTIONS COME FROM

AK keeps a Google Doc per lesson on his Drive and has been reading the first
eight against the printing. Exporting those Docs and diffing them against
src/data/lessons/*.json gives 877 one-for-one word disagreements across
Lessons 1-8. Nearly all of them go the other way: the site's word is an Arabic
word and the Doc's is not --

    al-rahman   in the Doc as  al-rahmal   (lam for nun)
    layaqulanna                layafulanna (fa for qaf)
    kafaru                     kabaru      (ba for fa)
    qulubuhum                  fulubuhum   (fa for qaf)

-- which is the same Maghribi-dotting scan damage scripts/ocr-* has been
clearing out of the site text since August. The Docs have not had that pass.
Lesson by lesson, the count of disagreements the site wins is 8, 20, 44, 60,
118, 90, 40 for Lessons 1-7, and the count the Doc wins is zero. Importing
those bodies would undo the repair programme.

Lesson 8 is the exception. Its text reached the site latest and is the least
repaired, and there the Doc wins 17 times.

THE WARRANT

A row exists only where all four hold:

  * The disagreement is one site word against one Doc word, inside context
    that is word-for-word identical on both sides. Same sentence, one word.
  * The Doc's word is attested: it stands in the mushaf, or at least three
    times in Lessons 9-56, which the Docs had no hand in.
  * The site's word is attested by neither. It is not a word.
  * The two are within two edits of each other, so this repairs a scan rather
    than substituting a different word.

Alif, hamza and a final waw or ya are set aside before the edit distance is
measured: `ibrahim` written with the alif the mushaf omits is this printing's
orthography, not damage, and 24 of the 418 both-attested disagreements are
exactly that. None of them becomes a row.

Usage: dry run by default; pass --write to apply. Idempotent.

   python3 scripts/repair-lesson8-from-authors-doc.py
"""
import json, re, sys, unicodedata, glob, os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LESSONS = ROOT / 'src' / 'data' / 'lessons'
WRITE = '--write' in sys.argv
DOCS = Path(os.path.expanduser('~/work/drive/x'))

MARKS = set(range(0x0610, 0x061B)) | set(range(0x064B, 0x0660)) | {0x0670} \
    | set(range(0x06D6, 0x06EE)) | {0x0656, 0x0657, 0x065E}
SUB = {0x06CC: 'ي', 0x0649: 'ي', 0x06D2: 'ي', 0x0626: 'ي',
       0x06A9: 'ك', 0x0629: 'ه', 0x06BE: 'ه', 0x06C1: 'ه',
       0x0622: 'ا', 0x0623: 'ا', 0x0625: 'ا', 0x0671: 'ا',
       0x0624: 'و', 0x0640: ''}


def fold_char(c):
    o = ord(c)
    if o in MARKS:
        return ''
    c = SUB.get(o, c)
    if c == '':
        return ''
    return c if 0x0621 <= ord(c) <= 0x064A else ' '


def fold(s):
    out = ''.join(fold_char(c) for c in unicodedata.normalize('NFKC', s or ''))
    return ' '.join(out.split())


def rasm(w):
    """The word with this printing's optional letters set aside."""
    for c in 'ءؤئا':
        w = w.replace(c, '')
    while w and w[-1] in 'وي':
        w = w[:-1]
    return w


def edits(a, b):
    """Levenshtein distance, small strings."""
    prev = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        cur = [i]
        for j, y in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x != y)))
        prev = cur
    return prev[-1]


# --- what counts as a word ----------------------------------------------------
verses = json.loads((ROOT / 'src/data/verse_text.json').read_text('utf-8'))
MUSHAF = set()
for v in verses.values():
    MUSHAF.update(fold(v['ar'] if isinstance(v, dict) else v).split())

CORPUS = {}
for p in sorted(glob.glob(str(LESSONS / '*.json'))):
    m = re.fullmatch(r'(\d\d)\.json', os.path.basename(p))
    if not m or int(m.group(1)) < 9:
        continue
    for w in fold(json.loads(Path(p).read_text('utf-8')).get('arabicBody') or '').split():
        CORPUS[w] = CORPUS.get(w, 0) + 1

def attested(w):
    return w in MUSHAF or CORPUS.get(w, 0) >= 3


# --- the raw tokens of a lesson, with their folded forms ----------------------
def tokens(body):
    """(raw token, folded token) for every whitespace-separated token that
    folds to exactly one word. A token that folds to nothing or to several
    words is skipped, so an index into this list always names one raw token."""
    out = []
    for t in body.split():
        f = fold(t).split()
        if len(f) == 1:
            out.append((t, f[0]))
    return out


import difflib

LESSON = 8
path = LESSONS / f'{LESSON:02d}.json'
lesson = json.loads(path.read_text('utf-8'))
body = lesson['arabicBody']
site = tokens(body)
doc = tokens((DOCS / f'L{LESSON:02d}.body.txt').read_text('utf-8'))

sw = [f for _, f in site]
dw = [f for _, f in doc]

rows, refused = [], {}
def refuse(k):
    refused[k] = refused.get(k, 0) + 1

for t, i1, i2, j1, j2 in difflib.SequenceMatcher(None, sw, dw, autojunk=False).get_opcodes():
    if t != 'replace' or i2 - i1 != 1 or j2 - j1 != 1:
        continue
    a, b = sw[i1], dw[j1]
    if attested(a):
        refuse('the site word is a word; the disagreement is not damage to repair')
        continue
    if not attested(b):
        refuse('neither word is attested')
        continue
    if rasm(a) == rasm(b):
        refuse("the printing's own orthography, not damage")
        continue
    if edits(a, b) > 2:
        refuse('too far apart to be one scan of the other')
        continue
    rows.append((i1, site[i1][0], a, b))

print(f'{len(rows)} word(s) in Lesson {LESSON} that AK\'s Doc repairs')
for i, raw, a, b in rows:
    print(f'   {a}  ->  {b}')
if refused:
    print('refused:')
    for k, n in sorted(refused.items(), key=lambda kv: -kv[1]):
        print(f'   {n:4d}  {k}')


def raw_fix(raw, a, b):
    """Rewrite the raw token so it folds to b, keeping every mark that sits
    on a letter the two words share. Only safe where the letters line up
    one-for-one; otherwise the marks cannot be placed and the row is dropped."""
    if len(a) != len(b):
        return None
    out, k = [], 0
    for c in raw:
        f = fold_char(c)
        if f and not f.isspace():
            if k >= len(a) or f != a[k]:
                return None
            out.append(b[k] if a[k] != b[k] else c)
            k += 1
        else:
            out.append(c)
    return ''.join(out) if k == len(a) else None


applied, skipped = 0, {}
new_body = body
for i, raw, a, b in rows:
    fixed = raw_fix(raw, a, b)
    if fixed is None:
        skipped.setdefault('the letters do not line up, so the marks cannot be carried over', []).append(f'{a} -> {b}')
        continue
    if new_body.count(raw) != 1:
        skipped.setdefault('that spelling occurs more than once in the lesson', []).append(f'{a} -> {b}')
        continue
    new_body = new_body.replace(raw, fixed, 1)
    applied += 1

print(f'\n{applied} written' if WRITE else f'\n{applied} ready to write')
for k, v in skipped.items():
    print(f'   left for you: {len(v)}: {k}')
    for x in v:
        print(f'      {x}')

if WRITE and applied:
    lesson['arabicBody'] = new_body
    path.write_text(json.dumps(lesson, ensure_ascii=False), 'utf-8')
    print(f'wrote {path.name}')
elif not WRITE:
    print('(dry run -- pass --write)')
