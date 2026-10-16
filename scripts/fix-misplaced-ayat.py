# -*- coding: utf-8 -*-
"""
Repair the ten citations that the earlier Quranic repair passes got wrong.

Why these went wrong
--------------------
The earlier passes scored a candidate verse by string similarity and then
confirmed it against the verses the translators cited SOMEWHERE IN THE SAME
LESSON. That test is lesson-scoped, not position-scoped. Lesson 5 runs
continuously through Surat al-Baqara and cites verses from other suras
besides, so a candidate sharing a partial string with a damaged span could
satisfy the witness test while belonging nowhere near that position.
'yamutuna wa-hum kuffar' (Q 4:18) against 'wa-matu wa-hum kuffar' (Q 2:161)
is the bug in one line.

Two consequences, both repaired here:

  A. Five spans received an entirely different verse. The Jalalayn gloss
     stayed put while the lemma it glosses was swapped out from under it. In
     three of the five the repair also swallowed Niasse's own gloss, which is
     restored below from the pre-repair text.

  B. Five spans received the right words in the wrong positional form. The
     folding function that made matching possible deletes the alif-wasl and
     hamza marks (U+08F0-08FF, U+0670 and friends) - exactly the orthography
     a Warsh edition exists to preserve. A verse-initial 'am' was therefore
     written with the hamza form it carries mid-verse elsewhere, and so on.

Mechanics: every span is located by the EXACT string the audit extracted from
the lesson file, never by retyped Arabic - the fold that finds these spans
also erases the marks under correction, and typed Arabic does not survive it.
Replacements are assembled verbatim from src/data/verse_text.json (Warsh);
restored glosses are verbatim from the pre-repair text at 9bc5a21.
"""
import io, json, os, sys

REPO = os.environ['REPO']
ANCHORS = os.environ['ANCHORS']
V = json.load(io.open(REPO + '/src/data/verse_text.json', encoding='utf-8'))
def vt(k):
    e = V[k]
    return e['ar'] if isinstance(e, dict) else e
def w(k, a, b):
    return ' '.join(vt(k).split()[a:b])

A = {}
for r in json.load(io.open(ANCHORS, encoding='utf-8')):
    A[(r['L'], r['pa'], tuple(r['verses']))] = r['span']

# (lesson, para, verses that locate the bad span, class, replacement, note)
FIX = [
 (2, 10, ('7:56',), 'B', w('2:11', 3, 7),
  'Q 7:56 form for Q 2:11; the waw already stands in wa-idha qila lahum'),

 (2, 12, ('2:175',), 'B', w('2:16', 0, 5),
  'Q 2:175 wasl form for Q 2:16; fa-ma rabihat tijaratuhum follows'),

 (5, 15, ('2:259',), 'B', ' '.join(vt('2:109').split()[-6:]),
  'Q 2:259 form for the close of Q 2:109, which hatta yati Allah precedes'),

 (5, 18, ('14:29', '14:30'), 'A', w('2:112', 1, 5),
  'Q 14:29-30 displaced Q 2:112; the glosses on aslama and wajhahu stayed put'),

 (5, 59, ('12:3',), 'A', w('2:130', 14, 18),
  'Q 12:3 displaced Q 2:130; the gloss al-darajat al-ula stayed put'),

 (5, 95, ('2:184',), 'A',
  w('2:158', 17, 20) + ') أكثر من ذلك (' + w('2:158', 20, 24) + ' ' + w('2:159', 0, 3),
  'Q 2:184 displaced Q 2:158; restores Niasse gloss akthar min dhalik and the Q 2:159 lemma'),

 (5, 97, ('4:146',), 'B', w('2:160', 0, 4),
  'Q 4:146 wasl form for Q 2:160'),

 (5, 118, ('2:216', '2:217'), 'A', w('2:193', 10, 15) + ' ' + w('2:194', 0, 2),
  'Q 2:216-217 displaced the close of Q 2:193 and the opening of Q 2:194'),

 (6, 18, ('3:142',), 'B', w('2:214', 0, 5),
  'Q 3:142 form for Q 2:214'),

 (8, 12, ('8:32', '8:33'), 'A',
  w('3:21', -2, None) + ') مؤلم، وذكر البشارة هنا تهكم (' + w('3:22', 0, 4),
  'Q 8:32-33 displaced Q 3:22; restores the mulim gloss and the tahakkum remark'),
]

DRY = '--write' not in sys.argv
applied, failed = [], []

for L in range(1, 9):
    jobs = [f for f in FIX if f[0] == L]
    if not jobs: continue
    path = REPO + '/src/data/lessons/%02d.json' % L
    d = json.load(io.open(path, encoding='utf-8'))
    paras = d['arabicBody'].split('\n')
    idx = [i for i, p in enumerate(paras) if p.strip()]
    changed = False

    for (_, pa, vs, cls, rep, note) in jobs:
        span = A.get((L, pa, vs))
        if span is None:
            failed.append((cls, L, pa, note, 'no anchor')); continue
        i = idx[pa - 1]
        n = paras[i].count(span)
        if n != 1:
            failed.append((cls, L, pa, note, 'anchor occurs %d times' % n)); continue
        paras[i] = paras[i].replace(span, rep)
        changed = True
        applied.append((cls, L, pa, note, span, rep))

    if changed and not DRY:
        d['arabicBody'] = '\n'.join(paras)
        io.open(path, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False))

print('DRY RUN' if DRY else 'WRITTEN')
print('applied %d of %d' % (len(applied), len(FIX)))
for cls, L, pa, note, span, rep in applied:
    print('\n  %s  L%d para %d  %s' % (cls, L, pa, note))
    print('      was: ' + span[:160])
    print('      now: ' + rep[:160])
if failed:
    print('\nFAILED %d:' % len(failed))
    for cls, L, pa, note, why in failed:
        print('  %s  L%d para %-4d %s  (%s)' % (cls, L, pa, note, why))
    sys.exit(1)
