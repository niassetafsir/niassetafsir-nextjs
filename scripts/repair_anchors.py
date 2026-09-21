#!/usr/bin/env python3
"""Content anchors for the lesson-repair scripts.

WHY THIS EXISTS

Every repair script used to identify its sites by a raw character offset into
`arabicBody` or `arabicFootnotes`.  That works only while every write preserves
length.  Nine scripts came to share that contract and nothing enforced it: one
inserted character anywhere would have shifted every later row in that field,
and the assert would have fired on the wrong site -- or, worse, matched a
different word that happened to look right.  It also put a whole class of
damage out of reach, because a dropped letter cannot be restored without
changing a length.

A row is now identified by its CONTENT and its NEIGHBOURHOOD:

    field, old, new, lead, tail, hint

  old / new  the target word before and after the repair, as codepoints
  lead/tail  the raw skeletons of the words either side of it, as they stood
             when the anchor was minted
  hint       the character offset the row used to carry.  It is a hint: it
             orders the search and it is printed in reports.  It is never the
             identity, and a row resolves correctly when it is wrong.

WHY ANCHORS AND NOT A SNAPSHOT

The alternative was to keep offsets and have each script resolve its whole
table against one snapshot, applying in descending order.  That is safe within
a single run and worthless across runs: nine scripts edit the same two fields
one after another, so the moment the first inserts a character the fifth's
offsets are stale.  Since the point of the change is to ALLOW insertions and
deletions, only an identity that survives another script's edit will do.
Descending application is still used, but as the mechanic inside one run, not
as the identity.

AMBIGUITY IS AN ERROR, NEVER A CHOICE

Several rows exist precisely because a form occurs more than once and only one
occurrence is wrong -- `tuhibbi` is sound in Lesson 12 and damage in Lesson 7.
resolve() therefore scores EVERY occurrence of the word in the field and
requires exactly one to clear the threshold.  Two clearing it raises
AmbiguousAnchor; none raises AnchorLost.  It never picks the best.
"""
import difflib

MARKS = set(range(0x64B, 0x660)) | {0x640, 0x670, 0x6E1, 0x61F} \
      | set(range(0x6D6, 0x6ED)) | set(range(0x8F0, 0x900)) \
      | {0x200F, 0x200E, 0x61C}
ALIF, WAW, YA, HA = chr(0x627), chr(0x648), chr(0x64A), chr(0x647)
ORTHO = {chr(0x623): ALIF, chr(0x625): ALIF, chr(0x622): ALIF, chr(0x671): ALIF,
         chr(0x649): YA, chr(0x629): HA, chr(0x624): WAW, chr(0x626): YA,
         chr(0x6D2): YA, chr(0x6D3): YA}
DROP = {chr(0x621)}
AR_LO, AR_HI = 0x600, 0x6FF

CONTEXT = 5        # words of lead and of tail stored in an anchor
NEAR    = 3        # of those, the immediate ones that must nearly all match
NEED    = 7        # of the (up to) 10 that must match for a candidate to count


class AnchorLost(Exception):
    """No occurrence of the word carries the recorded neighbourhood."""


class AmbiguousAnchor(Exception):
    """More than one occurrence does.  Never resolved by preference."""


def raw(s):
    return ''.join(ORTHO.get(c, c) for c in s
                   if ord(c) not in MARKS and c not in DROP)


def words(s):
    """[(char offset, text)] over maximal Arabic-letter runs, marks kept inside."""
    out, start, cur = [], None, []
    for i, ch in enumerate(s):
        o = ord(ch)
        if o in MARKS or ch in DROP:
            if cur:
                cur.append(ch)
            continue
        if AR_LO <= o <= AR_HI:
            if not cur:
                start = i
            cur.append(ch)
        else:
            if cur:
                out.append((start, ''.join(cur).rstrip()))
                cur = []
    if cur:
        out.append((start, ''.join(cur).rstrip()))
    return [(a, b) for a, b in out if raw(b)]


def hx(cps):
    return ''.join(chr(int(cps[i:i + 4], 16)) for i in range(0, len(cps), 4))


def forms(text):
    """A row's accepted starting forms.

    Normally one.  A row whose repair has since been CORRECTED lists the
    superseded form after a '|', so that the pipeline can carry a tree already
    holding the old repair forward to the new one.  Without this, replaying
    from a commit that contains a repair this table has since revised is
    impossible, and 'every change must be reproducible by running a script'
    becomes unenforceable the first time anyone fixes a repair."""
    return text.split('|')


def cp(text):
    return ''.join('%04x' % ord(c) for c in text)


def mint(text, off, old):
    """Anchor for the word `old` standing at character offset `off`."""
    W = words(text)
    idx = next((n for n, (o, _) in enumerate(W) if o == off), None)
    if idx is None:
        raise AnchorLost(f'no word starts at {off}')
    if W[idx][1][:len(old)] != old:
        raise AnchorLost(f'@{off} holds {cp(W[idx][1])}, not {cp(old)}')
    lead = [raw(w) for _, w in W[max(0, idx - CONTEXT):idx]]
    tail = [raw(w) for _, w in W[idx + 1:idx + 1 + CONTEXT]]
    return lead, tail


def _match(stored, have):
    """How much of `stored` survives in `have`, order preserved.  difflib and
    not a positional compare, so that a neighbour word splitting in two -- or
    a dropped letter changing one -- costs one point instead of shifting the
    whole sequence out of alignment."""
    if not stored:
        return 0, 0
    sm = difflib.SequenceMatcher(None, stored, have, autojunk=False)
    return sum(b.size for b in sm.get_matching_blocks()), len(stored)


def _clears(stored_lead, stored_tail, have_lead, have_tail):
    """Score one candidate against a minted neighbourhood.

    Two tests, both of which must pass.

    NEAR -- the three words either side.  This is what tells two occurrences
    of the same word apart when they stand a few words from each other, which
    a wide window cannot do: widen far enough and both copies see almost the
    same context.

    FAR -- the whole stored window, at 70%.  This is what survives another
    script editing the neighbourhood, which is the reason anchors exist.

    There is deliberately no exact-match tier.  A tier that returns the
    perfect matches and discards everything else is a preference, and a
    preference is the one thing this module promises never to apply: if a
    degraded true site and an intact decoy both clear, that is an ambiguity to
    raise, not a contest to settle.
    """
    # The word immediately before or immediately after must match exactly.
    # Nothing else separates a quoted word from the gloss repeating it one
    # word later -- Lesson 14 has `yuqattaluu yuqtaluu`, the aya then its
    # gloss, and a window wide enough to be robust sees almost the same text
    # on both.  An edit would have to land on BOTH immediate neighbours to
    # lose the site, which no single repair does.
    lhs = bool(stored_lead) and bool(have_lead) and stored_lead[-1] == have_lead[-1]
    rhs = bool(stored_tail) and bool(have_tail) and stored_tail[0] == have_tail[0]
    if not (lhs or rhs):
        return 0, 0, False
    nl, nt = stored_lead[-NEAR:], stored_tail[:NEAR]
    a, ca = _match(nl, have_lead[-NEAR:] if have_lead else [])
    b, cb = _match(nt, have_tail[:NEAR])
    near, near_cap = a + b, ca + cb
    if not near_cap or near < max(1, near_cap - 2):
        return near, near_cap, False
    a, ca = _match(stored_lead, have_lead)
    b, cb = _match(stored_tail, have_tail)
    s, c = a + b, ca + cb
    return s, c, bool(c) and s >= max(min(NEED, c), int(c * 0.7))


def _cands(RW, ns, lead, tail, width, pairs=frozenset()):
    out = []
    for n in ns:
        step = 2 if n in pairs else 1
        hl = RW[max(0, n - width):n]
        ht = RW[n + step:n + step + width]
        s, c, ok = _clears(lead, tail, hl, ht)
        if ok:
            out.append((n, s, c))
    return out


def plan(text, rows, label=''):
    """Resolve every row against ONE snapshot of `text`.

    rows: [(old, new, lead, tail, width, mult, hint, note)].  Rows sharing an
    anchor form a group: the group must name exactly as many places as it has
    rows, which is how a passage repeated verbatim in one field is handled
    without ever choosing between its copies.  Returns [(offset, old, new,
    hint, note)]."""
    W = words(text)
    RW = [raw(w) for _, w in W]
    occ = {}
    for n, r in enumerate(RW):
        occ.setdefault(r, []).append(n)
    # A repair that inserts a space turns one word into two, so the site has
    # to be findable in either state.  Index adjacent pairs under their
    # concatenation, and remember how far the pair reaches.
    pairs = set()
    for n in range(len(W) - 1):
        j = RW[n] + RW[n + 1]
        occ.setdefault(j, []).append(n)
        pairs.add(n)
    groups = {}
    for r in rows:
        old, new, lead, tail, width, mult, hint, note = r
        groups.setdefault((old, new, tuple(lead), tuple(tail), width), []).append(r)
    out = []
    for key, grp in groups.items():
        old, new, lead, tail, width = key
        keys = {raw(new), raw(new).replace(' ', '')}
        keys |= {raw(f) for f in forms(old)}
        ns = sorted({n for k in keys for n in occ.get(k, [])})
        pr = {n for n in ns if n < len(RW) - 1 and
              RW[n] + RW[n + 1] in keys and RW[n] not in keys}
        scored = _cands(RW, ns, list(lead), list(tail), width, pr)
        cand = [n for n, _, _ in scored]
        hints = ', '.join(f'@{r[6]}' for r in grp)
        mults = {r[5] for r in grp}
        if mults != {len(grp)}:
            raise AmbiguousAnchor(
                f'{label}: {len(grp)} row(s) ({hints}) share an anchor but '
                f'declare mult {sorted(mults)}. A row of a duplicated passage '
                f'has been added or removed without its partner.')
        if not cand:
            raise AnchorLost(
                f'{label}: {cp(old)} with this neighbourhood is no longer in '
                f'the text (was {hints}) -- the text has moved under this row')
        if len(cand) != len(grp):
            where = ', '.join(f'@{W[n][0]} (score {s}/{c})' for n, s, c in scored)
            raise AmbiguousAnchor(
                f'{label}: {len(grp)} row(s) ({hints}) but the anchor names '
                f'{len(cand)} place(s) -- {where}. Refusing to choose; '
                f'widen the anchor.')
        for r, n in zip(sorted(grp, key=lambda x: x[6]), cand):
            start = W[n][0]
            end = W[n + 1][0] + len(W[n + 1][1]) if n in pairs and \
                RW[n] + RW[n + 1] in keys and RW[n] not in keys \
                else start + len(W[n][1])
            out.append((start, r[0], r[1], r[6], r[7], end - start))
    return out


def apply_rows(text, rows, label=''):
    """plan(), then write descending so one edit cannot move the next.

    Returns (text, applied, skipped, log)."""
    steps = plan(text, rows, label)
    applied = skipped = 0
    log = []
    for off, old, new, hint, note, span in sorted(steps, key=lambda r: -r[0]):
        # Already applied?  LITERALLY, character for character, over the row's
        # own extent.  A skeleton comparison would skip any row whose repair
        # leaves the skeleton alone -- a hamza seat, a transposition, a mark --
        # before it ever fired.  The extra clause is for a repair that SHORTENS
        # a word: `yasha\'a` is a prefix of `yasha\'ah`, so a bare prefix test
        # would read the damage as the repair.
        olds = forms(old)
        is_new = text[off:off + len(new)] == new
        hit = next((o for o in olds if text[off:off + len(o)] == o), None)
        if is_new and not (hit is not None and len(new) < len(hit)):
            skipped += 1
            continue
        if hit is None:
            raise AnchorLost(
                f'{label} (hint @{hint}) resolved to {off}, which holds '
                f'{cp(text[off:off + 12])} -- none of '
                f'{old} nor {cp(new)}. The text has moved.')
        text = text[:off] + new + text[off + len(hit):]
        applied += 1
        log.append((hint, off, old, new, note))
    return text, applied, skipped, log


def locate(text, char, lead, tail, width, hint, label=''):
    """Offset of a single non-letter marker (a brace, a bracket) named by the
    words around it.  Same contract: exactly one, or it raises."""
    W = words(text)
    RW = [raw(w) for _, w in W]
    cand = []
    for i, ch in enumerate(text):
        if ch != char:
            continue
        after = next((n for n, (o, _) in enumerate(W) if o > i), len(W))
        hl = RW[max(0, after - width):after]
        ht = RW[after:after + width]
        if _clears(lead, tail, hl, ht)[2]:
            cand.append(i)
    if not cand:
        raise AnchorLost(f'{label}: no {char!r} carries this neighbourhood '
                         f'(hint @{hint})')
    if len(cand) > 1:
        raise AmbiguousAnchor(f'{label}: {char!r} with this neighbourhood '
                              f'stands at {cand}. Refusing to choose.')
    return cand[0]
