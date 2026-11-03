# -*- coding: utf-8 -*-
"""Close the damaged spans the muṣḥaf settles.

Sixteen of the seventy gaps fall inside a Qurʾānic quotation. For eight the
verse fixes the reading beyond doubt, and three more turn out to hide nothing
at all — the lemma was complete and the scan debris was a bracket or the tail
of a word already rendered. Those are closed here. The rest wait for the
printed page.
"""
import json, io, sys
SRC = '/home/claude/merged-1-8-english.json'
WRITE = '--write' in sys.argv
d = json.load(io.open(SRC, encoding='utf-8'))
G = '[…]'

# lesson, para, run index, replacement runs, verse, why
FIX = [
 (1, 71, 2, [[' ', 'p']], '2:5',
  'the muṣḥaf has only مِّن between عَلَىٰ هُدًى and رَّبِّهِمْ; the lemmata are joined'),
 (4, 20, 7, [], '2:68',
  'تُؤْمَرُونَ ends the verse and the gloss runs straight on; nothing is missing'),
 (4, 29, 10, [[' — the Jews — ', 'p'], ['«you»', 'q'], [' (Q. 2:75)', 'p']], '2:75',
  'أَن يُؤْمِنُوا لَكُمْ: the scan’s ولَتَمْ is لَكُمْ'),
 (5, 39, 7, [['«from»', 'q']], '2:125',
  'وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ; the scan’s ص is this hand’s مِن'),
 (5, 43, 4, [['«and whoever disbelieves»', 'q'], [' — I provide for him ', 'p']], '2:126',
  'قَالَ وَمَن كَفَرَ فَأُمَتِّعُهُ, with the Jalālayn’s أرزقه before أيضا'),
 (5, 63, 3, [['«So if they believe»', 'q']], '2:137',
  'the surviving gloss أي اليهود fixes the gap as the opening of the verse'),
 (6, 8, 2, [['«that you»', 'q']], '2:203',
  'وَاعْلَمُوا أَنَّكُمْ إِلَيْهِ تُحْشَرُونَ; إِلَيْهِ survives after the gap'),
 (6, 78, 14, [], '2:231',
  'only the tail of بِمَعْرُوفٍ and its bracket were lost; the English lemma is already whole'),
]

log = []
for L, n, idx, repl, verse, why in FIX:
    par = [p for p in d[str(L)]['paragraphs'] if p['n'] == n]
    if not par: log.append('NO PARA L%d ¶%d' % (L, n)); continue
    runs = par[0]['runs']
    if idx >= len(runs) or G not in runs[idx][0]:
        log.append('NOT A GAP at L%d ¶%d run %d: %r' % (L, n, idx, runs[idx][0][:40] if idx < len(runs) else None))
        continue
    log.append('L%d ¶%-4d Q %-7s %s' % (L, n, verse, why))
    log.append('      %s → %s' % (G, ''.join(r[0] for r in repl) or '(removed)'))
    if WRITE: runs[idx:idx + 1] = repl

left = sum(1 for L in range(1, 9) for p in d[str(L)]['paragraphs']
           for r in p['runs'] if G in r[0])
print('\n'.join(log))
print('\n%d gaps closed; %d remain' % (len(FIX), left))
if WRITE:
    json.dump(d, io.open(SRC, 'w', encoding='utf-8'), ensure_ascii=False)
    print('written')
