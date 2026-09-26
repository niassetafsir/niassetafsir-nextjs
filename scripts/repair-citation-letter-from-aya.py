#!/usr/bin/env python3
"""One scanned letter, corrected by the aya the passage is quoting.

The 2,989 unplaced citation spans are not, as the worklist had it, material the
matcher cannot recognise. Most of the ones that run to four words or more are
Qur'anic quotations that miss standing in their aya by a single letter:

    alladhina  printed as  alladhira   (ra for nun)
    anfusahum              anmusahum   (mim for fa)
    kafaru                 kabaru      (ba for fa)
    musrifun               musrijun    (jim for fa)

Sixty-three of the letters are a fa read as something else, which is the
Maghribi dotting this printing uses and OCR trained on Mashriqi forms mangles;
seventeen more are a nun read as a ra.

THE WARRANT

A row exists only where the aya settles it, and the test is the strong one: the
corrected span must stand VERBATIM inside exactly ONE aya of the whole mushaf.
Not "closest", not "most words shared" -- the corrected text is attested by one
verse and no other. A correction that leaves the span matching two ayat, or
none, is refused.

WHAT IS REFUSED, AND WHY

  * A difference that is the printing's own orthography rather than damage.
    The alif written plene where the mushaf writes it superscript, and the sila
    waw of `innahu` -> `innahuu` and `anhum` -> `anhumuu`, belong to this
    riwaya. Correcting them would damage the edition, not repair it. Words that
    are equal once alif, hamza and a final waw or ya are set aside never become
    rows.
  * A one- or two-letter word. `m` against `min` is a span that begins mid-word,
    not a scan that lost a letter.
  * Any site where a second substitution also makes the span stand in an aya.

Fold to compare; substitute on the raw characters. The substitution is made at
the raw character whose folded form is the wrong letter, so the vowels and
marks around it survive untouched.

Usage: dry run by default; pass --write to apply. Idempotent.
Sites are named by content, not by offset: see scripts/repair_anchors.py.
"""
import json, sys, unicodedata
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
LESSONS = ROOT / 'src' / 'data' / 'lessons'
WRITE = '--write' in sys.argv

MARKS = set(range(0x0610, 0x061B)) | set(range(0x064B, 0x0660)) | {0x0670} \
    | set(range(0x06D6, 0x06EE)) | {0x0656, 0x0657, 0x065E}
ALIFS = {0x0622, 0x0623, 0x0625, 0x0671}
LETTER = lambda c: 0x0621 <= ord(c) <= 0x064A


def fold_char(c):
    """The folded form of one raw character, or '' if it folds away."""
    o = ord(c)
    if o in MARKS:
        return ''
    if o in ALIFS:
        return 'ا'
    if o == 0x0649:
        return 'ي'
    if o == 0x0629:
        return 'ه'
    if LETTER(c):
        return c
    return ' ' if c.isspace() else ' '


def fold(s):
    out = ''.join(fold_char(c) for c in unicodedata.normalize('NFC', s or ''))
    return ' '.join(out.split())


def rasm(w):
    """The word with the printing's own optional letters set aside."""
    w = w.replace('ء', '').replace('ؤ', '').replace('ئ', '').replace('ا', '')
    while w and w[-1] in 'وي':
        w = w[:-1]
    return w


def lev1_index(a, b):
    """The single position at which equal-length a and b differ, else None."""
    if len(a) != len(b):
        return None
    diff = [i for i in range(len(a)) if a[i] != b[i]]
    return diff[0] if len(diff) == 1 else None


# --- the mushaf, folded once -------------------------------------------------
verses = json.loads((ROOT / 'src/data/verse_text.json').read_text('utf-8'))
AYA = {}
for key, v in verses.items():
    text = v['ar'] if isinstance(v, dict) else v
    AYA[key] = fold(text)
AYA_ITEMS = list(AYA.items())

word_index = {}
for key, text in AYA_ITEMS:
    for w in set(text.split()):
        word_index.setdefault(w, []).append(key)
COMMON = 400


def ayat_sharing(words):
    seen = Counter()
    for w in set(words):
        rows = word_index.get(w)
        if not rows or len(rows) > COMMON:
            continue
        for k in rows:
            seen[k] += 1
    return [k for k, _ in seen.most_common(40)]


def stands_in(folded_span):
    """Every aya that holds this folded span verbatim."""
    return [k for k, t in AYA_ITEMS if folded_span in t]


# --- the spans the site cannot place ----------------------------------------
report = json.loads((ROOT / 'translation-drafts/verse-match-report.json').read_text('utf-8'))
status = json.loads((ROOT / 'src/data/verseCitationStatus.json').read_text('utf-8'))

candidates = []          # (lesson, paraIndex, spanIndex, span text, bad, good, aya)
refused = Counter()

for lesson_id, paras in status.items():
    spans = {(s['paraIndex'], s['spanIndex']): s for s in report.get(lesson_id, {}).get('spans', [])}
    for para, by_span in paras.items():
        for span, value in by_span.items():
            state = value.get('status') if isinstance(value, dict) else value
            if state != 'unplaced':
                continue
            src = spans.get((int(para), int(span)))
            if not src:
                continue
            folded = fold(src['text'])
            sw = folded.split()
            if len(sw) < 4:
                continue

            found = []
            for key in ayat_sharing(sw):
                aw = AYA[key].split()
                missing = [w for w in sw if w not in aw]
                if len(missing) != 1:
                    continue
                bad = missing[0]
                if len(bad) < 3:
                    refused['the span starts or ends mid-word'] += 1
                    continue
                fixes = [a for a in aw if lev1_index(bad, a) is not None]
                if len(fixes) != 1:
                    continue
                good = fixes[0]
                j = lev1_index(bad, good)
                # The mushaf text carries tatweel in places; folding keeps it,
                # so a "correction" can come out as a stretch mark. Both sides
                # of the substitution must be letters.
                if not (LETTER(bad[j]) and LETTER(good[j])) or '\u0640' in (bad + good):
                    refused['the substitution is not letter for letter'] += 1
                    continue
                if rasm(bad) == rasm(good):
                    refused["the printing's own orthography, not damage"] += 1
                    continue
                corrected = folded.replace(bad, good)
                hits = stands_in(corrected)
                if len(hits) == 1 and hits[0] == key:
                    found.append((bad, good, key))

            if not found:
                continue
            if len({(b, g) for b, g, _ in found}) > 1:
                refused['more than one correction makes it stand'] += 1
                continue
            bad, good, key = found[0]
            candidates.append((int(lesson_id), int(para), int(span), src['text'], bad, good, key))

print(f'{len(candidates)} site(s) where one letter, taken from the aya, makes the span stand in it')
classes = Counter()
for _, _, _, _, bad, good, _ in candidates:
    i = lev1_index(bad, good)
    if i is not None:
        classes[f'{bad[i]} -> {good[i]}'] += 1
for k, n in classes.most_common(12):
    print(f'   {n:3d}  {k}')
if refused:
    print('refused:')
    for k, n in refused.most_common():
        print(f'   {n:3d}  {k}')

# --- apply -------------------------------------------------------------------
def raw_fix(raw_word, bad, good):
    """Replace the raw character whose folded form is the wrong letter."""
    i = lev1_index(bad, good)
    if i is None:
        return None
    seen = 0
    out = []
    done = False
    for c in raw_word:
        f = fold_char(c)
        if f and not f.isspace():
            if seen == i:
                if f != bad[i]:
                    return None
                out.append(good[i])
                done = True
                seen += 1
                continue
            seen += 1
        out.append(c)
    return ''.join(out) if done else None


applied = 0
skipped = Counter()
for lesson_id, para, span, span_text, bad, good, key in candidates:
    path = LESSONS / f'{lesson_id:02d}.json'
    lesson = json.loads(path.read_text('utf-8'))
    body = lesson.get('arabicBody') or ''
    paragraphs = [p for p in body.split('\n') if p.strip()]
    # The raw words in the whole lesson that fold to the damaged word.
    targets = [w for w in body.split() if fold(w).strip() == bad]
    if len(set(targets)) != 1:
        skipped['the damaged word is spelled several ways in this lesson'] += 1
        continue
    raw_word = targets[0]
    if body.count(raw_word) != 1:
        skipped['the damaged word occurs more than once in this lesson'] += 1
        continue
    fixed = raw_fix(raw_word, bad, good)
    if not fixed:
        skipped['the raw word does not carry the letter where the fold says'] += 1
        continue
    if WRITE:
        # No anchor is minted here because none is needed: the guards above
        # have already established that this exact raw spelling occurs once in
        # the whole lesson, which names the place more tightly than a
        # neighbourhood would. Once the letter is corrected the damaged
        # spelling is gone, so a second run finds nothing to do.
        lesson['arabicBody'] = body.replace(raw_word, fixed, 1)
        path.write_text(json.dumps(lesson, ensure_ascii=False), 'utf-8')
    applied += 1

print(f'\n{applied} site(s) {"written" if WRITE else "ready to write"}')
if skipped:
    for k, n in skipped.most_common():
        print(f'   skipped {n}: {k}')
if not WRITE:
    print('(dry run -- pass --write)')
