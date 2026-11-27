#!/usr/bin/env python3
"""Import the Mawsūʿa read-through (maḥwar 4, 7, 8, 9) into src/data/corpus.json.

Usage: python3 scripts/import-mawsua.py <uses.csv> [<uses.csv> ...]

Takes the rows in the Working Index's 14-column format and keeps only what
the site shows: his own words (or words reported of him) where he explains,
glosses or argues from a verse, in prose. Rows in verse, the compiler's own
words, copied authorities and bare allusions, formulae and rites stay in the
CSVs. Every passage is a draft transcription.

Then run scripts/name-policy.py src/data/corpus.json (no bare "Niasse").

Run once; re-running replaces the loci it added (ids starting "mawsua4-",
"mawsua7-", "mawsua8", "mawsua9") rather than duplicating them.
"""
import csv
import json
import re
import sys

CORPUS = 'src/data/corpus.json'
SHOW = {'tafsir', 'gloss', 'prooftext', 'juristic'}
WITNESS = {
    '4': 'mawsua-4-khutab-dakhiliyya-print',
    '7': 'mawsua-7-faaliyyat-kharijiyya-print',
    '8': 'mawsua-8-muallafat-print',
    '9': 'mawsua-9-durar-nawadir-print',
}
# Hemistichs: two or more short segments joined by "..." or "/".
VERSE_FORM = re.compile(r'\s*(?:\.\.\.|…|/)\s*')


def is_verse(ar: str) -> bool:
    segs = [s for s in VERSE_FORM.split(ar) if s.strip()]
    return len(segs) >= 2 and all(len(s) < 60 for s in segs)


def ayahs(s: str):
    s = s.replace('-', '–').strip()
    if '–' in s:
        a, b = s.split('–', 1)
        return int(a), int(b)
    return int(s), None


def main(paths):
    corpus = json.load(open(CORPUS))
    added_prefix = ('mawsua4-', 'mawsua7-', 'mawsua8', 'mawsua9')
    corpus['loci'] = [l for l in corpus['loci'] if not l['id'].startswith(added_prefix)]
    corpus['verseLinks'] = [v for v in corpus['verseLinks'] if not v['locusId'].startswith(added_prefix)]
    existing = {l['id'] for l in corpus['loci']}

    loci, links, seen = {}, [], set()
    skipped = {'voice': 0, 'act': 0, 'verse': 0, 'confidence': 0, 'dup': 0, 'edition': 0}
    for path in paths:
        for r in csv.DictReader(open(path, encoding='utf-8')):
            voice = r['Voice']
            if voice.startswith('His own text'):
                v = 'own'
            elif voice.startswith('Reported of him'):
                v = 'reported'
            else:
                skipped['voice'] += 1
                continue
            acts = [a.strip() for a in r['Kind of use'].split(',') if a.strip()]
            if 'poetic' in acts or not (SHOW & set(acts)):
                skipped['act'] += 1
                continue
            ar = r['Arabic'].strip()
            if not ar or is_verse(ar):
                skipped['verse'] += 1
                continue
            if r['Confidence'] == 'possible':
                skipped['confidence'] += 1
                continue
            m = re.search(r'maḥwar (\d)', r['Edition'])
            if not m or m.group(1) not in WITNESS:
                skipped['edition'] += 1
                continue
            try:
                s, (a1, a2) = int(r['Sūra']), ayahs(r['Āya'])
            except ValueError:
                skipped['edition'] += 1
                continue
            key = (s, a1, r['Page'], m.group(1), re.sub(r'[^ء-ي]', '', ar)[:30])
            if key in seen:
                skipped['dup'] += 1
                continue
            seen.add(key)

            lid = r['Locus ID'].strip()
            if lid in existing:
                lid = lid + '-m'
            if lid not in loci:
                page = r['Page'].strip()
                pages = ('pp. ' if '–' in page else 'p. ') + page
                loc = {
                    'id': lid,
                    'witnessId': WITNESS[m.group(1)],
                    'address': {'raw': f"{pages} · {r['Work'].strip()}"},
                    'textAr': ar,
                    'textEn': r['English'].strip(),
                    'transcriptionStatus': 'draft',
                    'voice': v,
                    # The site withholds a summary until AK has verified an
                    # English (src/lib/publicEnglish.ts): Arabic only for now.
                    'editorialNote': 'The English is a summary of how he uses the verse here, not a translation of the passage.',
                }
                if page.split('–')[0].isdigit():
                    loc['address']['page'] = int(page.split('–')[0])
                loci[lid] = loc
            link = {
                'locusId': lid, 'surah': s, 'ayahStart': a1,
                'acts': acts, 'confidence': 'transcribed', 'rasm': 'unknown',
            }
            if a2:
                link['ayahEnd'] = a2
            if r['Note'].strip():
                link['note'] = r['Note'].strip()
            links.append(link)

    corpus['loci'].extend(loci.values())
    corpus['verseLinks'].extend(links)
    for w in corpus['works']:
        if w['id'] == 'mawsua-4-khutab-dakhiliyya':
            # Maḥwar 4 holds the sermons at home and abroad alike.
            w['titleAr'] = 'الخطب'
            w['titleTranslit'] = 'al-Khuṭab'
    with open(CORPUS, 'w', encoding='utf-8') as f:
        json.dump(corpus, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(f'loci {len(loci)}, links {len(links)}, skipped {skipped}')


if __name__ == '__main__':
    main(sys.argv[1:])
