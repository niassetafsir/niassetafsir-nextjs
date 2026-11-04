# -*- coding: utf-8 -*-
"""Set a whole volume as one document, for review and for a publisher.

The per-lesson files were right for working on one lesson at a time. A
publisher wants the volume: half-title, title, contents and the note on the
translation in the front matter, then the lessons running on, foliated
continuously, each opening on a recto.

Two foliation schemes, so two sections. The half-title and the title page carry
no folio. The front matter takes lower-case roman, beginning at iii. The body
restarts at 1 in arabic figures and runs to the end.

    python3 volume.py 1        -> Volume One, Lessons 1-9
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from book import (EN, BODY, ARABIC, ACCENT, BLACK, NAMES, MARK, VOLUMES, ROMAN,
                  newdoc, folio, rule, heading, set_fonts, oldstyle, add_text)
from joinrule import needs_space
from front import TITLE, SUB, BY, NOTE, para, pagebreak
from docxfn import Footnotes

NOTES_SRC = '/home/claude/textual-notes.json'

OUT = '/home/claude/volumes'


def roman_folios(sec, start=None):
    folio(sec)
    e = OxmlElement('w:pgNumType'); e.set(qn('w:fmt'), 'lowerRoman')
    if start: e.set(qn('w:start'), str(start))
    sec._sectPr.append(e)


def arabic_folios(sec, start=1):
    folio(sec)
    e = OxmlElement('w:pgNumType'); e.set(qn('w:fmt'), 'decimal')
    e.set(qn('w:start'), str(start))
    sec._sectPr.append(e)


def like_first(d, sec):
    """Every section keeps the trim and the mirrored margins of the first."""
    sec.page_width, sec.page_height = Inches(6), Inches(9)
    sec.top_margin, sec.bottom_margin = Inches(0.85), Inches(0.80)
    sec.left_margin, sec.right_margin = Inches(0.85), Inches(0.70)
    sec.footer.is_linked_to_previous = False
    return sec


def lesson_body(d, L, fn=None, notes=()):
    """The lesson's paragraphs, with the printing's reference marks cut and the
    translator's own notes set where they bear.

    A note names the words it follows rather than a position, so it survives a
    change to the translation; the anchor has to occur exactly once in the
    lesson or the note is not placed."""
    first = True
    for p in EN[str(L)]['paragraphs']:
        runs = [(t.strip(), k) for t, k in p['runs'] if t.strip()]
        if not runs:
            continue

        # Where each note falls. An anchor usually spans two or three runs — a
        # lemma, its gloss, the prose after it — so the paragraph is assembled
        # first, exactly as it will be written, and the anchor's last character
        # decides which run the reference follows.
        joined, ends, prev = '', [], ''
        for t, k in runs:
            if needs_space(prev, t):
                joined += ' '
            joined += MARK.sub('', t)
            ends.append(len(joined))
            prev = t
        after_run = {}
        for ni, nt in enumerate(notes):
            if nt['after'] not in joined:
                continue
            stop = joined.index(nt['after']) + len(nt['after'])
            j = next((i for i, e in enumerate(ends) if e >= stop), len(ends) - 1)
            after_run.setdefault(j, []).append(ni)
            nt['_done'] = True

        par = d.add_paragraph()
        par.paragraph_format.first_line_indent = Inches(0 if first else 0.20)
        first = False
        prev = ''
        for j, (t, k) in enumerate(runs):
            if needs_space(prev, t):
                sep = par.add_run(' '); set_fonts(sep, BODY)
            pos = 0
            for m in MARK.finditer(t):
                if t[pos:m.start()]: add_text(par, t[pos:m.start()], k)
                pos = m.end()
            if t[pos:]: add_text(par, t[pos:], k)
            prev = t
            if fn is not None:
                for ni in after_run.get(j, []):
                    fn.reference(par, fn.add(notes[ni]['note']))


def build(vol):
    lo, hi = VOLUMES[vol - 1]
    name = ROMAN[vol]
    d = newdoc()                      # section 1: no folio at all

    for _ in range(7): para(d)
    para(d, TITLE, size=19, align=WD_ALIGN_PARAGRAPH.CENTER, colour=ACCENT)
    pagebreak(d)
    for _ in range(5): para(d)
    para(d, TITLE, size=26, align=WD_ALIGN_PARAGRAPH.CENTER, colour=ACCENT, after=8)
    para(d, SUB, size=12.5, align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, after=26)
    rule(d)
    para(d, BY, size=14, align=WD_ALIGN_PARAGRAPH.CENTER, after=4)
    para(d, 'Volume %s' % name, size=11, align=WD_ALIGN_PARAGRAPH.CENTER,
         colour=ACCENT, caps=True, track=30, after=2)
    para(d, 'Lessons %s to %s' % (NAMES[lo][0].split()[1], NAMES[hi][0].split()[1]),
         size=10.5, align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, after=40)
    para(d, 'Translated from the Arabic by', size=10.5,
         align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, after=5)
    para(d, 'Amadu Farouk Kunateh', size=14, align=WD_ALIGN_PARAGRAPH.CENTER)

    # section 2: the front matter, in roman
    sec = like_first(d, d.add_section(WD_SECTION.ODD_PAGE))
    roman_folios(sec, start=3)
    for _ in range(3): para(d)
    para(d, 'Contents', size=17, align=WD_ALIGN_PARAGRAPH.CENTER, colour=ACCENT, after=4)
    rule(d)
    for L in range(lo, hi + 1):
        title, sura, verses = NAMES[L]
        p = d.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(1)
        r = p.add_run(title); set_fonts(r, BODY); r.font.size = Pt(12)
        p = d.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(11)
        r = p.add_run(sura); set_fonts(r, BODY); r.font.size = Pt(10.5); r.italic = True
        r = p.add_run('  ·  '); set_fonts(r, BODY); r.font.size = Pt(10.5)
        r.font.color.rgb = ACCENT
        r = p.add_run(verses); set_fonts(r, BODY); r.font.size = Pt(10)
        r.font.color.rgb = ACCENT; oldstyle(r)
    pagebreak(d)
    for _ in range(2): para(d)
    para(d, 'Note on the Translation', size=17, align=WD_ALIGN_PARAGRAPH.CENTER,
         colour=ACCENT, after=4)
    rule(d)
    for i, t in enumerate(NOTE):
        para(d, t, size=11, after=0, indent=0 if i == 0 else 0.22)

    # section 3 onward: the lessons, foliated from 1, each opening on a recto
    fn = Footnotes(d, font=BODY, size=9, arabic_font=ARABIC)
    ALL = json.load(open(NOTES_SRC)) if os.path.exists(NOTES_SRC) else {}
    placed = 0
    for n, L in enumerate(range(lo, hi + 1)):
        sec = like_first(d, d.add_section(WD_SECTION.ODD_PAGE))
        if n == 0:
            arabic_folios(sec, start=1)
        else:
            folio(sec)
        heading(d, L)
        notes = [dict(x) for x in ALL.get(str(L), [])]
        lesson_body(d, L, fn, notes)
        placed += sum(1 for x in notes if x.get('_done'))
        missed = [x['after'][:50] for x in notes if not x.get('_done')]
        if missed:
            print('  lesson %d: %d note(s) NOT placed: %s' % (L, len(missed), missed))

    os.makedirs(OUT, exist_ok=True)
    path = '%s/Fi Riyad al-Tafsir - Volume %s.docx' % (OUT, name)
    d.save(path)
    print('footnotes set: %d' % placed)
    words = sum(len(''.join(t for t, k in p['runs']).split())
                for L in range(lo, hi + 1) for p in EN[str(L)]['paragraphs'])
    return path, lo, hi, words


if __name__ == '__main__':
    vol = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    path, lo, hi, words = build(vol)
    print('Volume %s: Lessons %d-%d, %d words of English, about %d pages'
          % (ROMAN[vol], lo, hi, words, round(words / 330.0)))
    print('wrote %s' % path)
