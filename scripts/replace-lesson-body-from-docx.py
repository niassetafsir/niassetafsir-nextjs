#!/usr/bin/env python3
"""
Replace one lesson's arabicBody with the text of its verified .docx.

Lesson 7 was the only one of the seven whose anchors did not all place: 56 of
62. Its stored text agrees with the verified document at 0.952 by normalised
length, the lowest of the seven -- the site's copy is simply older than AK's
corrected one, so six anchors had no matching text to attach to.

WHAT IS DROPPED from the .docx, and why: the first 11 paragraphs are the title
block (work, author, volume, printing), the sūra and lesson headings, the
istiʿādha/basmala invocation and the four-line poem. None carries a footnote
anchor, and none belongs in arabicBody -- the other lessons do not store them
there either, and the reading views filter the poem and basmala out by pattern.
Paragraphs that are nothing but a printed page number are dropped too.

Markers are NOT written here. This only puts the right text in place; run
import-verified-apparatus.py afterwards to place the anchors against it.

  python3 replace_body.py 7           # dry run
  python3 replace_body.py 7 --write
"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract import read_docx, norm_map, strip_all, MARK

SRC   = '/mnt/user-data/uploads/Verified Lessons - Citations Fixed'
REPO  = '/tmp/ntfs'
lesson= int(sys.argv[1])
WRITE = '--write' in sys.argv

path = [os.path.join(SRC, f) for f in os.listdir(SRC)
        if re.search(r'[Ll]esson\s*%d\b' % lesson, f)][0]
text, notes = read_docx(path)
paras = text.split('\n')

lp   = os.path.join(REPO, 'src/data/lessons/%02d.json' % lesson)
data = json.load(open(lp))
old  = data['arabicBody']

# Locate where the stored body begins inside the document, rather than assuming
# a fixed number of front-matter paragraphs.
nb, _ = norm_map(strip_all(old))
head  = nb[:60]
start = 0
for i, p in enumerate(paras):
    n, _ = norm_map(strip_all(p))
    if head and head in n:
        start = i
        break
dropped_front = paras[:start]
assert not any(MARK.findall(p) for p in dropped_front), \
    'front matter carries a footnote anchor -- do not drop it blindly'

kept = [p for p in paras[start:] if not re.fullmatch(r'\s*\d{1,4}\s*', p)]
pagenums = len(paras[start:]) - len(kept)
new = MARK.sub('', '\n'.join(kept))     # markers are placed by the importer

no, _ = norm_map(new)
print('lesson %d' % lesson)
print('  front-matter paragraphs dropped : %d' % len(dropped_front))
print('  page-number paragraphs dropped  : %d' % pagenums)
print('  paragraphs   %d -> %d' % (len(old.split('\n')), len(kept)))
print('  characters   %d -> %d  (%+d)' % (len(old), len(new), len(new) - len(old)))
print('  normalised   %d -> %d  (%+.1f%%)' % (len(nb), len(no), 100 * (len(no) - len(nb)) / len(nb)))
print('  anchors available in the new text: %d' % len(MARK.findall('\n'.join(kept))))
if WRITE:
    data['arabicBody'] = new
    data['footnoteOrder'] = []          # rebuilt by the importer
    json.dump(data, open(lp, 'w'), ensure_ascii=False)
    print('  WRITTEN — now run import-verified-apparatus.py --write')
else:
    print('  dry run — nothing written')
