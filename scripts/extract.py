#!/usr/bin/env python3
"""Reading a .docx the way import-verified-apparatus.py needs it.

This module was scratch in the container the first import ran in and never
reached the repo, so the importer could not be run again. It is here now
because every lesson AK verifies has to go through the same step.

THE ONE THING THAT MATTERS. A Word footnote leaves two separate traces: the
note's text in word/footnotes.xml, and a <w:footnoteReference w:id="N"/> at
the exact character position in word/document.xml where the compiler keyed it.
The second is why the .docx is worth reading at all. Reconstructing those
positions by matching note text to nearby paragraphs agreed with known-good
markers only 69% of the time; the reference needs no inference.

read_docx returns the body as one string with a sentinel at each reference, so
MARK.split() hands back [text, id, text, id, ..., text] in document order.

Separator and continuation "footnotes" -- the ones carrying w:type -- are not
notes and are dropped.
"""

import re, html, zipfile, unicodedata

#: Sentinel left at each footnote reference. Uses U+0000, which cannot occur in
#: the document text, so splitting on it can never cut real prose.
MARK = re.compile('\x00FN(\\d+)\x00')

_T = re.compile(r'<w:t[^>]*>(.*?)</w:t>', re.S)
_REF = re.compile(r'<w:footnoteReference[^>]*w:id="(-?\d+)"')
_TOKEN = re.compile(r'<w:t[^>]*>(.*?)</w:t>|<w:footnoteReference[^>]*w:id="(-?\d+)"', re.S)
_NOTE = re.compile(r'<w:footnote(\s[^>]*)?>(.*?)</w:footnote>', re.S)
_PBREAK = re.compile(r'</w:p>')

#: Combining marks, and the letterforms that stand for an ordinary Arabic
#: letter. Keep this in step with the fold in the repair scripts: a document
#: typed with Farsi yeh or heh doachashmee must still match the site's text.
_MARKS = set(range(0x0610, 0x061B)) | set(range(0x064B, 0x0660)) | {0x0670} \
    | set(range(0x06D6, 0x06EE)) | {0x0656, 0x0657, 0x065E}
_SUB = {0x06CC: 'ي', 0x0649: 'ي', 0x06D2: 'ي', 0x0626: 'ي',
        0x06A9: 'ك', 0x0629: 'ه', 0x06BE: 'ه', 0x06C1: 'ه',
        0x0622: 'ا', 0x0623: 'ا', 0x0625: 'ا', 0x0671: 'ا',
        0x0624: 'و', 0x0640: ''}


def read_docx(path):
    """(body text with a sentinel at each footnote reference, {id: note text})."""
    z = zipfile.ZipFile(path)
    xml = z.read('word/document.xml').decode('utf-8')
    out = []
    for m in _TOKEN.finditer(xml):
        if m.group(1) is not None:
            out.append(html.unescape(m.group(1)))
        else:
            i = int(m.group(2))
            if i > 0:
                out.append('\x00FN%d\x00' % i)
    text = ''.join(out)

    notes = {}
    if 'word/footnotes.xml' in z.namelist():
        fx = z.read('word/footnotes.xml').decode('utf-8')
        for m in _NOTE.finditer(fx):
            attrs, inner = m.group(1) or '', m.group(2)
            if 'w:type=' in attrs:
                continue          # separator / continuation, not a note
            idm = re.search(r'w:id="(-?\d+)"', attrs)
            if not idm or int(idm.group(1)) < 1:
                continue
            t = ''.join(html.unescape(x) for x in _T.findall(inner))
            t = re.sub(r'\s+', ' ', t).strip()
            if t:
                notes[int(idm.group(1))] = t
    return text, notes


def strip_all(s):
    """The body with the inline markers taken out.

    Only the markers. Everything else -- the citation parentheses, the
    guillemets, the editorial square brackets -- is left alone, because
    norm_map drops whatever is not a letter anyway, and removing it here
    would shift the offsets norm_map has to report.
    """
    return re.sub(r'\[\d+\]', '', s or '')


def norm_map(s):
    """(normalised text, index map back into s).

    The normalised form keeps Arabic letters and single spaces and nothing
    else, levelling the alif seats, alif maqsura, ta marbuta and the
    Persian/Urdu letterforms. index[i] is the offset in s of the character
    that produced normalised character i, so a match found in the normalised
    text can be turned back into a position in the original.
    """
    s = s or ''
    norm, idx = [], []
    for i, c in enumerate(s):
        o = ord(c)
        if o in _MARKS:
            continue
        c2 = _SUB.get(o, c)
        if c2 == '':
            continue
        if 0x0621 <= ord(c2) <= 0x064A:
            norm.append(c2)
            idx.append(i)
        else:
            if norm and norm[-1] != ' ':
                norm.append(' ')
                idx.append(i)
    while norm and norm[-1] == ' ':
        norm.pop()
        idx.pop()
    return ''.join(norm), idx
