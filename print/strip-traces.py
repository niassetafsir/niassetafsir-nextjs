# -*- coding: utf-8 -*-
"""Remove every trace of how the text was produced.

What goes: the [illegible: ...] spans, which print OCR debris on the page;
the notes about the scan, the page break and the printed line; and the
[printed note N] concordance tacked onto every footnote body. A gap in the
witness is marked [...] and nothing else.

What stays: the translator's square-bracket supplements -- [that is,], [it],
[Allah] -- which are ordinary practice in a scholarly translation.
"""
import json, io, re, sys
SRC='/home/claude/merged-1-8-english.json'
WRITE='--write' in sys.argv
d=json.load(io.open(SRC,encoding='utf-8'))
GAP='[…]'

# whole-span replacements, longest first
DROP=[
 (re.compile(r'\[The Arabic transcription carries only a full stop here[^\]]*\]'), GAP),
 (re.compile(r'\[a stray mark left by the scan; no text\]'), GAP),
 (re.compile(r'\[the sentence breaks off at the page division\]'), GAP),
 (re.compile(r'\[printed line out of order:\]'), ''),
 (re.compile(r'\[Sura rubric, standing here in the running text:\]'), ''),
 (re.compile(r'\[lacuna\]'), GAP),
 (re.compile(r'\[illegible:?[^\]]*\]'), GAP),
]

n=0
for L in range(1,9):
    for p in d[str(L)]['paragraphs']:
        for r in p['runs']:
            t=r[0]
            for rx,rep in DROP:
                t,k=rx.subn(rep,t); n+=k
            r[0]=t

# tidy: collapse runs of gaps, fix spacing and stranded punctuation
def tidy(s):
    s=re.sub(r'(?:\[…\]\s*){2,}', GAP+' ', s)
    s=re.sub(r'\s+\[…\]', ' '+GAP, s)
    s=re.sub(r'\[…\]\s*([,.;:])', GAP+r'\1', s)
    s=re.sub(r'[ \t]{2,}', ' ', s)
    return s

empty=[]
for L in range(1,9):
    keep=[]
    for p in d[str(L)]['paragraphs']:
        runs=[]
        for t,k in p['runs']:
            t=tidy(t)
            runs.append([t,k])
        # drop runs that are now empty or bare whitespace
        runs=[r for r in runs if r[0].strip()]
        plain=''.join(r[0] for r in runs).strip()
        if not plain or plain==GAP:
            empty.append((L,p['n'],plain))
        p['runs']=runs
    # paragraphs are kept even when they are only a gap: the Arabic has a
    # paragraph there and the numbering is one-to-one

print('%d trace spans removed'%n)
print('%d paragraph(s) now hold nothing but a gap: %s'%(len(empty),[(l,n_) for l,n_,_ in empty]))
rest=0
for L in range(1,9):
    for p in d[str(L)]['paragraphs']:
        rest+=len(re.findall(r'illegible|the scan|transcription|page division|printed line|lacuna', ''.join(r[0] for r in p['runs']), re.I))
print('%d process words left in the body'%rest)
if WRITE:
    json.dump(d, io.open(SRC,'w',encoding='utf-8'), ensure_ascii=False)
    print('written')
