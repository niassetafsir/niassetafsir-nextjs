# -*- coding: utf-8 -*-
"""
Render the verbatim English of the translated lessons into englishText.

Which lessons, and from which draft, are given on the command line:

    REPO=$PWD python3 scripts/render-english.py --lessons 9 --write

so that rendering a newly translated lesson does not rewrite the ones already
on the site.

The four registers of the approved typography map onto the site's existing
en-para markup:

    q  Quranic lemma            <strong>, no quotation marks
    h  hadith / named authority plain roman; the text already carries its
                                own double quotation marks
    p  Niasse's prose           plain roman
    i  transliteration          <em>

Runs carry no separators of their own, so they are joined with a single
space; nothing is repunctuated. A verbatim edition keeps the sentences the
printed page breaks cut in half, so many paragraphs legitimately begin and
end mid-clause.

This REPLACES the older English on lessons 1-5, which was a different and
much freer rendering, partial from Lesson 3 on, and in places fuller than
the Arabic it translates.
"""
import io, json, os, re, sys, html

REPO = os.environ['REPO']
def arg(flag, default):
    return sys.argv[sys.argv.index(flag) + 1] if flag in sys.argv else default

SRC = REPO + '/translation-drafts/' + arg('--draft', 'lessons-1-9-english.json')
EN = json.load(io.open(SRC, encoding='utf-8'))
LESSONS = [int(x) for x in arg('--lessons', '1-8').replace('-', ' ').split()] \
          if '-' in arg('--lessons', '1-8') else [int(x) for x in arg('--lessons', '1-8').split(',')]
if len(LESSONS) == 2 and '-' in arg('--lessons', '1-8'):
    LESSONS = list(range(LESSONS[0], LESSONS[1] + 1))

def esc(t):
    return html.escape(t, quote=True).replace('&#x27;', '&#x27;')

def render_para(runs):
    out = []
    for t, k in runs:
        t = t.strip()
        if not t: continue
        e = esc(t)
        if k == 'q':   out.append('<strong>' + e + '</strong>')
        elif k == 'i': out.append('<em>' + e + '</em>')
        else:          out.append(e)
    # Join on the same rule the manuscript build uses, so the site and the
    # Word files agree. An unconditional ' '.join put a space before every
    # comma, period and closing guillemet that began its own run.
    NO_SPACE_BEFORE = set(',.;:?!)]}\u00bb\u201d\u2019%\u2026')
    NO_SPACE_AFTER  = set('([{\u00ab\u201c\u2018')
    def visible(piece, first):
        t = re.sub('<[^>]+>', '', piece)
        t = html.unescape(t)
        if not t: return ''
        return t[0] if first else t[-1]
    s = ''
    for i, piece in enumerate(out):
        if i:
            nxt = visible(piece, True)
            prv = visible(s, False)
            if nxt not in NO_SPACE_BEFORE and prv not in NO_SPACE_AFTER:
                s += ' '
        s += piece
    s = re.sub(r'\s+', ' ', s).strip()
    return s

DRY = '--write' not in sys.argv
rows = []
for L in LESSONS:
    key = str(L)
    paras = EN[key]['paragraphs']
    blocks = []
    for p in paras:
        body = render_para(p['runs'])
        if not body: continue
        blocks.append('<p class="en-para">' + body + '</p>')
    text = '\n'.join(blocks)
    path = REPO + '/src/data/lessons/%02d.json' % L
    d = json.load(io.open(path, encoding='utf-8'))
    ar = len([x for x in d['arabicBody'].split('\n') if x.strip()])
    live = sum(1 for x in paras if any(t.strip() for t, _ in x['runs']))
    rows.append((L, ar, live, len(blocks), len(text),
                 len(re.sub('<[^>]+>', '', text).split())))
    if not DRY:
        d['englishText'] = text
        d['hasEnglish'] = True
        io.open(path, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False))

print('DRY RUN' if DRY else 'WRITTEN')
print('%-3s %-10s %-10s %-10s %-10s %s' % ('L', 'ar paras', 'en paras', 'rendered', 'chars', 'en words'))
for L, ar, en, bl, ch, wd in rows:
    flag = '' if ar == en == bl else '   <-- MISMATCH'
    print('%-3d %-10d %-10d %-10d %-10d %d%s' % (L, ar, en, bl, ch, wd, flag))
print('\ntotal rendered paragraphs %d, English words %d'
      % (sum(r[3] for r in rows), sum(r[5] for r in rows)))
