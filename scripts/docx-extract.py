import zipfile, re, unicodedata, json, glob, os

def dexml(s):
    s=re.sub(r'<[^>]+>','',s)
    return (s.replace('&amp;','&').replace('&lt;','<').replace('&gt;','>')
             .replace('&quot;','"').replace('&apos;',"'"))

def read_docx(path):
    z=zipfile.ZipFile(path)
    doc=z.read('word/document.xml').decode('utf8')

    # real footnotes only: separators carry a w:type attribute
    notes={}
    if 'word/footnotes.xml' in z.namelist():
        fx=z.read('word/footnotes.xml').decode('utf8')
        for m in re.finditer(r'<w:footnote(?![s])([^>]*)>(.*?)</w:footnote>', fx, flags=re.S):
            attrs, inner = m.group(1), m.group(2)
            if 'w:type=' in attrs: continue
            i=re.search(r'w:id="(-?\d+)"', attrs)
            if not i: continue
            i=int(i.group(1))
            if i<0: continue
            txt=' '.join(dexml(t) for t in re.findall(r'<w:t[^>]*>(.*?)</w:t>', inner, flags=re.S))
            notes[i]=re.sub(r'\s+',' ',txt).strip()

    paras=[]
    for para in re.findall(r'<w:p[ >].*?</w:p>', doc, flags=re.S):
        buf=[]
        for tok in re.finditer(r'<w:t[^>]*>(.*?)</w:t>|<w:footnoteReference[^>]*w:id="(-?\d+)"', para, flags=re.S):
            if tok.group(1) is not None: buf.append(dexml(tok.group(1)))
            else:
                i=int(tok.group(2))
                if i in notes: buf.append('†%d†'%i)
        t=''.join(buf).strip()
        if t: paras.append(t)
    return '\n'.join(paras), notes

MARK=re.compile('†(\\d+)†')
def norm_map(s):
    out,idx=[],[]
    for i,ch in enumerate(s):
        for c in unicodedata.normalize('NFD',ch):
            if unicodedata.combining(c): continue
            if c in 'إأآا': c='ا'
            if '؀'<=c<='ۿ': out.append(c); idx.append(i)
            elif c.isspace():
                if out and out[-1]!=' ': out.append(' '); idx.append(i)
    return ''.join(out), idx

def strip_all(s):
    return MARK.sub('', re.sub(r'\[\d+\]','',s))

LESSON=re.compile(r'[Ll]esson\s*(\d+)')
if __name__=='__main__':
    for f in sorted(glob.glob('/mnt/user-data/uploads/Verified Lessons - Citations Fixed/*.docx')):
        n=int(LESSON.search(os.path.basename(f)).group(1))
        text,notes=read_docx(f)
        anchors=MARK.findall(text)
        repo=json.load(open('/tmp/ntfs/src/data/lessons/%02d.json'%n))
        body=repo['arabicBody']
        fns=[x for x in json.load(open('/tmp/ntfs/src/data/footnotesData.json')) if x['lessonId']==n]
        nd,_=norm_map(strip_all(text)); nb,_=norm_map(strip_all(body))
        print('L%-2d  notes=%-3d anchors=%-3d | repo: fnRows=%-3d markers=%-3d | docxNorm=%-6d repoNorm=%-6d ratio=%.3f'
              %(n,len(notes),len(anchors),len(fns),len(re.findall(r'\[\d+\]',body)),len(nd),len(nb),len(nb)/len(nd)))
