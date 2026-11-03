# -*- coding: utf-8 -*-
"""Set Lessons One to Eight as a book.

Trim 6 x 9, mirrored margins, a single accent colour, text figures, a centred
folio and nothing else at the foot. One typographic rule governs the page:
the reader should see Niasse's words and the structure of his lecture, and
nothing about how the volume was made.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docxfn import Footnotes
from joinrule import needs_space

EN = json.load(open('/home/claude/merged-1-9-english.json'))
APPARATUS = json.load(open('/home/claude/apparatus.json')) if os.path.exists('/home/claude/apparatus.json') else {}
OUT = '/home/claude/book3/Fi Riyad al-Tafsir - Lessons 1-9'
os.makedirs(OUT, exist_ok=True)

BODY   = 'Garamond'
ARABIC = 'Geeza Pro'   # present on macOS; carries U+FDFA
EULOGY = 'ﷺ'
ACCENT = RGBColor(0x8F, 0x27, 0x33)     # one accent, used for heads and lemmata
BLACK  = RGBColor(0x1A, 0x1A, 0x1A)

NAMES = {1:('Lesson One','Al-Istiʿādha, the Basmala, and Sūrat al-Fātiḥa','Q. 1:1–2:5'),
         2:('Lesson Two','Sūrat al-Baqara','Q. 2:6–25'),
         3:('Lesson Three','Sūrat al-Baqara','Q. 2:26–59'),
         4:('Lesson Four','Sūrat al-Baqara','Q. 2:60–105'),
         5:('Lesson Five','Sūrat al-Baqara','Q. 2:106–202'),
         6:('Lesson Six','Sūrat al-Baqara','Q. 2:203–252'),
         7:('Lesson Seven','Sūrat al-Baqara and Āl ʿImrān','Q. 2:253–3:14'),
         8:('Lesson Eight','Āl ʿImrān','Q. 3:15–91'),
         9:('Lesson Nine','Āl ʿImrān','Q. 3:92–175')}
MARK = re.compile(r'\[(\d+)\]')

# Seven volumes. Five of the six breaks fall where a sūra ends, which is as many
# as the course allows: seventeen of Niasse's lessons close a sūra, but they
# cluster — none before Lesson Seventeen, then nine in a row from Forty-eight on.
#
# Volume One's break cannot be clean. Lesson Nine stops at Q 3:175 and no lesson
# ends at 3:200, so Āl ʿImrān is cut open there whatever the split; Lesson Ten
# runs on to Q 4:23.
#
# Honouring the seams costs evenness: 345 to 473 pages, against 352 to 426 for a
# split that ignores them. Volume Three carries Hūd through Ibrāhīm at 473 pages,
# the fattest of the seven. Worth it so a reader is not handed two thirds of a
# sūra and told to find the rest in the next book.
VOLUMES = [(1, 9), (10, 17), (18, 28), (29, 36), (37, 43), (44, 49), (50, 56)]

def volume_of(L):
    for v, (lo, hi) in enumerate(VOLUMES, 1):
        if lo <= L <= hi: return v
    return None


def _rpr(r):
    rpr = r._element.get_or_add_rPr()
    return rpr

def oldstyle(r):
    """Text (old-style) figures, as the model page sets them."""
    n = OxmlElement('w:numForm'); n.set(qn('w:val'), 'oldStyle')
    _rpr(r).append(n)

def nofigure(r):
    pass

def set_fonts(r, name):
    r.font.name = name
    rf = _rpr(r).get_or_add_rFonts()
    for a in ('w:ascii','w:hAnsi','w:cs'):
        rf.set(qn(a), name)


def newdoc():
    d = Document()
    s = d.sections[0]
    s.page_width, s.page_height = Inches(6), Inches(9)
    s.top_margin, s.bottom_margin = Inches(0.85), Inches(0.80)
    s.left_margin, s.right_margin = Inches(0.85), Inches(0.70)
    s.gutter = Inches(0)
    # mirror the margins so the inner edge is the wider one
    sectPr = s._sectPr
    pgMar = sectPr.find(qn('w:pgMar'))
    doc = d.settings.element
    mm = OxmlElement('w:mirrorMargins'); doc.append(mm)
    # hyphenate: a 4.45-inch measure set justified without it opens rivers
    for tag, val in (('w:autoHyphenation','1'), ('w:consecutiveHyphenLimit','2'),
                     ('w:hyphenationZone','180'), ('w:doNotHyphenateCaps','1')):
        e = OxmlElement(tag); e.set(qn('w:val'), val); doc.append(e)

    n = d.styles['Normal']
    n.font.name = BODY
    n.font.size = Pt(11)
    n.font.color.rgb = BLACK
    n.element.rPr.rFonts.set(qn('w:cs'), BODY)
    pf = n.paragraph_format
    pf.line_spacing = Pt(15)
    pf.space_after = Pt(0)
    pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    pf.widow_control = True
    return d


def folio(sec):
    """A centred folio at the foot and nothing else."""
    f = sec.footer
    p = f.paragraphs[0] if f.paragraphs else f.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(10)
    r = p.add_run(); set_fonts(r, BODY); r.font.size = Pt(9.5); r.font.color.rgb = BLACK
    for tag, attr, txt in (('w:fldChar',{'w:fldCharType':'begin'},None),
                           ('w:instrText',{'xml:space':'preserve'},' PAGE '),
                           ('w:fldChar',{'w:fldCharType':'end'},None)):
        e = OxmlElement(tag)
        for k,v in attr.items(): e.set(qn(k), v)
        if txt: e.text = txt
        r._element.append(e)
    oldstyle(r)


def rule(d):
    """A short centred rule in the accent colour, in place of an ornament."""
    p = d.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(22)
    r = p.add_run('⁂' if False else '· · ·')
    set_fonts(r, BODY); r.font.size = Pt(10); r.font.color.rgb = ACCENT
    return p


def heading(d, L):
    title, sura, verses = NAMES[L]
    for _ in range(2): d.add_paragraph()
    p = d.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(title); set_fonts(r, BODY); r.font.size = Pt(17); r.font.color.rgb = ACCENT
    p = d.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(sura); set_fonts(r, BODY); r.font.size = Pt(11.5); r.font.italic = True
    p = d.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(14)
    r = p.add_run(verses); set_fonts(r, BODY); r.font.size = Pt(10); r.font.color.rgb = ACCENT
    oldstyle(r)
    rule(d)


def style_run(r, kind):
    set_fonts(r, BODY)
    if kind == 'q':   r.font.color.rgb = ACCENT
    elif kind == 'i': r.italic = True


def add_text(p, text, kind):
    for i, piece in enumerate(text.split(EULOGY)):
        if i:
            r = p.add_run(EULOGY); set_fonts(r, ARABIC)
            if kind == 'q': r.font.color.rgb = ACCENT
        if piece:
            r = p.add_run(piece); style_run(r, kind)
            if any(c.isdigit() for c in piece): oldstyle(r)


def emit(p, text, kind, fn, notes, used):
    """Write the text, dropping the printing's own reference marks.

    The Majmaʿ al-Yamāma edition's apparatus lives on the companion site,
    keyed to the same paragraphs. Its marks are therefore cut from the page
    here rather than set as footnotes: a mark pointing at a note the reader
    cannot reach is worse than no mark, and the numbered series on the page
    belongs to the translator's own notes."""
    pos = 0
    for m in MARK.finditer(text):
        before = text[pos:m.start()]
        if before: add_text(p, before, kind)
        used.add(int(m.group(1)))
        pos = m.end()
    rest = text[pos:]
    if rest: add_text(p, rest, kind)


def build(L):
    d = newdoc()
    folio(d.sections[0])
    fn = Footnotes(d, font=BODY, size=9, arabic_font=ARABIC)
    notes = APPARATUS.get(str(L), {})
    heading(d, L)
    used = set()
    first = True
    for para in EN[str(L)]['paragraphs']:
        runs = [(t.strip(), k) for t, k in para['runs'] if t.strip()]
        if not runs:
            continue                      # a slot the printing left empty
        p = d.add_paragraph()
        p.paragraph_format.first_line_indent = Inches(0 if first else 0.20)
        first = False
        prev = ''
        for t, k in runs:
            if needs_space(prev, t):
                sep = p.add_run(' '); set_fonts(sep, BODY)
            emit(p, t, k, fn, notes, used)
            prev = t
    d.save('%s/%02d - %s.docx' % (OUT, L, NAMES[L][0]))
    marks = sum(len(MARK.findall(t)) for para in EN[str(L)]['paragraphs'] for t, _ in para['runs'])
    printed = sum(1 for para in EN[str(L)]['paragraphs'] if any(t.strip() for t,_ in para['runs']))
    return marks, len(used), printed, len(EN[str(L)]['paragraphs'])


if __name__ == '__main__':
    print('%-3s %-7s %-10s %-9s %s' % ('L','marks cut','footnotes','printed','slots'))
    tm = tf = 0
    for L in range(1, 10):
        m, u, pr, sl = build(L); tm += m; tf += u
        print('%-3d %-7d %-10d %-9d %d' % (L, m, u, pr, sl))
    print('\n%d of the printing\u2019s marks cut from the page; its apparatus is on the site' % tm)
