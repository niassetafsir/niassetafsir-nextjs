#!/usr/bin/env python3
"""Run every lesson repair, in order, and say whether the result matches the
working tree.

The rule this enforces: a change to a lesson file that no script reproduces is
a defect, whoever made it and however right it looks.  Three such edits reached
the tree before anyone checked -- a space, a brace, a reworded record -- and
each was found only by replaying.

  python3 scripts/replay-repairs.py            run them, report, change nothing
  python3 scripts/replay-repairs.py --write    run them with --write
  python3 scripts/replay-repairs.py --from-head
        copy the lesson files out of HEAD into a scratch tree, run everything
        there, and diff against the working tree.  Any difference is either a
        hand edit or a script that is not idempotent.
"""
import json, subprocess, sys, tempfile, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LESSONS = ROOT / 'src' / 'data' / 'lessons'

# The order matters: complete-quranic finishes what repair-quranic starts, and
# repair-aya-settled-readings owns sites the earlier passes left half-done.
ORDER = [
    'repair-quranic-letter-confusions.py',
    'complete-quranic-letter-confusions.py',
    'repair-footnote-letter-confusions.py',
    'repair-witnessed-letter-confusions.py',
    'repair-aya-settled-readings.py',
    'repair-ayat-al-kursi.py',
    'repair-divine-names.py',
    'repair-quotation-brackets.py',
]


def run(scripts_dir, write):
    for name in ORDER:
        cmd = [sys.executable, str(scripts_dir / name)] + (['--write'] if write else [])
        r = subprocess.run(cmd, capture_output=True, text=True)
        tail = (r.stdout or r.stderr).strip().splitlines()
        print(f'  {name:<42} {tail[-1][:110] if tail else ""}')
        if r.returncode:
            print(f'  FAILED: {name}')
            return False
    return True


def main():
    write = '--write' in sys.argv
    if '--from-head' not in sys.argv:
        ok = run(ROOT / 'scripts', write)
        sys.exit(0 if ok else 1)

    tmp = Path(tempfile.mkdtemp(prefix='replay-'))
    try:
        (tmp / 'src' / 'data').mkdir(parents=True)
        shutil.copytree(ROOT / 'scripts', tmp / 'scripts')
        shutil.copytree(LESSONS, tmp / 'src' / 'data' / 'lessons')
        for p in sorted((tmp / 'src' / 'data' / 'lessons').glob('*.json')):
            rel = f'src/data/lessons/{p.name}'
            blob = subprocess.run(['git', '-C', str(ROOT), 'show', f'HEAD:{rel}'],
                                  capture_output=True, text=True)
            if blob.returncode == 0:
                p.write_text(blob.stdout, encoding='utf-8')
        print('replaying every repair over the lesson files as HEAD has them:')
        if not run(tmp / 'scripts', True):
            sys.exit(1)
        bad = []
        for p in sorted(LESSONS.glob('*.json')):
            q = tmp / 'src' / 'data' / 'lessons' / p.name
            if p.read_text(encoding='utf-8') != q.read_text(encoding='utf-8'):
                a = json.loads(p.read_text(encoding='utf-8'))
                b = json.loads(q.read_text(encoding='utf-8'))
                fields = [k for k in set(a) | set(b) if a.get(k) != b.get(k)]
                bad.append((p.name, fields))
        print()
        if not bad:
            print('REPLAY CLEAN: every lesson file in the tree is what the '
                  'scripts produce from HEAD.')
        else:
            print(f'REPLAY DIFFERS in {len(bad)} file(s) -- each is a hand edit '
                  f'or a script that is not idempotent:')
            for name, fields in bad:
                print(f'   {name}: {", ".join(fields)}')
        sys.exit(1 if bad else 0)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    main()
