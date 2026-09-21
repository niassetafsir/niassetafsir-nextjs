"""
Six letter confusions settled by a parallel copy of the same sentence.

THE WARRANT IS DIFFERENT from the other three passes, which is why this is its
own file. scripts/repair-quranic-letter-confusions.py and
scripts/complete-quranic-letter-confusions.py settle a reading against the Warsh
text; scripts/repair-footnote-letter-confusions.py settles it against the
repaired body, or against the Warsh text where there is no body twin. These six
are settled by neither. The compiler repeats himself -- the same hadith, the
same anecdote, the same isnad -- and the scan did not fail the same way twice,
so a passage that is broken in one place stands correct in another. That copy is
the witness, and it is named per site below.

Five of the six are hadith or anecdote, not Qur'an, so no aya reaches them. The
sixth, Q 2:260, would have been reachable, but it sits in a hadith quoting the
aya rather than in a bracketed citation, which is where the earlier passes look.

WHERE THEY ARE. Four of these were reported to me as defects in `arabicBody`.
They are not: `arabicBody` does not contain them anywhere in the corpus. They
are in `arabicFootnotes`, which is a separate field and was only repaired this
week. A fifth was reported in Lesson 52; Lesson 52 has no `arabicFootnotes` at
all -- lessons 31-56 are empty -- and the sentence is in Lesson 27. Only the
Lesson 18 site is in `arabicBody`, and it is there twice over, once in each
field. Check the field and the lesson before trusting a report of either.

DO NOT TREAT footnotesData.json AS AUTHORITATIVE. It looks authoritative from
outside and it is the witness for four of these six, but for the Lesson 18
sentence it is broken in two of its six copies: fn-24-b008, fn-46-b023,
fn-48-b015 and fn-51-b032 read `yasta`tib`, while fn-18-1-9 and fn-54-b017 read
the scan's `basta`tib` -- including the record keyed to Lesson 18 itself, the
very lesson being corrected. A witness that is wrong in a third of its copies is
not a witness. The Lesson 18 reading here is taken from lesson 24
`arabicFootnotes` @2584, which carries the identical Bukhari sentence intact
inside the lesson data. An earlier note in this project claimed
footnotesData.json had the correct form in six places; it does not.

54 SITES, each one letter, each inside the confusion classes the other passes
work in. Six came in one at a time; 48 came from a checker that compares every
anchored snippet in the rendered files against the lesson text, which found 89
differences and had them adjudicated into three heaps -- the lesson right and
the snippet stale, the snippet right and the lesson wrong, and neither right.
The second heap, 50 rows, is what this pass works from.

THE LIST IS CANDIDATES, NOT VERDICTS, and reading it that way is the whole
point. Of the 50 rows: 44 confirmed, 4 were the same site listed twice under
two record ids, 1 arrived as a partial span (`al-SALI...` against `...in`) with
no whole word to anchor, and 1 is wrong -- lesson 23 @31077 reads `fa-BALLA
l-rasulu kaffahu`, `he wetted his palm, and the water gushed from between his
fingers`, which is correct Arabic and correct here; the table wanted `qabla`,
which is not a reading of anything. Every offset in the 50 also needed
re-anchoring: 30 of them pointed two to four characters into the word rather
than at its start, so nothing here trusts the offsets as given.

FOUR MORE were added that the checker did not list: an identical defect standing
within four hundred characters of a confirmed one, in the same passage and
settled the same way -- Bukhari's `kitab al-zakat` written twice in one footnote
(lesson 1), Q 7:143 `qala` twice (lesson 19), Q 11:102 `al-qura` twice (lesson
26), Q 2:258 `qala` twice (lesson 7). Repairing one and walking past its twin
is the failure this project has already had to go back and undo once.

WHAT SETTLES EACH IS NAMED PER SITE, and it is not always the snippet. 34 are
settled by an aya, which is the strongest warrant here and would hold with no
snippet at all; 4 by a parallel a few words away in the same passage -- the
hadith qudsi that writes `dhakarani` correctly three words after the broken
`dhakarati`, `taqarrabtu` twelve words after `taqarrayta`, `mithqal` ten words
before `mithfal`, `ma akalathu l-nar` in the clause after `ma ahraqnahu l-nar`.
The remaining 10 REST ON THE SNIPPET ALONE and are marked `snippet only`:
`al-zakat` in a chapter name, `dhunubahum`, `al-batta`, `bi-bab ahadikum`,
`bi-l-nawafil`, `yakrahu l-mawt`, `sab`ina thakla`, `a-dhakarun am untha`, `la
darayta`. For those, one rendered copy is all the warrant there is; the reading
is not otherwise settled, and none of them is Qur'an.

The six that came in one at a time:

  L5  footnote  `marra YA-BAQI` al-Gharqad`     -> BI-BAQI`   (Umar at the Baqi`)
  L6  footnote  `la YAQRIN al-salata sakran`    -> YAQRABANNA (the crier's call)
  L7  footnote  `kayfa TAHBI l-mawta`           -> TUHYI      (Q 2:260 in hadith)
  L27 footnote  `qurashiyyan WA-TAQAFI`         -> WA-THAQAFI (glossed three
                words on by the compiler's own `aw thaqafiyyan wa-qurashi`)
  L18 body and footnote  `fa-la`allahu an BASTA`TIB` -> YASTA`TIB

`TAHBI` IS A REAL WORD ELSEWHERE and must not be repaired by form. Lesson 12
has `la yanbaghi laki illa an TUHIBBI ma uhibb` -- `that you love what I love`,
correct as it stands -- in `arabicBody` @36760, in `arabicFootnotes` @46458 and
in footnotesData.json fn-12-1-18. Nothing here matches on a form; every site is
an offset, and the assert fires if the word at that offset is not the one
expected.

ANCHORING is as in the other three: an offset into the named field, the exact
codepoints expected there, one letter for one letter so lengths and offsets
hold, and a site already carrying the repaired word is skipped.

  python3 scripts/repair-witnessed-letter-confusions.py          # dry run
  python3 scripts/repair-witnessed-letter-confusions.py --write


HOW A SITE IS IDENTIFIED (changed 21 September 2026)

This script no longer addresses its sites by a raw character offset.  Each row
carries the target word before and after the repair, plus the raw skeletons of
the words on either side as they stood when the row was minted; the old offset
survives only as `hint`, which orders the search and appears in reports.  The
resolver requires exactly one place in the field to carry that neighbourhood
and refuses to choose when more than one does.  Rows that share an anchor form
a group, and the group must name exactly as many places as it has rows -- that
is how a passage repeated verbatim inside one field is handled without ever
picking between its copies.

The change exists so that a repair may add or remove a character.  While every
row was an offset, nine scripts shared an unenforced contract that no pass ever
changed a length, and the whole class of dropped-letter damage was unreachable.
See scripts/repair_anchors.py.


HOW A SITE IS IDENTIFIED (changed 21 September 2026)

This script no longer addresses its sites by a raw character offset.  Each row
carries the target word before and after the repair, plus the raw skeletons of
the words on either side as they stood when the row was minted; the old offset
survives only as `hint`, which orders the search and appears in reports.  The
resolver requires exactly one place in the field to carry that neighbourhood
and refuses to choose when more than one does.  Rows that share an anchor form
a group, and the group must name exactly as many places as it has rows -- that
is how a passage repeated verbatim inside one field is handled without ever
picking between its copies.

The change exists so that a repair may add or remove a character.  While every
row was an offset, nine scripts shared an unenforced contract that no pass ever
changed a length, and the whole class of dropped-letter damage was unreachable.
See scripts/repair_anchors.py.
"""
import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import repair_anchors as A

ROOT = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'lessons'
WRITE = '--write' in sys.argv

# lesson -> [(field, old codepoints, new codepoints, lead, tail, width, mult,
#             hint, note)]
ROWS = {
    1: [
        ('arabicFootnotes', '062706440631064306270629', '062706440632064306270629',
         ['060c', '06480641064a', '0635062d064a062d', '0645063306440645', '0643062a06270628'],
         ['062806270628', '0641064a', '062706440645064606410642', '0648062706440645064506330643', '06390628062f064a'],
         5, 1, 41594, 'AlrkAh -> AlzkAh | snippet only: Bukhari kitab al-ZAKAT | rendered snippet fn-1-49'),
        ('arabicFootnotes', '062706440631064306270629', '062706440632064306270629',
         ['0645063306430627', '062a064406410627', '0635062d064a062d', '062706440628062e06270631064a', '0643062a06270628'],
         ['062806270628', '064206480644', '0627064406440647', '062a063906270644064a', '0641062706450627'],
         5, 1, 41503, 'AlrkAh -> AlzkAh | snippet only: Bukhari kitab al-ZAKAT, the same chapter name again | rendered snippet fn-1-49'),
        ('arabicFootnotes', '0641064f06440650', '0642064f06440650',
         ['06460647064a06430645', '063906460647', '064106270646062a064706480627', '0648064206270644', '062a063906270644064a'],
         ['06270646', '06430646062a0645', '062a062d062806480646', '0627064406440647', '06280627062a06280639064806460647'],
         5, 1, 18436, 'fl -> ql | Q 3:31 QUL in kuntum tuhibbuna llah | rendered snippet fn-1-18'),
        ('arabicFootnotes', '0642064e06270646062a064e0647064f06480627', '0641064e06270646062a064e0647064f06480627',
         ['062706440631063306480644', '0641062e063006480647', '064806450627', '06460647064a06430645', '063906460647'],
         ['0648064206270644', '062a063906270644064a', '06420644', '06270646', '06430646062a0645'],
         5, 1, 18412, 'qAnthwA -> fAnthwA | Q 59:7 wa-ma nahakum `anhu FA-NTAHU | rendered snippet fn-1-18'),
    ],
    3: [
        ('arabicFootnotes', '063006460648064a06470645', '063006460648062806470645',
         ['062706440647', '062706440627', '0627064406440647', '0644064a062d0637', '062806470627'],
         ['062706440642063106370628064a', '062c', '06310648064a', '0645063306440645', '06390646'],
         5, 1, 27195, 'dhnwyhm -> dhnwbhm | snippet only: li-yuhatta biha DHUNUBUHUM | rendered snippet fn-3-38'),
    ],
    5: [
        ('arabicFootnotes', '0645064e06410650064a0644064b0627', '0645064e06420650064a0644064b0627',
         ['06270644062c06460647', '064a06480645064a0630', '062e064a0631', '06450633062a064206310627', '06480627062d06330646'],
         ['064206270644', '06430627064606480627', '064a063106480646', '062706460647', '06280646'],
         5, 1, 76371, 'mfylA -> mqylA | Q 25:24 wa-ahsanu MAQILA | rendered snippet fn-5-57'),
        ('arabicFootnotes', '062a0645062a', '06460645062a',
         ['06270646064a', '0642062f', '06460645062a', '064206270644', '06450627'],
         ['0648064806420639', '06390644064a06470627', '0648063506460639', '064306390628', '0645062b0644'],
         5, 1, 70537, 'tmt -> nmt | his wife has just said `inni qad NAMT` | rendered snippet fn-5-53'),
        ('arabicFootnotes', '062a06420631064a062a', '062a064206310628062a',
         ['064506460647', '064806270646', '062a064206310628', '06270644064a', '0628063406280631'],
         ['06270644064a0647', '06300631062706390627', '064806270646', '062a064206310628', '06270644064a'],
         5, 1, 57767, 'tqryt -> tqrbt | the same hadith reads TAQARRABTU twelve words on | rendered snippet fn-5-45'),
        ('arabicFootnotes', '063006430631062a064a', '0630064306310646064a',
         ['06390628062f064a', '0628064a', '0648062706460627', '064506390647', '062706300627'],
         ['064106270646', '0630064306310646064a', '0641064a', '0646064106330647', '063006430631062a0647'],
         5, 1, 57673, 'dhkrty -> dhkrny | the same hadith reads DHAKARANI three words on | rendered snippet fn-5-45'),
        ('arabicFootnotes', '064a06280642064a0639', '062806280642064a0639',
         ['06310636064a', '0627064406440647', '063906460647', '062706460647', '06450631'],
         ['06270644063a06310642062f', '0641064206270644', '062706440633064406270645', '06390644064a06430645', '062706470644'],
         5, 1, 9878, 'ybqy` -> bbqy` | marra bi-Baqi` al-Gharqad | footnotesData.json fn-5-10, same sentence, reads bi-Baqi`'),
    ],
    6: [
        ('arabicFootnotes', '0648064e0628064e06410650064a0651064e0629064c', '0648064e0628064e06420650064a0651064e0629064c',
         ['062706440630064a0646', '064206270644', '062706440642063106370628064a', '0642064806440647', '062a063906270644064a'],
         ['0627062e062a06440641', '0641064a', '0627064406280642064a0647', '06390644064a', '06270642064806270644'],
         5, 1, 67603, 'wbfyh -> wbqyh | Q 2:248 wa-BAQIYYA; al-Qurtubi glosses it `ikhtulifa fi l-baqiyya` in the next clause | rendered snippet fn-6-64'),
        ('arabicFootnotes', '064a062806270628', '0628062806270628',
         ['064a064206480644', '062706310627064a062a0645', '06440648', '06270646', '0646064706310627'],
         ['0627062d062f06430645', '064a063a062a06330644', '0641064a0647', '06430644', '064a06480645'],
         5, 1, 55632, 'ybAb -> bbAb | snippet only: nahran BI-BAB ahadikum | rendered snippet fn-6-53'),
        ('arabicFootnotes', '0641064e06460650062a0650064a0646064e060c', '0642064e06460650062a0650064a0646064e060c',
         ['062706440635064406480627062a', '0648062706440635064406480647', '06270644064806330637064a', '064806420648064506480627', '064406440647'],
         ['064106270645063106460627', '062806270644063306430648062a', '0635062d064a062d', '062706440628062e06270631064a', '0643062a06270628'],
         5, 1, 55231, 'fntyn -> qntyn | Q 2:238 wa-qumu lillahi QANITIN | rendered snippet fn-6-51'),
        ('arabicFootnotes', '0648064e0641064f06480645064f064806270652', '0648064e0642064f06480645064f064806270652',
         ['062d0639063806480627', '06390644064a', '062706440635064406480627062a', '0648062706440635064406480647', '06270644064806330637064a'],
         ['064406440647', '06420646062a064a0646060c', '064106270645063106460627', '062806270644063306430648062a', '0635062d064a062d'],
         5, 1, 55214, 'wfwmwA -> wqwmwA | Q 2:238 wa-QUMU lillahi qanitin | rendered snippet fn-6-51'),
        ('arabicFootnotes', '06270644064a062a0629', '062706440628062a0629',
         ['064a0633062a0646064a', '063906460647', '0648', '06440647', '06270644062c0647'],
         ['06270644062d062f064a062b', '064506330646062f', '0627062d0645062f', '064506330646062f', '06270644064306480641064a064a0646'],
         5, 1, 34004, 'Alyth -> Albth | snippet only: wa-lahu l-janna al-BATTA | rendered snippet fn-6-29'),
        ('arabicFootnotes', '064a06420631064a0646', '064a0642063106280646',
         ['0627064206270645', '062706440635064406270647', '06460627062f064a', '06270646', '06440627'],
         ['062706440635064406270647', '06330643063106270646', '0641062f0639064a', '063906450631', '064106420631064a062a'],
         5, 1, 26461, 'yqryn -> yqrbn | la YAQRABANNA al-salata sakran | footnotesData.json fn-6-23, same sentence, reads yaqrabanna'),
    ],
    7: [
        ('arabicFootnotes', '062a062d0628064a', '062a062d064a064a',
         ['06270630', '064206270644', '06310628', '062706310646064a', '0643064a0641'],
         ['0627064406450648062a064a', '064206270644', '0627064806440645', '062a064806450646', '064206270644'],
         5, 1, 27052, 'tHby -> tHyy | Q 2:260 kayfa TUHYI l-mawta, inside `nahnu ahaqqu bi-l-shakk min Ibrahim` | footnotesData.json fn-7-25 reads tuhyi; Q 2:260 settles it independently'),
        ('arabicFootnotes', '0641064e06270644064e', '0642064e06270644064e',
         ['063006440643', '06270646062a06420644', '06270644064a', '062d062c0647', '062706480636062d'],
         ['0627062806310647064a0645', '064106270646', '0627064406440647', '064a0627062a064a', '062806270644063406450633'],
         5, 1, 19484, 'fAl -> qAl | Q 2:258 QALA Ibrahim fa-inna llaha ya\'ti bi-l-shams | rendered snippet Al-Sawi[3]'),
        ('arabicFootnotes', '0641064e06270644064e', '0642064e06270644064e',
         ['064806470648', '064506310648062f', '06280646', '06430646063906270646', '06270630'],
         ['0627062806310647064a0645', '064406450627', '064206270644', '06440647', '06450646'],
         5, 1, 19201, 'fAl -> qAl | Q 2:258 idh QALA Ibrahim rabbiya lladhi yuhyi wa-yumit | rendered snippet Al-Ṣāwī[3]'),
    ],
    8: [
        ('arabicFootnotes', '064a064e0641064f06480644064f06480646064e', '064a064e0642064f06480644064f06480646064e',
         ['0627064406390628062f', '0648062706480644064a0643', '06470645', '062706440627062d063106270631', '062706440630064a0633'],
         ['0631062806460627', '0627064606460627', '06270645064606270645', '0635062f064206460627', '06280643'],
         5, 1, 571, 'yfwlwn -> yqwlwn | Q 3:16 alladhina YAQULUNA rabbana | rendered snippet fn-8-1'),
    ],
    9: [
        ('arabicFootnotes', '0639064e064a0650', '0639064e06460650',
         ['064806270644064a06480645', '062706440627062e0631', '0648064a06270645063106480646', '06280627064406450639063106480641', '0648064a0646064706480646'],
         ['062706440645064606430631', '0648064a06330631063906480646', '0641064a', '06270644062e064a06310627062a', '0648062706480644064a0643'],
         5, 1, 31587, '`y -> `n | Q 3:114 wa-yanhawna `AN al-munkar | rendered snippet fn-9-1-18'),
    ],
   11: [
        ('arabicFootnotes', '062a064e064106520631064e0628064f064806270652', '062a064e064206520631064e0628064f064806270652',
         ['0634064a064a0627', '064a0627064a06470627', '062706440630064a0633', '06270645064606480627', '06440627'],
         ['06270644063506440647', '062706440627064a0647', '06270644062b06270644062b0647', '06450646', '0627064a0627062a'],
         5, 1, 28739, 'tfrbwA -> tqrbwA | Q 4:43 la TAQRABU l-salat | rendered snippet fn-11-2-4'),
    ],
   12: [
        ('arabicFootnotes', '0627064406520641064f06310652062806500649', '0627064406520642064f06310652062806500649',
         ['064a062706450631', '0628062706440639062f0644', '0648062706440627062d06330633', '06480627064a062a0627064a', '0630064a'],
         ['0648064a0646062c064a', '06390646', '062706440628062d06340627', '0648062706440645064606430631', '06480627064406280639064a'],
         5, 1, 37360, 'Alfrby -> Alqrby | Q 16:90 wa-ita\'i dhi l-QURBA | rendered snippet fn-12-3-2'),
        ('arabicFootnotes', '06450650062b06520641064e06270644064e', '06450650062b06520642064e06270644064e',
         ['062f06310647', '062e064a06310627', '064a0632', '064806450646', '064a0639062a0644'],
         ['063006310647', '063406310627064a06310647', '060c', '06480627062d06430645', '0627064a0647'],
         5, 1, 37241, 'mthfAl -> mthqAl | Q 99:8; MITHQAL stands correct ten words earlier | rendered snippet fn-12-3-2'),
    ],
   13: [
        ('arabicFootnotes', '06270644065206410650064a064e0645064e06290650', '06270644065206420650064a064e0645064e06290650',
         ['0639064a0633064a060c', '06470648', '06270644062e062a0645', '062706440627064306280631', '0648064a06480645'],
         ['064a064306480646', '06390644064a06470645', '06340647064a062f0627', '062806450627', '06410639064406480647'],
         5, 1, 9397, 'Alfymh -> Alqymh | Q 4:159 wa-yawma l-QIYAMA | rendered snippet fn-13-3'),
    ],
   14: [
        ('arabicFootnotes', '0648064e0644064e0641064e062f0652', '0648064e0644064e0642064e062f0652',
         ['0643062a06270628', '062706440627064a064506270646', '064506390646064a', '0642064806440647', '062a063906270644064a'],
         ['063106270647', '0646063206440647', '0627062e0631064a', '064706300647', '062706440639064406480645'],
         5, 1, 48816, 'wlfd -> wlqd | Q 53:13 wa-LAQAD ra\'ahu nazlatan ukhra | rendered snippet fn-14-2-10'),
        ('arabicFootnotes', '062806270644062a0648062706410644', '06280627064406460648062706410644',
         ['064806450627', '064a063206270644', '06390628062f064a', '064a062a064206310628', '06270644064a'],
         ['062d062a064a', '0627062d06280647', '0641062706300627', '0627062d06280628062a0647', '06430646062a'],
         5, 1, 12257, 'bAltwAfl -> bAlnwAfl | snippet only: the hadith qudsi `bi-l-NAWAFIL hatta uhibbah` | rendered snippet fn-14-1-7'),
    ],
   15: [
        ('arabicFootnotes', '0648064e0644064e0641064e062f0652', '0648064e0644064e0642064e062f0652',
         ['064806440627', '06450628062f0644', '0644064306440645062a', '0627064406440647', '0645064806270639064a062f0647'],
         ['062c0627', '0645', '064606280627062a', '062706440645063106330644064a0646', '06450627'],
         5, 1, 58808, 'wlfd -> wlqd | Q 6:34 wa-LAQAD ja\'aka min naba\'i l-mursalin | rendered snippet fn-15-1-22'),
        ('arabicFootnotes', '064a064e0641064f06480644064f06480646064e', '064a064e0642064f06480644064f06480646064e',
         ['0646063906440645', '0627064606470648', '06270644063406270646', '0644064a062d063206460643', '062706440630'],
         ['06440643', '06450646', '06270644062a06430630064a0628', '0627064606470645', '06440627'],
         5, 1, 58342, 'yfwlwn -> yqwlwn | Q 6:33 la-yahzunuka lladhi YAQULUN | rendered snippet Sirr[200]'),
        ('arabicFootnotes', '0627064406520641064f063106520621064e06270646064e', '0627064406520642064f063106520621064e06270646064e',
         ['06450627', '062a062f0628063106480627', '062706440642063106270646', '0627062806440627', '064a062a062f0628063106480646'],
         ['064706300647', '062706440633064806310647', '06450643064a0647', '0633064806310647', '0627064406270646063906270645060c'],
         5, 1, 45704, 'AlfrAn -> AlqrAn | Q 4:82 / 47:24 afala yatadabbaruna l-QUR\'AN | rendered snippet fn-15-1-19'),
    ],
   16: [
        ('arabicFootnotes', '0641064e06270644064e', '0642064e06270644064e',
         ['062706280627', '06270628063106270647064a0645', '064406270643062a0641064a', '06280642064806440647', '064806270630'],
         ['06270628063106270647064a0645', '064406270628064a0647', '064106420637060c', '062706450627', '0642064806440647'],
         5, 1, 34945, 'fAl -> qAl | Q 6:74 wa-idh QALA Ibrahim li-abih | rendered snippet fn-16-2-6'),
    ],
   18: [
        ('arabicBody', '06280633062a0639062a0628', '064a0633062a0639062a0628',
         ['062e064a06310627', '0648062706450627', '06450633064a064a0627', '06410644063906440647', '06270646'],
         ['0635062d064a062d', '062706440628062e06270631064a', '0643062a06270628', '06270644064506310636064a', '062806270628'],
         5, 1, 27327, 'bst`tb -> yst`tb | Bukhari, fa-la`allahu an YASTA`TIB | lesson 24 arabicFootnotes @2584 carries the same sentence with yasta`tib'),
        ('arabicFootnotes', '06280633062a0639062a0628', '064a0633062a0639062a0628',
         ['062e064a06310627', '0648062706450627', '06450633064a064a0627', '06410644063906440647', '06270646'],
         ['0635062d064a062d', '062706440628062e06270631064a', '0643062a06270628', '06270644064506310636064a', '062806270628'],
         5, 1, 26600, 'bst`tb -> yst`tb | Bukhari, fa-la`allahu an YASTA`TIB | lesson 24 arabicFootnotes @2584 carries the same sentence with yasta`tib'),
        ('arabicFootnotes', '0641064e06310650064a0628064c', '0642064e06310650064a0628064c',
         ['0641064a', '0631062d0645062a0647', '06270644', '0631062d0645062a', '0627064406440647'],
         ['06450646', '062706440645062d06330646064a0646', '0627064406450637064a0639064a0646060c', '064a0631062c06480647', '062706440645062d0633064606480646060c'],
         5, 1, 24887, 'fryb -> qryb | Q 7:56 inna rahmata llahi QARIB mina l-muhsinin | rendered snippet fn-18-2-3'),
    ],
   19: [
        ('arabicFootnotes', '0641064e064806520645065006470650060c', '0642064e064806520645065006470650060c',
         ['06270644062e06330631064a0646', '0648064406450627', '0631062c0639', '064506480633064a', '06270644064a'],
         ['063a063606280646', '063a06360628', '06450646', '062c0647064406470645', '0627063306450627'],
         5, 1, 36327, 'fwmh -> qwmh | Q 7:150 wa-lamma raja`a Musa ila QAWMIHI ghadban | rendered snippet fn-19-2-9'),
        ('arabicFootnotes', '0641064e06270644064e', '0642064e06270644064e',
         ['06480627062d062f0627060c', '0627064606450627', '06270644064606380631', '063706440628', '0627064406310648064a0647'],
         ['0644064a', '062a0631062806460647', '06410647064506460627', '062706460647', '064a0631064a062f'],
         5, 1, 25125, 'fAl -> qAl | Q 7:143 QALA lan tarani | rendered snippet fn-19-1-10'),
        ('arabicFootnotes', '0641064e06270644064e', '0642064e06270644064e',
         ['06450627', '06470648', '0627063906380645', '06450646', '063006440643'],
         ['06310628', '06270631064a0647', '0646064106330643', '0627064606380631', '06270644064a0643'],
         5, 1, 25002, 'fAl -> qAl | Q 7:143 QALA rabbi arini anzur ilayk | rendered snippet fn-19-1-10'),
        ('arabicFootnotes', '0641064e06480652064506500649', '0642064e06480652064506500649',
         ['0648064406450627', '064206270644', '06440647', '06270645062e064406450646064a', '0641064a'],
         ['0648062706350644062d', '06390628062f06480627', '062706440639062c0644', '06450646', '06280639062f0647060c'],
         5, 1, 23197, 'fwmy -> qwmy | Q 7:142 ukhlufni fi QAWMI wa-aslih, the same aya quoted twice in one sentence; the first is repaired at @23149 | rendered snippet fn-19-4'),
        ('arabicFootnotes', '0641064e0648065206450650', '0642064e0648065206450650',
         ['062806270644062e0644062706410647060c', '064206270644', '06440647', '06270645062e064406450646064a', '0641064a'],
         ['0648062706350644062d', '0648064406450627', '064206270644', '06440647', '06270645062e064406450646064a'],
         5, 1, 23149, 'fwm -> qwm | Q 7:142 ukhlufni fi QAWMI wa-aslih | rendered snippet fn-19-4'),
        ('arabicFootnotes', '0644064e0641064e062f0652', '0644064e0642064e062f0652',
         ['064606350641', '064a06480645', '064206270644', '0627062a06460627', '063a062f062706460627'],
         ['06440641064a06460627', '0645', '06330639063106460627', '064706300627', '0646063506280627'],
         5, 1, 22632, 'lfd -> lqd | Q 18:62 LAQAD laqina min safarina hadha nasaba | rendered snippet fn-19-4'),
        ('arabicFootnotes', '0648064e0641064e06270644064f064806270652', '0648064e0642064e06270644064f064806270652',
         ['0646064106330647', '06450646', '062a0634062706480645', '06270648', '062a0637064a0631'],
         ['0644064506480633064a', '0645064706450627', '062a0627062a06460627', '06280647', '0645064a'],
         5, 1, 11749, 'wfAlwA -> wqAlwA | Q 7:132 wa-QALU mahma ta\'tina bihi min aya | rendered snippet fn-19-2-2'),
    ],
   20: [
        ('arabicFootnotes', '0628064306310647', '064a064306310647',
         ['06410627063906440647', '062a0631062f062f064a', '06390646', '064606410633', '062706440645064806450646'],
         ['06270644064506480646', '0648062706460627', '0627064306310647', '064506330627062a0647', '062706440643064106270631'],
         5, 1, 7541, 'bkrh -> ykrh | snippet only: the hadith qudsi `YAKRAHU l-mawt wa-ana akrahu masa\'atah` | rendered snippet fn-20-b014'),
    ],
   21: [
        ('arabicFootnotes', '0641064f0644064f0648062806500647065006450652', '0642064f0644064f0648062806500647065006450652',
         ['0627063806450633', '06390644064a', '062706450648064406470645', '064806270634062f062f', '06390644064a'],
         ['062806440627', '064a06480645064606480627', '062d062a064a', '064a063106480627', '062706440639063006270628'],
         5, 1, 35846, 'flwbhm -> qlwbhm | Q 10:88 wa-shdud `ala QULUBIHIM | rendered snippet fn-21-3-8'),
        ('arabicFootnotes', '0642064e062506500646', '0641064e062506500646',
         ['0639064606430645', '0648063906440645', '06270646', '062c064a06430645', '0636063906280627'],
         ['062a06430631', '0645064606430645', '06450627064a0647', '06350627062806310647', '064a0644064a06480627'],
         5, 1, 32715, 'qAn -> fAn | Q 8:66 FA-IN yakun minkum mi\'atun sabira | rendered snippet fn-21-3-7'),
    ],
   23: [
        ('arabicFootnotes', '0627064406520641064f063106520621064e06270646064f', '0627064406520642064f063106520621064e06270646064f',
         ['0641064a', '06420631064a0634', '0644064806440627', '064606320644', '064706300627'],
         ['06390644064a', '0631062c0644', '06450646', '0627064406420631064a062a064a0646', '06390638064a0645'],
         5, 1, 45372, 'AlfrAn -> AlqrAn | Q 43:31 lawla nuzzila hadha l-QUR\'AN | rendered snippet fn-23-4'),
        ('arabicFootnotes', '0644064e0641064e062f', '0644064e0642064e062f',
         ['064406280642064a', '0639062706310627', '06390644064a06470645', '06410628062f0627', '06280642064806440647'],
         ['062a06270628', '0627064406440647', '06390644064a', '06270644062a064a', '064206280644'],
         5, 1, 28094, 'lfd -> lqd | Q 9:117 LAQAD taba llahu `ala l-nabi; the prose two words earlier has laqad | rendered snippet Tawba[42]'),
    ],
   25: [
        ('arabicFootnotes', '0641064e06270644064e', '0642064e06270644064e',
         ['064806270646062a', '0627062d06430645', '06270644062d06430645064a0646', '062706390644064506470645', '064806270639062f06470645'],
         ['062a063906270644064a', '0648064a06460648062d', '0627064606470648', '0644064a0633', '06450646'],
         5, 1, 28318, 'fAl -> qAl | Q 11:46 QALA ya Nuh innahu laysa min ahlik | rendered snippet fn-25-1-10'),
    ],
   26: [
        ('arabicFootnotes', '06270644065206410650063106500649', '06270644065206420650063106500649',
         ['06480643063006440643', '0627062e0630', '063106280643', '0627063006270627', '0627062e0630'],
         ['060c', '06480641064a', '063106480627064a0647', '0645063306440645', '06270646'],
         5, 1, 3994, 'Alfry -> Alqry | Q 11:102 idha akhadha l-QURA wa-hiya zalima | rendered snippet fn-26-b018'),
        ('arabicFootnotes', '06270652064406520641064f0631065006490670', '06270652064406520642064f0631065006490670',
         ['06480643063006440643', '0627062e0630', '063106280643', '062706300627', '0627062e0630'],
         ['06480647064a', '06380627064406450647', '06270644', '0627062d06300647', '06270644064a0645'],
         5, 1, 3846, 'Alfry -> Alqry | Q 11:102 idha akhadha l-QURA, the same lemma again | rendered snippet fn-26-b018'),
    ],
   27: [
        ('arabicFootnotes', '0648062a06420641064a', '0648062b06420641064a',
         ['064206270644', '0627062c062a06450639', '06390646062f', '062706440628064a062a', '064206310634064a06270646'],
         ['06270648', '062b06420641064a06270646', '0648064206310634064a', '0643062b064a06310647', '0634062d0645'],
         5, 1, 39527, 'wtqfy -> wthqfy | qurashiyyan wa-THAQAFI, glossed three words on by `aw thaqafiyyan wa-qurashi` | footnotesData.json fn-52-b021, same sentence, reads wa-thaqafi'),
        ('arabicFootnotes', '062a064306440649', '062b064306440649',
         ['06450646', '062d063206460647', '064206270644', '062d06320646', '063306280639064a0646'],
         ['064206270644', '06450627', '0627062c06310647', '064206270644', '0627062c0631'],
         5, 1, 17064, 'tkly -> thkly | snippet only: hazana sab`ina THAKLA | rendered snippet fn-27-b003'),
        ('arabicFootnotes', '0641064e06270644064f064806270652', '0642064e06270644064f064806270652',
         ['0646062d0648', '064506350631', '0628064406450627', '062f062e064406480627', '06390644064a0647'],
         ['064a0627064a06470627', '062c0627', '0641064a', '0645063506460641', '062706280646'],
         5, 1, 16824, 'fAlwA -> qAlwA | Q 12:88 fa-lamma dakhalu `alayhi QALU | rendered snippet Ibn Abī Shayba[1]'),
    ],
   28: [
        ('arabicFootnotes', '062f06310628062a', '062f0631064a062a',
         ['06440627', '0627062f0631064a060c', '064a064206480644', '06440647', '06440627'],
         ['064806440627', '062a0644064a062a060c', '06450627', '063906310641062a', '064806440627'],
         5, 1, 35825, 'drbt -> dryt | snippet only: the formula `la DARAYTA wa-la talayta`, glossed `ma `arafta wa-la ta`allamta` beside it | rendered snippet Fayḍ[9]'),
    ],
   29: [
        ('arabicFootnotes', '0623064606460649', '06230646062b0649',
         ['064206270644', '0627064a', '06310628', '0627063006430631', '06270645'],
         ['062706340642064a', '06270645', '06330639064a062f', '064106450627', '06270644063106320642'],
         5, 1, 67245, 'Anny -> Anthy | snippet only: a-dhakarun am UNTHA | rendered snippet fn-33-b019'),
        ('arabicFootnotes', '0623062d0631064206460647', '0623062d06310642062a0647',
         ['064706300627', '062706440642063106270646', '0641064a', '0627064706270628', '06450627'],
         ['06270644064606270631', '060c', '06440648', '064306270646', '062706440642063106270646'],
         5, 1, 5952, 'AHrqnh -> AHrqth | the next clause of the same hadith reads `ma AKALATHU l-nar` | rendered snippet fn-29-b024'),
    ],
}


def main():
    applied = skipped = 0
    for lesson in sorted(ROWS):
        path = ROOT / f'{lesson:02d}.json'
        data = json.loads(path.read_text(encoding='utf-8'))
        touched = False
        by_field = {}
        for field, old, new, lead, tail, width, mult, hint, note in ROWS[lesson]:
            by_field.setdefault(field, []).append(
                (A.hx(old), A.hx(new), [A.hx(x) for x in lead],
                 [A.hx(x) for x in tail], width, mult, hint, note))
        for field, rows in by_field.items():
            text = data.get(field) or ''
            text, a, s, log = A.apply_rows(text, rows, f'lesson {lesson:02d} {field}')
            if a:
                data[field] = text
                touched = True
                for hint, off, old, new, note in log:
                    print(f'  L{lesson:02d} {field:<16} hint@{hint:<6} now@{off:<6} '
                          f'{old} -> {new}   {note}')
            applied += a
            skipped += s
        if touched and WRITE:
            path.write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')
    verb = 'applied' if WRITE else 'would apply'
    print(f'{verb} {applied} repairs; {skipped} already in place')


if __name__ == '__main__':
    main()
