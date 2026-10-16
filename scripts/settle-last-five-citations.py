"""The last five Qur'anic spans in Lessons 1-8, settled by hand.

No rule covers these. Each is decided by the commentary standing around it,
and each decision is written out so it can be checked or reversed. Spans are
located by a distinctive fragment and replaced whole, since the literal text
carries page-break newlines and doubled spaces.
"""
import json, io, sys, re
V = json.loads(io.open('src/data/verse_text.json', encoding='utf-8').read())
def ar(k):
    v = V.get(k); return v['ar'] if isinstance(v, dict) else v
def w(k, a, b): return ' '.join(ar(k).split()[a:b])

EDITS = [
 (1, 'أَلَمّ', r'\(بِسْمِ[^)]*أَلَمّ\)',
     '(' + ar('1:1') + ' ' + ar('2:1') + ')',
     'basmala + Q 2:1. The span sits under the heading "Surat al-Baqara, two '
     'hundred and eighty-six ayat" and is glossed "Allah knows best what He '
     'intends", the standard gloss on the muqatta\'at. No candidate proposed '
     'Q 2:1 because the basmala in front dragged the match to 27:30.'),
 (4, 'جَفْلْنَا', r'\(جَفْلْنَا[^)]*\)',
     '(' + w('2:65', 7, 12) + ')',
     'Q 2:65 fa-qulna. The prose before it has the people of Ayla '
     'transgressing the Sabbath by catching fish, which is 2:65 and not '
     '7:166; and the scan\'s five letters fit fa-qulna, where qulna has four.'),
 (5, 'الأهَرَ', r'\(لاَ إلّة\s*الأهَرَ[^)]*\)',
     '(' + w('2:163', 3, 9) + ')',
     'Q 2:163. The lemma before it is "ilahun wahid", glossed "no peer to Him '
     'in His essence or His attributes". "al-ahara" is "illa huwa" run '
     'together, which is why the token count looked short.'),
 (6, 'الْحَ الَنِيه', r'\(وَمِنَ النَاس[^)]*الَنِيه\)',
     '(' + w('2:204', 0, 8) + ')',
     'Q 2:204 entire to al-dunya. The commentary after it names al-Akhnas b. '
     'Shariq, its occasion. The scan lost "fi" and mangled "al-hayat '
     'al-dunya" into two tokens, so a seven-word window dropped al-dunya.'),
 (8, 'من خلقك ووَتَنزِعُ', r'\(الْمَلْكَ مَن تَشَاء[^)]*\)',
     '(' + w('3:26', 5, 8) + ') من خلقك (' + w('3:26', 8, 12) + ')',
     'Q 3:26, split in two. Niasse\'s gloss "min khalqika" sits inside the '
     'bracket and the doubled waw marks where the scan ran the second lemma '
     'into it. Both lemmata are restored and the gloss put back outside, '
     'where the lemma-gloss pattern of the surrounding text puts it.'),
]
write = '--write' in sys.argv
ok = 0
for lid, probe, pat, new, why in EDITS:
    fn = 'src/data/lessons/%02d.json' % lid
    L = json.loads(io.open(fn, encoding='utf-8').read())
    b = L['arabicBody']
    ms = list(re.finditer(pat, b))
    print('L%d  matches=%d' % (lid, len(ms)))
    print('   %s' % why)
    if len(ms) != 1:
        print('   REFUSED: expected exactly one match\n'); continue
    print('   was: %s' % ms[0].group(0).replace('\n', ' / '))
    print('   now: %s' % new)
    ok += 1
    if write:
        L['arabicBody'] = b[:ms[0].start()] + new + b[ms[0].end():]
        io.open(fn, 'w', encoding='utf-8').write(json.dumps(L, ensure_ascii=False))
        print('   written')
    print()
print('%d of %d ready' % (ok, len(EDITS)))
