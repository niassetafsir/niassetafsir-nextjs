#!/usr/bin/env python3
"""Re-cut the al-Mishrī excerpts on the verse pages from the printed page.

The excerpts already in corpus.json were sliced out of a flat text dump of
qanabil_yadawiyya_original.pdf. That dump reads the two-column bilingual page
as one stream, so English and Arabic lines interleave word by word, and the
262-character windows cut from it open and close mid-word. One of them reached
the live site reading

    "In Defense of the Spiritual Path of the Sufis 38 Manifest, and the Hidden"

-- a running head bled into the quotation.

pdftotext -layout keeps the columns apart. This script takes that extraction,
drops the Arabic column, the running heads, the page numbers and the
translators' footnotes, repairs the hyphenated line wraps, and then cuts each
excerpt at sentence boundaries around the Qurʾānic citation the locus was
recorded for.

Nothing is written unless the excerpt passes every check below. A locus that
fails keeps whatever it has and is named in the report, because a mangled
quotation is worse than no quotation.

The Qanābil translation is Nardella and Wood-Smith's and is under their
copyright, unlike Fī Riyāḍ. The cap of 700 characters is deliberate: these are
short quotations under citation, not a reproduction of the text.

    python3 scripts/extract-mishri-excerpts.py            # report only
    python3 scripts/extract-mishri-excerpts.py --write    # update corpus.json
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / 'src/data/mishri/qanabil_yadawiyya_original.pdf'
CORPUS = ROOT / 'src/data/corpus.json'
STREAM = ROOT / 'src/data/mishri/qanabil_english_column.txt'

ARABIC = re.compile(r'[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]')
BIDI = re.compile(r'[​‎‏‪-‮⁦-⁩]')
RUNNING_HEAD = 'In Defense of the Spiritual Path'
SENTENCE_END = re.compile(r'[.!?][”"’\']?\s')

MIN_CHARS, MAX_CHARS, PAD = 110, 700, 560


ARABIC_RUN = re.compile(r'[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+(?:[\s\u0640،؛؟﴿﴾"]*[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+)*')


def latin_side(line: str) -> str:
    """Drop the Arabic column, keep the English one.

    Cutting the line at its first Arabic character is the obvious rule and it
    is wrong twice over. al-Mishrī quotes single Arabic words inside English
    sentences, so cutting there swallows the rest of the sentence: one excerpt
    came out reading "as shown by the use of Therefore, when He says", where
    the printed line is "as shown by the use of مِن meaning 'part of.'"

    Splitting on the gutter is wrong too, because the gutter is sometimes a
    single space -- three English quotations lost their second half that way.

    What holds across the book is that the Arabic column runs to the end of the
    line. So cut at the last Arabic run when nothing Latin follows it, and keep
    every Arabic word that has English on both sides.
    """
    # Cut at the earliest Arabic run with no English after it anywhere. Taking
    # the last run instead leaves the column's own Arabic behind whenever it
    # contains a Latin colon, which the Arabic question headings all do.
    for run in ARABIC_RUN.finditer(line):
        if not re.search(r'[A-Za-z]', line[run.start():]):
            line = line[:run.start()]
            break
    line = ARABIC_RUN.sub(lambda m: ' ' + m.group(0).strip() + ' ', line)
    # A line of the Arabic column often carries one Latin mark -- the colon of
    # ":الجواب", a full stop. With the Arabic gone it would drop a stray ".:"
    # into the middle of an English sentence.
    return line if re.search(r'[A-Za-z0-9]', line) else ''


def english_column() -> str:
    """The English half of the page, in reading order."""
    dump = subprocess.run(['pdftotext', '-layout', str(PDF), '-'],
                          capture_output=True, text=True, check=True).stdout
    pages = []
    for page in dump.split('\f'):
        lines = []
        for line in page.split('\n'):
            line = BIDI.sub('', line)
            line = latin_side(line).rstrip()
            if RUNNING_HEAD in line:
                continue
            if re.fullmatch(r'\s*\d{1,3}\s*', line):
                continue
            lines.append(line)
        # The translators' footnotes sit under the columns. They are their
        # words, not al-Mishrī's, and must not drift into a quotation.
        for i, line in enumerate(lines):
            if re.match(r'^\s{0,4}\d{1,2}\s+[A-Z“]', line) and i > len(lines) * 0.55:
                lines = lines[:i]
                break
        pages.append('\n'.join(lines))
    text = '\n'.join(pages)
    text = re.sub(r'(\w)-\s*\n\s*(\w)', r'\1\2', text)   # repair line wraps
    text = re.sub(r'\s*\n\s*', ' ', text)
    text = re.sub(r'\s+"\s+', ' ', text)
    text = re.sub(r'\s+([,.;:?!])', r'\1', text)
    # A line of the Arabic column reduced to a bare full stop lands in the
    # middle of an English sentence: "inform all of you about what. you used
    # to do". Every one of the twenty-four in this book is spurious.
    text = re.sub(r'([,;:])\.(?=\s)', r'\1', text)
    text = re.sub(r'(?<=[a-z]{3})\.(?=\s+[a-z])', '', text)
    return re.sub(r'\s+', ' ', text).strip()


def sentence_start(text: str, before: int, floor: int):
    marks = list(SENTENCE_END.finditer(text[floor:before]))
    return floor + marks[-1].end() if marks else None


def excerpt(text: str, a: int, b: int) -> str:
    end = SENTENCE_END.search(text, b)
    e = end.end() if end else b
    # A full stop inside a quotation is not the end of the sentence carrying
    # it. Keep going while the quotation marks are still open.
    while text[a:e].count('“') != text[a:e].count('”') and e - b < PAD:
        nxt = SENTENCE_END.search(text, e)
        if not nxt:
            break
        e = nxt.end()
    s = sentence_start(text, a, max(0, a - PAD)) or a
    while e - s < 250:                    # one sentence is often too little
        earlier = sentence_start(text, s - 1, max(0, e - PAD))
        if earlier is None or earlier >= s:
            break
        s = earlier
    return re.sub(r'\s+', ' ', text[s:e]).strip()


def faults(quote: str) -> list:
    bad = []
    arabic = sum(bool(ARABIC.match(c)) for c in quote)
    if arabic > 40 or arabic > len(quote) * 0.12:
        bad.append('arabic-bleed')
    if len(quote) < MIN_CHARS:
        bad.append('short')
    if len(quote) > MAX_CHARS:
        bad.append('over-length')
    if re.search(r"\(Qur[’'‘]?an\s*\(", quote):
        bad.append('doubled-citation')
    if re.search(r'[a-z]-\s+[a-z]', quote):
        bad.append('broken-wrap')
    if quote.count('(') != quote.count(')'):
        bad.append('unbalanced-parens')
    if quote.count('“') != quote.count('”'):
        bad.append('unbalanced-quotes')
    return bad


def main() -> int:
    text = english_column()
    STREAM.write_text(text)

    corpus = json.loads(CORPUS.read_text())
    links = {v['locusId']: v for v in corpus['verseLinks']
             if v['locusId'].startswith('qanabil')}
    loci = [l for l in corpus['loci'] if l['id'].startswith('qanabil')]

    cut, report, cursor = {}, [], 0
    for locus in loci:
        link = links[locus['id']]
        s, a = link['surah'], link['ayahStart']
        # Two verses are cited inside one parenthesis ("41:46 & 45:15"), so the
        # second alternative catches the locus recorded for the second of them.
        pattern = re.compile(
            r"\(Qur[’'‘]?an\s*%d\s*:\s*%d\b[^)]{0,30}\)"
            r"|\(Qur[’'‘]?an\s*\d{1,3}:\d{1,3} & %d:%d\)" % (s, a, s, a))
        found = pattern.search(text, cursor) or pattern.search(text)
        if not found:
            report.append((locus['id'], ['citation-not-found'], 0))
            continue
        cursor = found.end()
        quote = excerpt(text, found.start(), found.end())
        bad = faults(quote)
        report.append((locus['id'], bad, len(quote)))
        if not bad:
            cut[locus['id']] = quote

    for locus_id, bad, n in report:
        print(f"{locus_id:<18} {','.join(bad) or 'clean':<24} {n:>4}")
    print(f"\n{len(cut)} of {len(loci)} excerpts pass")

    if '--write' in sys.argv:
        for locus in loci:
            if locus['id'] in cut:
                locus['textEn'] = cut[locus['id']]
                # transcriptionStatus grades the Arabic; these loci carry
                # none, so 'draft' printed a warning about a transcription
                # that does not exist here.
                locus['transcriptionStatus'] = 'none'
        CORPUS.write_text(json.dumps(corpus, ensure_ascii=False, indent=2))
        print(f"wrote {len(cut)} excerpts to {CORPUS.relative_to(ROOT)}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
