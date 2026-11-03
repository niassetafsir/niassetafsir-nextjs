# -*- coding: utf-8 -*-
import json, io, sys
SRC='/home/claude/merged-1-8-english.json'
WRITE='--write' in sys.argv
d=json.load(io.open(SRC,encoding='utf-8'))

A=[
 # lesson, para, marker, anchor (marker goes immediately AFTER this exact substring)
 (2,10,4,  'A philosopher asked a scholar'),
 (2,12,5,  'thunder is the angel charged with the rain, or his voice'),
 (4,7,8,   'the rain came down from that Friday to the Friday that followed it.'),
 (4,11,11, 'rose up to restrain them from this, and they killed them too.'),
 (4,13,13, 'the mountain would fall upon them and they would perish to the last of them.'),
 (4,59,35, '«at Bābil» — a town in the farmland of ʿIrāq'),
 (5,3,5,   'So this āya was revealed.«Whatever āya We abrogate»'),
 (5,59,33, 'Go forth — all of you are forgiven.⟩'),
 (5,74,38, 'and he rewarded him, giving him a great deal of money.'),
 (5,97,50, '«and the cursers curse them»the angels and the believers'),
 (5,117,55,'«And kill them wherever you come upon them»you find them'),
 (6,9,7,   'concerning a man called al-Akhnas b. Sharīq.'),
 (6,13,10, '«wholly»that is, in all of its ordinances'),
 (6,18,13, 'make him a Christian, or make him a Magian.⟩'),
 (6,19,14, 'fearing none but Allah, and the wolf for his sheep.⟩'),
 (6,22,15, 'The questioner was ʿAmr b. al-Jamūḥ.'),
 (6,22,16, 'the power to do, even by half a date,'),
 (6,22,17, 'with a good word and a cheerful face.⟩'),
 (6,104,59,'or forty thousand, or seventy thousand'),
 (6,104,60,'from ten up to more than seven hundred,'),
 (6,114,65,'and it is between the Jordan and Palestine'),
 (6,114,66,'the people of Badr and the number of the messengers.'),
 (7,60,42, 'Muslim transmitted it.'),
 (7,63,43, 'and when it is corrupt the whole body is corrupt. It is the heart.⟩'),
 (7,67,45, 'from this community, as has come in the hadith.'),
 (7,67,46, 'he was told after every phrase: I have done [it].⟩'),
 (7,75,49, 'then the spirit is breathed into him.⟩'),
 (7,84,57, 'And none take heed but those possessed of understanding»'),
 (7,92,62, 'the finest clothing is silk, which is only the excrement of a worm.⟩'),
 (8,10,5,  '⟨Admit him to the Garden — and he enters the Garden.⟩'),
 (8,10,6,  'of those who fulfil a covenant, so enter the Garden.⟩'),
 (8,13,8,  'verse of stoning, and the Prophet ﷺ had the two of them stoned.'),
 (8,14,9,  'as My servant thinks of Me, so let him think of Me what he will.⟩'),
 (8,21,14, 'and all of these my community will possess.⟩'),
 (8,21,15, 'There is no way to possessing these.⟩'),
 (8,58,31, 'I have reached the limit of age, a hundred and twenty years'),
 (8,77,38, 'giving him half in Ṣafar and half in Rajab.'),
]

def para(L,n):
    for p in d[str(L)]['paragraphs']:
        if p['n']==n: return p
    return None

# pass 1: validate every anchor against the CURRENT text, and check ordering
ok=[]
for L,n,num,anc in A:
    p=para(L,n)
    if p is None: print('NO PARA  L%d ¶%d'%(L,n)); continue
    txt=''.join(r[0] for r in p['runs'])
    c=txt.count(anc)
    if c!=1:
        print('ANCHOR x%d  L%d ¶%d [%d]  %r'%(c,L,n,num,anc[:60])); continue
    if '[%d]'%num in txt:
        print('ALREADY  L%d ¶%d [%d]'%(L,n,num)); continue
    ok.append((L,n,num,anc,txt.index(anc)+len(anc)))

# ordering check for multi-marker paragraphs
from collections import defaultdict
g=defaultdict(list)
for L,n,num,anc,pos in ok: g[(L,n)].append((num,pos))
for k,v in g.items():
    if len(v)>1:
        v2=sorted(v)
        if [x[1] for x in v2]!=sorted(x[1] for x in v2):
            print('ORDER   L%d ¶%d  %s'%(k[0],k[1],v2))

print('\n%d/%d anchors valid'%(len(ok),len(A)))

# pass 2: insert, deepest-position-first within each paragraph so offsets stay valid
byp=defaultdict(list)
for L,n,num,anc,pos in ok: byp[(L,n)].append((pos,num))
ins=0
for (L,n),items in byp.items():
    p=para(L,n)
    for pos,num in sorted(items, reverse=True):
        runs=p['runs']; acc=0; done=False
        for i,r in enumerate(runs):
            nxt=acc+len(r[0])
            if pos<=nxt:
                off=pos-acc
                head,tail=r[0][:off], r[0][off:]
                new=[]
                if head: new.append([head,r[1]])
                new.append(['[%d]'%num,'p'])
                if tail: new.append([tail,r[1]])
                if WRITE: runs[i:i+1]=new
                done=True; ins+=1
                break
            acc=nxt
        if not done: print('NO SPLIT L%d ¶%d [%d] pos=%d'%(L,n,num,pos))
print('%d markers inserted (write=%s)'%(ins,WRITE))
if WRITE:
    json.dump(d, io.open(SRC,'w',encoding='utf-8'), ensure_ascii=False)
    print('written')
