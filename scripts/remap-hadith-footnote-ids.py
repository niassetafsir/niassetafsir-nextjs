#!/usr/bin/env python3
"""
Re-point the ḥadīth index at the rebuilt footnote ids, and drop the rows whose
lessons are unpublished.

WHY. Rebuilding the apparatus for Lessons 1-7 renumbered their footnote ids:
the old scheme distinguished repeated page numbers (fn-9-1, fn-9-1-2), the new
one runs sequentially through the lesson (fn-9-1 .. fn-9-75). The two schemes
share id *spellings* while meaning different notes, so every one of the 79
ḥadīth rows for Lessons 1-7 silently began pointing at a different footnote.
Nothing errored; the index simply cited the wrong note.

Rows are re-pointed by matching the row's own `snippet` against the new notes'
Arabic, which is what the snippet was cut from. A row that cannot be matched
is dropped rather than left pointing somewhere plausible and wrong.

Rows for Lessons 8-56 are left exactly as they are. They are filtered out at
render time by hasApparatus(), not deleted, so they come back intact when those
lessons are verified.

  python3 remap_hadith.py            # dry run
  python3 remap_hadith.py --write
"""
import json, sys, re, unicodedata
from difflib import SequenceMatcher

REPO='/tmp/ntfs'
VERIFIED={1,2,3,4,5,6,7}
WRITE='--write' in sys.argv

def norm(s):
    s=unicodedata.normalize('NFD', s or '')
    s=''.join(c for c in s if not unicodedata.combining(c))
    s=re.sub(r'[إأآا]','ا',s)
    s=''.join(c for c in s if '؀'<=c<='ۿ' or c==' ')
    return re.sub(r'\s+',' ',s).strip()

h=json.load(open(f'{REPO}/src/data/hadith.json'))
fn=json.load(open(f'{REPO}/src/data/footnotesData.json'))
by_lesson={}
for f in fn:
    by_lesson.setdefault(f['lessonId'],[]).append(f)

out={}
stats={'kept':0,'remapped':0,'unmatched':0,'untouched':0}
for coll, rows in h.items():
    keep=[]
    for r in rows:
        if r['lessonId'] not in VERIFIED:
            stats['untouched']+=1; keep.append(r); continue
        ns=norm(r.get('snippet'))
        best,score=None,0.0
        for f in by_lesson.get(r['lessonId'],[]):
            na=norm(f.get('arabic'))
            if not na or not ns: continue
            sm=SequenceMatcher(None, ns[:200], na[:200])
            if sm.real_quick_ratio()<0.5: continue
            v=sm.ratio()
            if v>score: best,score=f,v
        r=dict(r)
        if best and score>=0.6:
            if best['id']!=r['fnId']: stats['remapped']+=1
            r['fnId']=best['id']
            stats['kept']+=1
        else:
            # No confident match. Null the id rather than leave it pointing at
            # whatever note now happens to carry that spelling; the page renders
            # the citation without a footnote link.
            r['fnId']=None
            stats['unmatched']+=1
        keep.append(r)
    if keep: out[coll]=keep

print('hadith rows for lessons 1-7: %d re-pointed, %d could not be matched (fnId nulled)'
      %(stats['remapped'],stats['unmatched']))
print('rows for lessons 8-56 left untouched: %d'%stats['untouched'])
print('collections: %d -> %d'%(len(h),len(out)))
if WRITE:
    for p in (f'{REPO}/src/data/hadith.json', f'{REPO}/public/data/hadith.json'):
        json.dump(out, open(p,'w'), ensure_ascii=False)
    print('written to src/data/hadith.json and public/data/hadith.json')
else:
    print('dry run — nothing written')
