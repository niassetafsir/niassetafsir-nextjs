# -*- coding: utf-8 -*-
"""
Real Word footnotes for python-docx, which has no footnote support.

A .docx carries footnotes in a separate part, word/footnotes.xml, reached by a
relationship from word/document.xml and declared in [Content_Types].xml. Each
note has a numeric id; ids -1 and 0 are reserved for the separator and the
continuation separator and must be present or Word repairs the file. A
reference in the body is a run holding <w:footnoteReference w:id="N"/>.

Chicago note style: a superscript arabic numeral in the text, the note at the
foot of the page, the note opening with its number, a period and a space.
"""
import copy
from docx.oxml.ns import qn, nsmap
from docx.opc.part import Part
from docx.opc.packuri import PackURI
from docx.oxml import parse_xml
from docx.shared import Pt, Inches, RGBColor

W = nsmap['w']
FOOTNOTES_CT = ('application/vnd.openxmlformats-officedocument'
                '.wordprocessingml.footnotes+xml')
FOOTNOTES_RT = ('http://schemas.openxmlformats.org/officeDocument/2006/'
                'relationships/footnotes')

SHELL = (
 '<w:footnotes xmlns:w="%s">'
 '<w:footnote w:type="separator" w:id="-1"><w:p>'
 '<w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>'
 '<w:r><w:separator/></w:r></w:p></w:footnote>'
 '<w:footnote w:type="continuationSeparator" w:id="0"><w:p>'
 '<w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>'
 '<w:r><w:continuationSeparator/></w:r></w:p></w:footnote>'
 '</w:footnotes>' % W)


def _is_arabic(s):
    return any('؀' <= c <= 'ۿ' or 'ݐ' <= c <= 'ݿ'
               or 'ࢠ' <= c <= 'ࣿ' for c in s)


class _FootnotesPart(Part):
    """A package part whose blob is the live footnotes element, serialised."""

    def __init__(self, partname, content_type, element, package):
        super().__init__(partname, content_type, package=package)
        self._element = element

    @property
    def blob(self):
        from lxml import etree
        return etree.tostring(self._element, xml_declaration=True,
                              encoding='UTF-8', standalone=True)


class Footnotes:
    """Attach a footnotes part to a Document and add notes to it."""

    def __init__(self, document, font='Garamond', size=10,
                 arabic_font='Times New Roman'):
        self.doc = document
        self.font = font
        self.size = size
        self.arabic_font = arabic_font
        self._next = 1
        self.el = parse_xml(SHELL)
        self.part = _FootnotesPart(PackURI('/word/footnotes.xml'),
                                   FOOTNOTES_CT, self.el,
                                   document.part.package)
        document.part.relate_to(self.part, FOOTNOTES_RT)

    def add(self, text):
        """Add a note; returns its id. Chicago: 'N. text'."""
        fid = self._next
        self._next += 1
        rtl = _is_arabic(text)
        font = self.arabic_font if rtl else self.font
        sz = str(int(self.size * 2))
        ppr = ('<w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/>'
               '<w:ind w:firstLine="180"/>'
               + ('<w:bidi/><w:jc w:val="right"/>' if rtl else '')
               + '</w:pPr>')
        rpr = ('<w:rPr><w:rFonts w:ascii="%s" w:hAnsi="%s" w:cs="%s"/>'
               '<w:sz w:val="%s"/><w:szCs w:val="%s"/>%s</w:rPr>'
               % (font, font, font, sz, sz, '<w:rtl/>' if rtl else ''))
        safe = (text.replace('&', '&amp;').replace('<', '&lt;')
                    .replace('>', '&gt;'))
        xml = ('<w:footnote xmlns:w="%s" w:id="%d"><w:p>%s'
               '<w:r>%s<w:t xml:space="preserve">%d. </w:t></w:r>'
               '<w:r>%s<w:t xml:space="preserve">%s</w:t></w:r>'
               '</w:p></w:footnote>' % (W, fid, ppr, rpr, fid, rpr, safe))
        self.el.append(parse_xml(xml))
        return fid

    def reference(self, paragraph, fid):
        """Append a superscript reference run to a paragraph."""
        r = paragraph.add_run()
        r.font.superscript = True
        r.font.size = Pt(self.size)
        r.font.name = self.font
        r._r.append(parse_xml(
            '<w:footnoteReference xmlns:w="%s" w:id="%d"/>' % (W, fid)))
        return r
