#!/usr/bin/env python3
"""
Repairs the bracket GLYPH on Qur'anic quotations. Never the span, never a letter.

THE EVIDENCE. Across the 56 lesson bodies the edition closes 13,899 spans with
( ), 1,228 with « », and 207 with { } -- and 173 of those 207 are in Lesson 7
alone. Outside Lesson 7 the corpus holds 1,359 '{' against 124 '}'. An opener
that almost never closes is not a convention; it is the scan misreading '('.
Lesson 7 is the one lesson whose body came from AK's verified "Citations Fixed"
document rather than the scan, and there { } pairs 173 times, cleanly, around
well-pointed Qur'anic text. So Lesson 7 is excluded outright.

TWO KINDS OF REPAIR, and they are not equally safe.

  DELETION of a doubled opener -- "({", "{(", "{{" with nothing but space
  between -- is unambiguous. The scan printed one opener twice. Removing the
  brace cannot invent a quotation, cannot move a boundary, and cannot change
  which characters fall inside the span. This runs by default.

  CONVERSION of "{X)" to "(X)" is a judgement, and an adversarial read of all
  1,062 candidates found it wrong often enough to gate. It assumes the ')' at
  the end of the span belongs to the '{' and not to some earlier unclosed '('.
  Usually true; not always. Worse, it assumes the span itself is sound, and
  the span is exactly what this script promises not to look at: where the scan
  has dropped a footnote or a paragraph of the Shaykh's spoken commentary into
  the middle of an aya, fixing the glyph turns a visibly broken quotation into
  a clean-looking false one that attributes al-Durr al-Manthur, or a lexical
  note from the Lisan, to the Qur'an. Conversion therefore runs only under
  --convert, and only on spans that survive every guard below.

WHAT THE GUARDS REJECT, each because a reader found a real case:

  bare prose inside the span. The edition points its Qur'an heavily and its
      commentary not at all, so a stretch carrying no vowels is prose that does
      not belong inside a quotation. Measured two ways: the lowest count of
      combining marks in any 24-letter window (median across candidate spans is
      18; every span an adversarial reader flagged sits at 4 or below, and the
      nearest unflagged one at 10, so the line is drawn at 7), and, for spans
      too short to window, a run of 22 unpointed letters. Together these catch
      the footnote buried in Q 34:1 at L41, the Lisan note inside Q 11:88 at
      L26, the ninety characters of preaching inside Q 36:71 at L42, and the
      commentary clause inside Q 80:25 at L54, which the run test alone missed
      because the divine name is pointed and kept resetting the run.
  any newline. splitArabicCommentary splits arabicBody on every '\n', so a
      span crossing one cannot exist as a span downstream: the repair would
      leave an unmatched '(' ending one rendered paragraph and an orphan ')'
      opening the next. The brace at least marks the text as damaged.
  over 300 characters. Both spans this catches are ayat split by an imported
      footnote, and in one the closing ')' is a printed page number that
      drifted into the sentence.
  a site named in HAND_EXCLUDED. Two spans where the ')' demonstrably closes an
      earlier '(' because no gloss separates them -- the quotation is one
      continuous phrase and the brace is a stray mark inside it.

STILL NOT TOUCHED, and deliberately:

  "«X)" and "(X»" (154). Both « » and ( ) are real delimiters here, so one
      glyph is right and reading is the only way to learn which.
  "{X}". Balanced. A balanced span misleads nobody.
  an opener with no closer anywhere, and a closer with no opener. Repairing
      those means deciding where a quotation ends, which is an editorial
      judgement about the text rather than about a glyph.
  '*'. The scan uses it as a fourth delimiter glyph -- "(وَالْحِكْمَةُ * سُنة
      النبي" wants ')' at the asterisk -- but '*' also carries Markdown bold on
      the sura headers, so it needs its own pass with its own evidence.

  python3 scripts/repair-quotation-brackets.py                 # dry run, deletions
  python3 scripts/repair-quotation-brackets.py --convert       # dry run, both
  python3 scripts/repair-quotation-brackets.py --convert --write
"""
import argparse, json, re, unicodedata
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import repair_anchors as A

DATA = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'lessons'
BRACKETS = '(){}«»﴿﴾'
TOK = re.compile('[' + re.escape(BRACKETS) + ']')
OPENER = {'(': ')', '«': '»', '{': '}', '﴿': '﴾'}

CONVERT = {('{', ')'): ('(', ')'), ('(', '}'): ('(', ')')}
DOUBLED_OPENERS = {'(', '{'}          # a '{' right after one of these is a duplicate

HAND_EXCLUDED_LESSONS = {7}
MAX_SPAN = 300
MAX_BARE_RUN = 22
MIN_MARK_DENSITY = 8      # marks per 24-letter window; below this the span is prose
DENSITY_WINDOW = 24

# The two braces that must NOT become parentheses: in each the ')' closes an
# earlier '(' because the quotation runs on without a gloss between them.
#   L10 "(و اتقوا { الأَرْحَامَ)"          -- 'و اتقوا' glosses nothing
#   L51 "(مِنْ حَيْثُ سَكَنت {مِنْ وَجْدِكُمْ)" -- Q 65:6 is one unbroken phrase
# Named by the words around the brace, not by an offset. The L51 site was
# keyed to offset 36696 and the brace stands at 36694: the exclusion had
# stopped matching and the span had been converted in spite of it. An
# exclusion that silently never fires is the worst shape this bug takes,
# because nothing in the output says so.
HAND_EXCLUDED = [
    (10, 19981,
     ['06280627064406440647', '0648062706460634062f0643', '06280627064406440647', '0648', '0627062a064206480627'],
     ['0627064406270631062d06270645', '06270646', '062a064206370639064806470627060c', '064806430627064606480627', '064a062a064606270634062f06480646']),
    (51, 36694,
     ['0627063306430646064806470646', '0627064406450637064406420627062a', '06450646', '062d064a062b', '063306430646062a'],
     ['06450646', '0648062c062f06430645', '062706440645063106270647', '062706300627', '063706440642062a']),
]

MARKS = set('ؘؙؚؐؑؒؓؔؕؖؗ')


def bare_run(s):
    """Longest run of Arabic letters carrying no vowel or other combining mark."""
    longest = run = 0
    for ch in s:
        if unicodedata.combining(ch) or ch in MARKS:
            run = 0
            continue
        if 'ء' <= ch <= 'ي':
            run += 1
            longest = max(longest, run)
        elif ch.isspace():
            pass
        else:
            run = 0
    return longest


def mark_density(s, win=DENSITY_WINDOW):
    """Fewest combining marks in any window of `win` Arabic letters, or None
    if the span holds fewer letters than the window."""
    per = []
    for ch in s:
        if unicodedata.combining(ch) or ch in MARKS:
            if per:
                per[-1] += 1
        elif '\u0621' <= ch <= '\u064A':
            per.append(0)
    if len(per) < win:
        return None
    run = sum(per[:win])
    best = run
    for i in range(win, len(per)):
        run += per[i] - per[i - win]
        best = min(best, run)
    return best


def resolve_exclusions(body, lesson):
    """Character offsets of this lesson's hand-excluded braces, found by the
    words around them.  Raises if one has gone missing or matches twice."""
    out = set()
    for les, hint, lead, tail in HAND_EXCLUDED:
        if les != lesson:
            continue
        out.add(A.locate(body, '{', [A.hx(x) for x in lead],
                         [A.hx(x) for x in tail], A.CONTEXT, hint,
                         f'L{les} hand-excluded brace'))
    return out


def repair(body, lesson, convert):
    toks = list(TOK.finditer(body))
    excluded = resolve_exclusions(body, lesson)
    edits, deletions, conversions, skipped = [], [], [], []
    for k, t in enumerate(toks):
        ch = t.group()
        if ch not in OPENER:
            continue

        # 1. doubled opener -- always safe, always applied
        if ch == '{' and k > 0 and toks[k - 1].group() in DOUBLED_OPENERS \
           and body[toks[k - 1].end():t.start()].strip() == '':
            edits.append((t.start(), None))
            deletions.append((t.start(), body[toks[k - 1].start():t.start() + 60]))
            continue

        if k + 1 >= len(toks):
            continue
        nxt = toks[k + 1]
        pair = (ch, nxt.group())
        if pair not in CONVERT:
            continue
        span = body[t.start():nxt.end()]
        why = None
        if t.start() in excluded:
            why = 'hand-excluded: the closer belongs to an earlier opener'
        elif len(span) > MAX_SPAN:
            why = f'span over {MAX_SPAN} chars'
        elif '\n' in span:
            why = 'span crosses a line break'
        elif (d := mark_density(span)) is not None and d < MIN_MARK_DENSITY:
            why = f'only {d} marks in a 24-letter window -- prose inside the span'
        elif bare_run(span) >= MAX_BARE_RUN:
            why = f'{bare_run(span)} undiacriticised chars inside the span'
        if why:
            skipped.append((t.start(), pair, why, span[:110]))
            continue
        if not convert:
            skipped.append((t.start(), pair, 'conversion not requested', span[:110]))
            continue
        o, c = CONVERT[pair]
        if ch != o:
            edits.append((t.start(), o))
        if nxt.group() != c:
            edits.append((nxt.start(), c))
        conversions.append((t.start(), pair, span[:110]))

    if not edits:
        return body, deletions, conversions, skipped
    out = list(body)
    for idx, chv in edits:
        out[idx] = '' if chv is None else chv
    return ''.join(out), deletions, conversions, skipped


def strip_brackets(s):
    return TOK.sub('', s)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--convert', action='store_true')
    ap.add_argument('--write', action='store_true')
    ap.add_argument('--report', default=None)
    a = ap.parse_args()

    nd = nc = ns = 0
    lines = []
    for i in range(1, 57):
        p = DATA / f'{i:02d}.json'
        L = json.loads(p.read_text(encoding='utf-8'))
        if i in HAND_EXCLUDED_LESSONS:
            lines.append(f'L{i:02d}  excluded by hand (body is verified, not scanned)')
            continue
        body = L.get('arabicBody') or ''
        new, dele, conv, skip = repair(body, i, a.convert)
        if not (dele or conv or skip):
            continue
        # INVARIANT: outside the bracket glyphs themselves, not one character moves.
        assert strip_brackets(body) == strip_brackets(new), f'L{i} changed a non-bracket character'
        nd += len(dele); nc += len(conv); ns += len(skip)
        lines.append(f'L{i:02d}  {len(dele)} deleted, {len(conv)} converted, {len(skip)} left alone')
        for off, txt in dele:
            lines.append(f'     DELETE duplicate opener @{off}  {txt}')
        for off, pair, txt in conv:
            lines.append(f'     CONVERT {pair[0]}…{pair[1]} @{off}  {txt}')
        for off, pair, why, txt in skip:
            lines.append(f'     LEFT ALONE ({why}) {pair[0]}…{pair[1]} @{off}  {txt}')
        if a.write:
            L['arabicBody'] = new
            # These files are stored as one line, no indent, no trailing
            # newline. json.dumps with the default separators round-trips all
            # fifty-six byte-for-byte, so writing this way leaves a diff that
            # shows the repair and nothing else; indent=2 would rewrite every
            # line of every file and bury it.
            p.write_text(json.dumps(L, ensure_ascii=False), encoding='utf-8')

    hdr = (f'{nd} duplicate openers deleted, {nc} spans converted, '
           f'{ns} left alone. Lesson 7 excluded.')
    print(hdr)
    if a.report:
        Path(a.report).write_text(hdr + '\n\n' + '\n'.join(lines) + '\n', encoding='utf-8')
        print('report ->', a.report)
    if a.write:
        print('WRITTEN')


if __name__ == '__main__':
    main()
