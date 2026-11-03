# -*- coding: utf-8 -*-
"""Lift the Arabic edition's own notes out of the body.

The Majma al-Yamama printing's footnote apparatus bled into the body text of
the transcription in a dozen places, and the drafts translated it as if it
were Niasse speaking. Those passages are the printing's editor, not the
author: note numbers, source loci with volume and page, an imprint. They are
removed here. Every one is recorded, with its Arabic, in the accompanying
list, so nothing is lost.

Paragraph slots are kept so that the numbering still runs one-to-one with the
Arabic. A slot left empty does not print.
"""
import json, io, sys
SRC='/home/claude/merged-1-8-english.json'
WRITE='--write' in sys.argv
d=json.load(io.open(SRC,encoding='utf-8'))

# whole paragraphs that are the printing's apparatus
EMPTY=[
 (6,3,  'Two hadith variants with their isnads, quoted matter of the Tafsir al-Tabari note that follows at para 4; it interrupts the sentence running from para 2 to para 5'),
 (6,4,  'قسيم الطبري: الفرقان / … تفسير الطبري / سورة الفرقان / … .. الآية — a source locus, twice over'),
 (6,12, '2 - راجع القرطبي في تفسيره الجامع لأحكام القرآن ج3/ ص20 — note 2, numbered'),
 (8,7,  '1 - قد ورد تخصيص هذا الوقت في الحديث — note 1, numbered; supplies the note [1] missing from Lesson Eight'),
 (8,23, 'قام وبطنه معصوب بحجر … .. الحديث — a note on the hunger at the Trench; likely the note [12] missing from Lesson Eight'),
 (8,44, 'وقد أورد البيتين الأولين المراغي … مج 1/ج140 /3 — a source note on the verses at para 41; likely the note [24] missing from Lesson Eight'),
 (8,64, 'كتاب أحاديث الأنبياء/ باب … (3411) وفي صحيح — the Bukhari locus'),
 (8,65, 'مسلم: كتاب فضائل الصحابة/ باب … (4459) — the Muslim locus, continuing para 64'),
 (8,67, 'قالها في رثاء والدة سيف الدولة … دار الكتاب العربي - بيروت — a source note with its imprint'),
]

# tails and stray runs to strip from otherwise genuine paragraphs
STRIP=[
 (8,35,' al-Suyūṭī gives it in the Musnad of ʿAli in al-Jāmiʿ al-Kabīr 99/2, in another transmission.',''),
 (7,77,'the naming [text uncertain] refutes this','the naming refutes this'),
 (8,53,'of the saints — [sentence incomplete]. They said','of the saints. They said'),
]
# whole runs to drop, matched exactly
DROPRUN=[(8,74,'Qiṣaṣ al-Anbiyāʾ',1),(8,74,', p. 214.',2),
         (8,56,'[the praise is for Allah]',3),
         (8,56,'Ibn Kathīr',4),(8,56,', part 361 /1. And in ',5),
         (8,56,'Qiṣaṣ al-anbiyāʾ',6),(8,56,' (the one called ',7),
         (8,56,'al-ʿArāʾis',8),(8,56,'), p. 209.',9)]

def para(L,n):
    for p in d[str(L)]['paragraphs']:
        if p['n']==n: return p

removed=[]
for L,n,why in EMPTY:
    p=para(L,n)
    txt=''.join(r[0] for r in p['runs'])
    if not txt.strip(): print('ALREADY EMPTY L%d ¶%d'%(L,n)); continue
    removed.append((L,n,txt,why))
    print('EMPTY  L%d ¶%-3d %s'%(L,n,txt[:95]))
    if WRITE: p['runs']=[]

for L,n,old,new in STRIP:
    p=para(L,n)
    hits=[i for i,r in enumerate(p['runs']) if old in r[0]]
    if len(hits)!=1:
        print('x%d STRIP L%d ¶%d %r'%(len(hits),L,n,old[:50])); continue
    print('STRIP  L%d ¶%-3d %s'%(L,n,old[:95]))
    if old.strip() and not new: removed.append((L,n,old.strip(),'tail: the printing’s source note'))
    if WRITE: p['runs'][hits[0]][0]=p['runs'][hits[0]][0].replace(old,new)

if WRITE:
    for L,n,_,_ in sorted({(a,b,0,0) for a,b,_,_ in DROPRUN}, reverse=True):
        pass
    p=para(8,56)
    for _,_,txt,idx in sorted(DROPRUN, key=lambda x:-x[3]):
        if idx<len(p['runs']) and p['runs'][idx][0]==txt:
            del p['runs'][idx]
    print('DROP   L8 ¶56  stray gloss + the Ibn Kathīr / Qiṣaṣ al-anbiyāʾ locus')

for L in range(1,9):
    for p in d[str(L)]['paragraphs']:
        p['runs']=[r for r in p['runs'] if r[0].strip()]

print('\n%d passages lifted out'%len(removed))
if WRITE:
    json.dump(d, io.open(SRC,'w',encoding='utf-8'), ensure_ascii=False)
    json.dump(removed, io.open('/home/claude/mk/lifted-apparatus.json','w',encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print('written')
