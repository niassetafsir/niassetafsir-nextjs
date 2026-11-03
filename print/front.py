# -*- coding: utf-8 -*-
"""Front matter for the English volume, set to match the lesson pages."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from book import (BODY, ARABIC, ACCENT, BLACK, NAMES, newdoc, folio,
                  rule, set_fonts, oldstyle)

OUT = '/home/claude/book3/Fi Riyad al-Tafsir - Lessons 1-9'
os.makedirs(OUT, exist_ok=True)

def para(d, text='', size=11, align=WD_ALIGN_PARAGRAPH.JUSTIFY, colour=BLACK,
         italic=False, before=0, after=0, indent=0, caps=False, track=0):
    p = d.add_paragraph(); p.alignment = align
    pf = p.paragraph_format
    pf.space_before, pf.space_after = Pt(before), Pt(after)
    if indent: pf.first_line_indent = Inches(indent)
    if text:
        r = p.add_run(text); set_fonts(r, BODY)
        r.font.size = Pt(size); r.font.color.rgb = colour; r.italic = italic
        if caps:
            e = OxmlElement('w:smallCaps'); e.set(qn('w:val'),'1')
            r._element.get_or_add_rPr().append(e)
        if track:
            sp = OxmlElement('w:spacing'); sp.set(qn('w:val'), str(track))
            r._element.get_or_add_rPr().append(sp)
        oldstyle(r)
    return p

def pagebreak(d):
    d.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

def roman_folios(sec, start=None):
    """Lower-case roman folios, as the model sets its front matter."""
    folio(sec)
    pgNum = OxmlElement('w:pgNumType'); pgNum.set(qn('w:fmt'), 'lowerRoman')
    if start: pgNum.set(qn('w:start'), str(start))
    sec._sectPr.append(pgNum)

TITLE = 'Fī Riyāḍ al-Tafsīr'
SUB   = 'In the Gardens of Qurʾānic Commentary'
BY    = 'Shaykh Ibrāhīm Niasse'

NOTE = [
 "Fī Riyāḍ al-Tafsīr is a lecture course, taken down as it was spoken. Niasse "
 "quotes a Qurʾānic lemma, glosses it in the manner of the Jalālayn, and then "
 "expounds — on the occasion of a verse’s revelation, on a legal question it "
 "raises, on a ḥadīth that bears on it, on the sense it carries for the "
 "wayfarer. He moves between these without announcing the change, and a "
 "translation that levelled them would lose the shape of the teaching. Four "
 "are kept apart on the page.",

 "Qurʾānic lemmata stand between « and », in the second colour. Ḥadīth and the "
 "words of named authorities, quoted as speech, stand between ⟨ and ⟩. Niasse’s "
 "own prose, including the short glosses he drops between the words of a verse, "
 "is plain roman. Arabic carried over untranslated is italic.",

 "Square brackets hold words supplied to complete the English sense. Three "
 "points between brackets, […], mark a place where the copy-text cannot be read.",

 "Qurʾānic references are given as (Q. 2:197) after the last lemma of a run "
 "rather than after every fragment, since Niasse often works through a verse in "
 "four or five pieces. The lemmata appear as he cites them, which is sometimes a "
 "clause and sometimes the whole verse.",

 "Transliteration follows the IJMES system, including its word list: the common "
 "nouns on that list are set in roman without diacritics — Quran, hadith, sura, "
 "hajj, imam, Ramadan, Muhammad. Inside a transliterated Arabic phrase the "
 "ordinary rules return, so al-Ḥamdu li-Llāh keeps its macrons.",

 "The copy-text is the ten-volume Majmaʿ al-Yamāma printing (Tunis, December "
 "2022). Paragraphs are divided as that printing divides them, which means the "
 "break often falls where the page turned, in the middle of a sentence. I have "
 "left those breaks standing rather than smooth them, and a paragraph that opens "
 "mid-clause is translated from where it opens.",

 "The Tunis printing carries an apparatus of its own, four hundred and "
 "thirty-five notes across these nine lessons, which traces Niasse’s ḥadīth "
 "to the collections and his glosses to the books he worked from. It is not "
 "reproduced here. It is set out in full at niassetafsir.org, against the same "
 "paragraphs, where a reader who wants to check a source can find it. The "
 "notes in this volume are mine. Where the printing’s apparatus had been "
 "copied into the body of the text, it has been taken out, since those are the "
 "editor’s words and not Niasse’s.",

 "Niasse parts company with the received tradition at a number of points — on "
 "the month in which Badr was fought, on which of the Prophet’s household a "
 "report concerns, on whether a saying is the Prophet’s or a Companion’s. I have "
 "translated what he says. Correcting him would make the volume a worse witness "
 "to what was taught in Kaolack.",
]

def build():
    d = newdoc()
    # the half-title and the title page carry no folio

    # half title
    for _ in range(7): para(d)
    para(d, TITLE, size=19, align=WD_ALIGN_PARAGRAPH.CENTER, colour=ACCENT)
    pagebreak(d)

    # title page
    for _ in range(5): para(d)
    para(d, TITLE, size=26, align=WD_ALIGN_PARAGRAPH.CENTER, colour=ACCENT, after=8)
    para(d, SUB, size=12.5, align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, after=26)
    rule(d)
    para(d, BY, size=14, align=WD_ALIGN_PARAGRAPH.CENTER, after=4)
    para(d, 'Lessons One to Nine', size=11, align=WD_ALIGN_PARAGRAPH.CENTER,
         colour=ACCENT, caps=True, track=30, after=40)
    para(d, 'Translated from the Arabic by', size=10.5,
         align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, after=5)
    para(d, 'Amadu Farouk Kunateh', size=14, align=WD_ALIGN_PARAGRAPH.CENTER)

    # a new section so the folios begin after the title page
    sec = d.add_section(WD_SECTION.ODD_PAGE)
    sec.page_width, sec.page_height = Inches(6), Inches(9)
    sec.top_margin, sec.bottom_margin = Inches(0.85), Inches(0.80)
    sec.left_margin, sec.right_margin = Inches(0.85), Inches(0.70)
    sec.footer.is_linked_to_previous = False
    roman_folios(sec, start=3)

    # contents
    for _ in range(3): para(d)
    para(d, 'Contents', size=17, align=WD_ALIGN_PARAGRAPH.CENTER, colour=ACCENT, after=4)
    rule(d)
    para(d, 'Volume One of the Arabic printing', size=10.5,
         align=WD_ALIGN_PARAGRAPH.CENTER, colour=ACCENT, italic=True, before=6, after=12)
    for L in range(1, 10):
        if L == 7:
            para(d, 'Volume Two of the Arabic printing, opening', size=10.5,
                 align=WD_ALIGN_PARAGRAPH.CENTER, colour=ACCENT, italic=True,
                 before=16, after=12)
        title, sura, verses = NAMES[L]
        # the lesson on one line, its contents beneath: the long entries wrap
        # badly when sura and verses are run on
        p = d.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(1)
        r = p.add_run(title); set_fonts(r, BODY); r.font.size = Pt(12)
        p = d.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(11)
        r = p.add_run(sura); set_fonts(r, BODY); r.font.size = Pt(10.5); r.italic = True
        r = p.add_run('  ·  '); set_fonts(r, BODY); r.font.size = Pt(10.5); r.font.color.rgb = ACCENT
        r = p.add_run(verses); set_fonts(r, BODY); r.font.size = Pt(10)
        r.font.color.rgb = ACCENT; oldstyle(r)
    pagebreak(d)

    # note on the translation
    for _ in range(2): para(d)
    para(d, 'Note on the Translation', size=17, align=WD_ALIGN_PARAGRAPH.CENTER,
         colour=ACCENT, after=4)
    rule(d)
    for i, t in enumerate(NOTE):
        para(d, t, size=11, after=0, indent=0 if i == 0 else 0.22)

    path = os.path.join(OUT, '00 - Front matter.docx')
    d.save(path)
    return path, sum(len(t.split()) for t in NOTE)

if __name__ == '__main__':
    p, w = build()
    print('wrote %s  (note: %d words)' % (p, w))
