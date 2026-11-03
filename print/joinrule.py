# -*- coding: utf-8 -*-
"""Whether a separator space belongs between two adjacent runs.

The translation stores each paragraph as a list of register-marked runs that
carry no separators of their own, so the builder supplies them. Joining
unconditionally with a space puts one before every comma that follows an
italicised term -- "tafsir , because" -- and after every opening bracket,
"( adad )". 331 of those in Lessons 1-8.
"""
NO_SPACE_BEFORE = set(',.;:?!)]}»”’%…')      # closing punctuation
NO_SPACE_AFTER = set('([{«“‘')               # opening punctuation


def needs_space(prev, nxt):
    if not prev or not nxt:
        return False
    if prev[-1].isspace() or nxt[0].isspace():
        return False
    if nxt[0] in NO_SPACE_BEFORE:
        return False
    if prev[-1] in NO_SPACE_AFTER:
        return False
    return True
