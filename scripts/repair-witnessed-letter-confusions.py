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


Sites are named by content, not by offset: see scripts/repair_anchors.py for
the scheme and for why. The `hint` in each row is the offset the row used to
carry, kept only to order the search and to appear in reports.


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
         ['060c', '064806410628', '0635062c0628062c', '0645063306280645', '0643062806270628'],
         ['062806270628', '06410628', '062706280645062806410641', '0648062706280645064506330643', '06390628062f0628'],
         5, 1, 41594, 'AlrkAh -> AlzkAh | snippet only: Bukhari kitab al-ZAKAT | rendered snippet fn-1-49'),
        ('arabicFootnotes', '062706440631064306270629', '062706440632064306270629',
         ['0645063306430627', '0628062806410627', '0635062c0628062c', '062706280628062c062706310628', '0643062806270628'],
         ['062806270628', '064106480628', '0627062806280647', '06280639062706280628', '0641062706450627'],
         5, 1, 41503, 'AlrkAh -> AlzkAh | snippet only: Bukhari kitab al-ZAKAT, the same chapter name again | rendered snippet fn-1-49'),
        ('arabicFootnotes', '0641064f06440650', '0642064f06440650',
         ['06280647062806430645', '063906280647', '0641062706280628064706480627', '0648064106270628', '06280639062706280628'],
         ['06270628', '0643062806280645', '0628062c062806480628', '0627062806280647', '06280627062806280639064806280647'],
         5, 1, 18436, 'fl -> ql | Q 3:31 QUL in kuntum tuhibbuna llah | rendered snippet fn-1-18'),
        ('arabicFootnotes', '0642064e06270646062a064e0647064f06480627', '0641064e06270646062a064e0647064f06480627',
         ['062706280631063306480628', '0641062c062f06480647', '064806450627', '06280647062806430645', '063906280647'],
         ['0648064106270628', '06280639062706280628', '06410628', '06270628', '0643062806280645'],
         5, 1, 18412, 'qAnthwA -> fAnthwA | Q 59:7 wa-ma nahakum `anhu FA-NTAHU | rendered snippet fn-1-18'),
    ],
    3: [
        ('arabicFootnotes', '063006460648064a06470645', '063006460648062806470645',
         ['062706280647', '062706280627', '0627062806280647', '06280628062c0637', '062806470627'],
         ['0627062806410631063706280628', '062c', '063106480628', '0645063306280645', '06390628'],
         5, 1, 27195, 'dhnwyhm -> dhnwbhm | snippet only: li-yuhatta biha DHUNUBUHUM | rendered snippet fn-3-38'),
    ],
    5: [
        ('arabicFootnotes', '0645064e06410650064a0644064b0627', '0645064e06420650064a0644064b0627',
         ['06270628062c06280647', '0628064806450628062f', '062c06280631', '064506330628064106310627', '06480627062c06330628'],
         ['064106270628', '06430627062806480627', '0628063106480628', '062706280647', '06280628'],
         5, 1, 76373, 'mfylA -> mqylA | Q 25:24 wa-ahsanu MAQILA | rendered snippet fn-5-57'),
        ('arabicFootnotes', '062a0645062a', '06460645062a',
         ['062706280628', '0641062f', '062806450628', '064106270628', '06450627'],
         ['0648064806410639', '06390628062806470627', '0648063506280639', '064306390628', '064506280628'],
         5, 1, 70538, 'tmt -> nmt | his wife has just said `inni qad NAMT` | rendered snippet fn-5-53'),
        ('arabicFootnotes', '062a06420631064a062a', '062a064206310628062a',
         ['064506280647', '064806270628', '0628064106310628', '062706280628', '0628063306280631'],
         ['0627062806280647', '062f0631062706390627', '064806270628', '0628064106310628', '062706280628'],
         5, 1, 57768, 'tqryt -> tqrbt | the same hadith reads TAQARRABTU twelve words on | rendered snippet fn-5-45'),
        ('arabicFootnotes', '063006430631062a064a', '0630064306310646064a',
         ['06390628062f0628', '06280628', '0648062706280627', '064506390647', '0627062f0627'],
         ['064106270628', '062f0643063106280628', '06410628', '0628064106330647', '062f0643063106280647'],
         5, 1, 57674, 'dhkrty -> dhkrny | the same hadith reads DHAKARANI three words on | rendered snippet fn-5-45'),
        ('arabicFootnotes', '064a06280642064a0639', '062806280642064a0639',
         ['063106350628', '0627062806280647', '063906280647', '062706280647', '06450631'],
         ['06270628063906310641062f', '0641064106270628', '062706280633062806270645', '06390628062806430645', '062706470628'],
         5, 1, 9879, 'ybqy` -> bbqy` | marra bi-Baqi` al-Gharqad | footnotesData.json fn-5-10, same sentence, reads bi-Baqi`'),
    ],
    6: [
        ('arabicFootnotes', '0648064e0628064e06410650064a0651064e0629064c', '0648064e0628064e06420650064a0651064e0629064c',
         ['06270628062f06280628', '064106270628', '0627062806410631063706280628', '0641064806280647', '06280639062706280628'],
         ['0627062c062806280641', '06410628', '062706280628064106280647', '063906280628', '06270641064806270628'],
         5, 1, 67606, 'wbfyh -> wbqyh | Q 2:248 wa-BAQIYYA; al-Qurtubi glosses it `ikhtulifa fi l-baqiyya` in the next clause | rendered snippet fn-6-64'),
        ('arabicFootnotes', '064a062806270628', '0628062806270628',
         ['0628064106480628', '062706310627062806280645', '06280648', '06270628', '0628064706310627'],
         ['0627062c062f06430645', '06280639062806330628', '064106280647', '06430628', '062806480645'],
         5, 1, 55635, 'ybAb -> bbAb | snippet only: nahran BI-BAB ahadikum | rendered snippet fn-6-53'),
        ('arabicFootnotes', '0641064e06460650062a0650064a0646064e060c', '0642064e06460650062a0650064a0646064e060c',
         ['0627062806350628064806270628', '0648062706280635062806480647', '062706280648063306370628', '064806410648064506480627', '062806280647'],
         ['064106270645063106280627', '0628062706280633064306480628', '0635062c0628062c', '062706280628062c062706310628', '0643062806270628'],
         5, 1, 55234, 'fntyn -> qntyn | Q 2:238 wa-qumu lillahi QANITIN | rendered snippet fn-6-51'),
        ('arabicFootnotes', '0648064e0641064f06480645064f064806270652', '0648064e0642064f06480645064f064806270652',
         ['062c0639063706480627', '063906280628', '0627062806350628064806270628', '0648062706280635062806480647', '062706280648063306370628'],
         ['062806280647', '06410628062806280628060c', '064106270645063106280627', '0628062706280633064306480628', '0635062c0628062c'],
         5, 1, 55217, 'wfwmwA -> wqwmwA | Q 2:238 wa-QUMU lillahi qanitin | rendered snippet fn-6-51'),
        ('arabicFootnotes', '06270644064a062a0629', '062706440628062a0629',
         ['06280633062806280628', '063906280647', '0648', '06280647', '06270628062c0647'],
         ['06270628062c062f06280628', '064506330628062f', '0627062c0645062f', '064506330628062f', '06270628064306480641062806280628'],
         5, 1, 34004, 'Alyth -> Albth | snippet only: wa-lahu l-janna al-BATTA | rendered snippet fn-6-29'),
        ('arabicFootnotes', '064a06420631064a0646', '064a0642063106280646',
         ['0627064106270645', '062706280635062806270647', '06280627062f0628', '06270628', '06280627'],
         ['062706280635062806270647', '06330643063106270628', '0641062f06390628', '063906450631', '06410641063106280628'],
         5, 1, 26461, 'yqryn -> yqrbn | la YAQRABANNA al-salata sakran | footnotesData.json fn-6-23, same sentence, reads yaqrabanna'),
    ],
    7: [
        ('arabicFootnotes', '062a062d0628064a', '062a062d064a064a',
         ['0627062f', '064106270628', '06310628', '0627063106280628', '064306280641'],
         ['062706280645064806280628', '064106270628', '0627064806280645', '0628064806450628', '064106270628'],
         5, 1, 27052, 'tHby -> tHyy | Q 2:260 kayfa TUHYI l-mawta, inside `nahnu ahaqqu bi-l-shakk min Ibrahim` | footnotesData.json fn-7-25 reads tuhyi; Q 2:260 settles it independently'),
        ('arabicFootnotes', '0641064e06270644064e', '0642064e06270644064e',
         ['062f06280643', '06270628062806410628', '062706280628', '062c062c0647', '062706480635062c'],
         ['062706280631064706280645', '064106270628', '0627062806280647', '0628062706280628', '062806270628063306450633'],
         5, 1, 19484, "fAl -> qAl | Q 2:258 QALA Ibrahim fa-inna llaha ya'ti bi-l-shams | rendered snippet Al-Sawi[3]"),
        ('arabicFootnotes', '0641064e06270644064e', '0642064e06270644064e',
         ['064806470648', '064506310648062f', '06280628', '06430628063906270628', '0627062f'],
         ['062706280631064706280645', '062806450627', '064106270628', '06280647', '06450628'],
         5, 1, 19201, 'fAl -> qAl | Q 2:258 idh QALA Ibrahim rabbiya lladhi yuhyi wa-yumit | rendered snippet Al-Ṣāwī[3]'),
    ],
    8: [
        ('arabicFootnotes', '064a064e0641064f06480644064f06480646064e', '064a064e0642064f06480644064f06480646064e',
         ['0627062806390628062f', '064806270648062806280643', '06470645', '062706280627062c063106270631', '06270628062f06280633'],
         ['0631062806280627', '0627062806280627', '06270645062806270645', '0635062f064106280627', '06280643'],
         5, 1, 571, 'yfwlwn -> yqwlwn | Q 3:16 alladhina YAQULUNA rabbana | rendered snippet fn-8-1'),
    ],
    9: [
        ('arabicFootnotes', '0639064e064a0650', '0639064e06460650',
         ['064806270628062806480645', '062706280627062c0631', '0648062806270645063106480628', '06280627062806450639063106480641', '064806280628064706480628'],
         ['062706280645062806430631', '0648062806330631063906480628', '06410628', '06270628062c0628063106270628', '064806270648062806280643'],
         5, 1, 31587, '`y -> `n | Q 3:114 wa-yanhawna `AN al-munkar | rendered snippet fn-9-1-18'),
    ],
   11: [
        ('arabicFootnotes', '062a064e064106520631064e0628064f064806270652', '062a064e064206520631064e0628064f064806270652',
         ['0633062806280627', '06280627062806470627', '06270628062f06280633', '06270645062806480627', '06280627'],
         ['06270628063506280647', '06270628062706280647', '0627062806280627062806280647', '06450628', '0627062806270628'],
         5, 1, 28741, 'tfrbwA -> tqrbwA | Q 4:43 la TAQRABU l-salat | rendered snippet fn-11-2-4'),
    ],
   12: [
        ('arabicFootnotes', '0627064406520641064f06310652062806500649', '0627064406520642064f06310652062806500649',
         ['0628062706450631', '0628062706280639062f0628', '0648062706280627062c06330633', '064806270628062806270628', '062f0628'],
         ['064806280628062c0628', '06390628', '062706280628062c06330627', '0648062706280645062806430631', '064806270628062806390628'],
         5, 1, 37362, "Alfrby -> Alqrby | Q 16:90 wa-ita'i dhi l-QURBA | rendered snippet fn-12-3-2"),
        ('arabicFootnotes', '06450650062b06520641064e06270644064e', '06450650062b06520642064e06270644064e',
         ['062f06310647', '062c062806310627', '06280631', '064806450628', '0628063906280628'],
         ['062f06310647', '063306310627062806310647', '060c', '06480627062c06430645', '062706280647'],
         5, 1, 37243, 'mthfAl -> mthqAl | Q 99:8; MITHQAL stands correct ten words earlier | rendered snippet fn-12-3-2'),
    ],
   13: [
        ('arabicFootnotes', '06270644065206410650064a064e0645064e06290650', '06270644065206420650064a064e0645064e06290650',
         ['0639062806330628060c', '06470648', '06270628062c06280645', '062706280627064306280631', '0648062806480645'],
         ['0628064306480628', '06390628062806470645', '063306470628062f0627', '062806450627', '06410639062806480647'],
         5, 1, 9397, 'Alfymh -> Alqymh | Q 4:159 wa-yawma l-QIYAMA | rendered snippet fn-13-3'),
    ],
   14: [
        ('arabicFootnotes', '0648064e0644064e0641064e062f0652', '0648064e0644064e0642064e062f0652',
         ['0643062806270628', '0627062806270628064506270628', '0645063906280628', '0641064806280647', '06280639062706280628'],
         ['063106270647', '0628063106280647', '0627062c06310628', '0647062f0647', '062706280639062806480645'],
         5, 1, 48817, "wlfd -> wlqd | Q 53:13 wa-LAQAD ra'ahu nazlatan ukhra | rendered snippet fn-14-2-10"),
        ('arabicFootnotes', '062806270644062a0648062706410644', '06280627064406460648062706410644',
         ['064806450627', '0628063106270628', '06390628062f0628', '06280628064106310628', '062706280628'],
         ['062c06280628', '0627062c06280647', '06410627062f0627', '0627062c0628062806280647', '064306280628'],
         5, 1, 12257, 'bAltwAfl -> bAlnwAfl | snippet only: the hadith qudsi `bi-l-NAWAFIL hatta uhibbah` | rendered snippet fn-14-1-7'),
    ],
   15: [
        ('arabicFootnotes', '0648064e0644064e0641064e062f0652', '0648064e0644064e0642064e062f0652',
         ['064806280627', '06450628062f0628', '06280643062806450628', '0627062806280647', '06450648062706390628062f0647'],
         ['062c0627', '0645', '0628062806270628', '06270628064506310633062806280628', '06450627'],
         5, 1, 58810, "wlfd -> wlqd | Q 6:34 wa-LAQAD ja'aka min naba'i l-mursalin | rendered snippet fn-15-1-22"),
        ('arabicFootnotes', '064a064e0641064f06480644064f06480646064e', '064a064e0642064f06480644064f06480646064e',
         ['0628063906280645', '0627062806470648', '06270628063306270628', '06280628062c063106280643', '06270628062f'],
         ['06280643', '06450628', '0627062806280643062f06280628', '0627062806470645', '06280627'],
         5, 1, 58344, 'yfwlwn -> yqwlwn | Q 6:33 la-yahzunuka lladhi YAQULUN | rendered snippet Sirr[200]'),
        ('arabicFootnotes', '0627064406520641064f063106520621064e06270646064e', '0627064406520642064f063106520621064e06270646064e',
         ['06450627', '0628062f0628063106480627', '062706280641063106270628', '0627062806280627', '06280628062f0628063106480628'],
         ['0647062f0647', '062706280633064806310647', '0645064306280647', '0633064806310647', '0627062806270628063906270645060c'],
         5, 1, 45706, "AlfrAn -> AlqrAn | Q 4:82 / 47:24 afala yatadabbaruna l-QUR'AN | rendered snippet fn-15-1-19"),
    ],
   16: [
        ('arabicFootnotes', '0641064e06270644064e', '0642064e06270644064e',
         ['062706280627', '0627062806310627064706280645', '062806270643062806410628', '06280641064806280647', '06480627062f'],
         ['0627062806310627064706280645', '06280627062806280647', '064106410637060c', '062706450627', '0641064806280647'],
         5, 1, 34946, 'fAl -> qAl | Q 6:74 wa-idh QALA Ibrahim li-abih | rendered snippet fn-16-2-6'),
    ],
   18: [
        ('arabicBody', '06280633062a0639062a0628', '064a0633062a0639062a0628',
         ['062c062806310627', '0648062706450627', '06450633062806280627', '06410628063906280647', '06270628'],
         ['0635062c0628062c', '062706280628062c062706310628', '0643062806270628', '062706280645063106350628', '062806270628'],
         5, 1, 27329, 'bst`tb -> yst`tb | Bukhari, fa-la`allahu an YASTA`TIB | lesson 24 arabicFootnotes @2584 carries the same sentence with yasta`tib'),
        ('arabicFootnotes', '06280633062a0639062a0628', '064a0633062a0639062a0628',
         ['062c062806310627', '0648062706450627', '06450633062806280627', '06410628063906280647', '06270628'],
         ['0635062c0628062c', '062706280628062c062706310628', '0643062806270628', '062706280645063106350628', '062806270628'],
         5, 1, 26602, 'bst`tb -> yst`tb | Bukhari, fa-la`allahu an YASTA`TIB | lesson 24 arabicFootnotes @2584 carries the same sentence with yasta`tib'),
        ('arabicFootnotes', '0641064e06310650064a0628064c', '0642064e06310650064a0628064c',
         ['06410628', '0631062c064506280647', '06270628', '0631062c06450628', '0627062806280647'],
         ['06450628', '062706280645062c0633062806280628', '06270628064506370628063906280628060c', '06280631062c06480647', '062706280645062c0633062806480628060c'],
         5, 1, 24889, 'fryb -> qryb | Q 7:56 inna rahmata llahi QARIB mina l-muhsinin | rendered snippet fn-18-2-3'),
    ],
   19: [
        ('arabicFootnotes', '0641064e064806520645065006470650060c', '0642064e064806520645065006470650060c',
         ['06270628062c0633063106280628', '0648062806450627', '0631062c0639', '0645064806330628', '062706280628'],
         ['0639063506280628', '063906350628', '06450628', '062c0647062806470645', '0627063306450627'],
         5, 1, 36328, 'fwmh -> qwmh | Q 7:150 wa-lamma raja`a Musa ila QAWMIHI ghadban | rendered snippet fn-19-2-9'),
        ('arabicFootnotes', '0641064e06270644064e', '0642064e06270644064e',
         ['06480627062c062f0627060c', '0627062806450627', '06270628062806370631', '063706280628', '062706280631064806280647'],
         ['06280628', '06280631062806280647', '06410647064506280627', '062706280647', '062806310628062f'],
         5, 1, 25126, 'fAl -> qAl | Q 7:143 QALA lan tarani | rendered snippet fn-19-1-10'),
        ('arabicFootnotes', '0641064e06270644064e', '0642064e06270644064e',
         ['06450627', '06470648', '0627063906370645', '06450628', '062f06280643'],
         ['06310628', '0627063106280647', '0628064106330643', '0627062806370631', '0627062806280643'],
         5, 1, 25003, 'fAl -> qAl | Q 7:143 QALA rabbi arini anzur ilayk | rendered snippet fn-19-1-10'),
        ('arabicFootnotes', '0641064e06480652064506500649', '0642064e06480652064506500649',
         ['0648062806450627', '064106270628', '06280647', '06270645062c0628064506280628', '06410628'],
         ['0648062706350628062c', '06390628062f06480627', '062706280639062c0628', '06450628', '06280639062f0647060c'],
         5, 1, 23198, 'fwmy -> qwmy | Q 7:142 ukhlufni fi QAWMI wa-aslih, the same aya quoted twice in one sentence; the first is repaired at @23149 | rendered snippet fn-19-4'),
        ('arabicFootnotes', '0641064e0648065206450650', '0642064e0648065206450650',
         ['062806270628062c0628062706410647060c', '064106270628', '06280647', '06270645062c0628064506280628', '06410628'],
         ['0648062706350628062c', '0648062806450627', '064106270628', '06280647', '06270645062c0628064506280628'],
         5, 1, 23150, 'fwm -> qwm | Q 7:142 ukhlufni fi QAWMI wa-aslih | rendered snippet fn-19-4'),
        ('arabicFootnotes', '0644064e0641064e062f0652', '0644064e0642064e062f0652',
         ['062806350641', '062806480645', '064106270628', '0627062806280627', '0639062f062706280627'],
         ['06280641062806280627', '0645', '06330639063106280627', '0647062f0627', '0628063506280627'],
         5, 1, 22633, 'lfd -> lqd | Q 18:62 LAQAD laqina min safarina hadha nasaba | rendered snippet fn-19-4'),
        ('arabicFootnotes', '0648064e0641064e06270644064f064806270652', '0648064e0642064e06270644064f064806270652',
         ['0628064106330647', '06450628', '06280633062706480645', '06270648', '0628063706280631'],
         ['06280645064806330628', '0645064706450627', '06280627062806280627', '06280647', '06450628'],
         5, 1, 11750, "wfAlwA -> wqAlwA | Q 7:132 wa-QALU mahma ta'tina bihi min aya | rendered snippet fn-19-2-2"),
    ],
   20: [
        ('arabicFootnotes', '0628064306310647', '064a064306310647',
         ['06410627063906280647', '06280631062f062f0628', '06390628', '062806410633', '062706280645064806450628'],
         ['06270628064506480628', '0648062706280627', '0627064306310647', '06450633062706280647', '062706280643064106270631'],
         5, 1, 7541, "bkrh -> ykrh | snippet only: the hadith qudsi `YAKRAHU l-mawt wa-ana akrahu masa'atah` | rendered snippet fn-20-b014"),
    ],
   21: [
        ('arabicFootnotes', '0641064f0644064f0648062806500647065006450652', '0642064f0644064f0648062806500647065006450652',
         ['0627062806430647063106280628', '062f0628062706310627', '0648064106270628', '0645064806330628', '0631062806280627', '0627063706450633', '063906280628', '062706450648062806470645', '064806270633062f062f', '063906280628'],
         ['062806280627', '062806480645062806480627', '062c06280628', '0628063106480627', '062706280639062f06270628', '062706280627062806280645', '0648062806430628', '0627062c062f0628', '0628063106270628', '062706280628'],
         10, 1, 35846, 'flwbhm -> qlwbhm | Q 10:88 wa-shdud `ala QULUBIHIM | rendered snippet fn-21-3-8'),
        ('arabicFootnotes', '0642064e062506500646', '0641064e062506500646',
         ['0639062806430645', '0648063906280645', '06270628', '062c062806430645', '0635063906280627'],
         ['062806430631', '0645062806430645', '0645062706280647', '06350627062806310647', '06280628062806480627'],
         5, 1, 32715, "qAn -> fAn | Q 8:66 FA-IN yakun minkum mi'atun sabira | rendered snippet fn-21-3-7"),
    ],
   23: [
        ('arabicFootnotes', '0627064406520641064f063106520621064e06270646064f', '0627064406520642064f063106520621064e06270646064f',
         ['06410628', '0641063106280633', '0628064806280627', '062806310628', '0647062f0627'],
         ['063906280628', '0631062c0628', '06450628', '06270628064106310628062806280628', '0639063706280645'],
         5, 1, 45373, "AlfrAn -> AlqrAn | Q 43:31 lawla nuzzila hadha l-QUR'AN | rendered snippet fn-23-4"),
        ('arabicFootnotes', '0644064e0641064e062f', '0644064e0642064e062f',
         ['0628062806410628', '0639062706310627', '06390628062806470645', '06410628062f0627', '06280641064806280647'],
         ['062806270628', '0627062806280647', '063906280628', '0627062806280628', '064106280628'],
         5, 1, 28095, 'lfd -> lqd | Q 9:117 LAQAD taba llahu `ala l-nabi; the prose two words earlier has laqad | rendered snippet Tawba[42]'),
    ],
   25: [
        ('arabicFootnotes', '0641064e06270644064e', '0642064e06270644064e',
         ['0648062706280628', '0627062c06430645', '06270628062c0643064506280628', '062706390628064506470645', '064806270639062f06470645'],
         ['06280639062706280628', '0648062806280648062c', '0627062806470648', '062806280633', '06450628'],
         5, 1, 28319, 'fAl -> qAl | Q 11:46 QALA ya Nuh innahu laysa min ahlik | rendered snippet fn-25-1-10'),
    ],
   26: [
        ('arabicFootnotes', '06270644065206410650063106500649', '06270644065206420650063106500649',
         ['06480643062f06280643', '0627062c062f', '063106280643', '0627062f06270627', '0627062c062f'],
         ['060c', '064806410628', '06310648062706280647', '0645063306280645', '06270628'],
         5, 1, 3994, 'Alfry -> Alqry | Q 11:102 idha akhadha l-QURA wa-hiya zalima | rendered snippet fn-26-b018'),
        ('arabicFootnotes', '06270652064406520641064f0631065006490670', '06270652064406520642064f0631065006490670',
         ['06280645', '06280641062806280647', '064106270628', '06280645', '064106310627', '06480643062f06280643', '0627062c062f', '063106280643', '0627062f0627', '0627062c062f'],
         ['064806470628', '06370627062806450647', '06270628', '0627062c062f0647', '0627062806280645', '0633062f0628062f', '0635062c0628062c', '062706280628062c062706310628', '0643062806270628', '06280641063306280631'],
         10, 1, 3846, 'Alfry -> Alqry | Q 11:102 idha akhadha l-QURA, the same lemma again | rendered snippet fn-26-b018'),
    ],
   27: [
        ('arabicFootnotes', '0648062a06420641064a', '0648062b06420641064a',
         ['064106270628', '0627062c062806450639', '06390628062f', '06270628062806280628', '064106310633062806270628'],
         ['06270648', '062806410641062806270628', '06480641063106330628', '06430628062806310647', '0633062c0645'],
         5, 1, 39529, 'wtqfy -> wthqfy | qurashiyyan wa-THAQAFI, glossed three words on by `aw thaqafiyyan wa-qurashi` | footnotesData.json fn-52-b021, same sentence, reads wa-thaqafi'),
        ('arabicFootnotes', '062a064306440649', '062b064306440649',
         ['06450628', '062c063106280647', '064106270628', '062c06310628', '06330628063906280628'],
         ['064106270628', '06450627', '0627062c06310647', '064106270628', '0627062c0631'],
         5, 1, 17064, 'tkly -> thkly | snippet only: hazana sab`ina THAKLA | rendered snippet fn-27-b003'),
        ('arabicFootnotes', '0641064e06270644064f064806270652', '0642064e06270644064f064806270652',
         ['0628062c0648', '064506350631', '0628062806450627', '062f062c062806480627', '0639062806280647'],
         ['06280627062806470627', '062c0627', '06410628', '0645063506280641', '062706280628'],
         5, 1, 16824, 'fAlwA -> qAlwA | Q 12:88 fa-lamma dakhalu `alayhi QALU | rendered snippet Ibn Abī Shayba[1]'),
    ],
   28: [
        ('arabicFootnotes', '062f06310628062a', '062f0631064a062a',
         ['06280627', '0627062f06310628060c', '0628064106480628', '06280647', '06280627'],
         ['064806280627', '0628062806280628060c', '06450627', '0639063106410628', '064806280627'],
         5, 1, 35827, 'drbt -> dryt | snippet only: the formula `la DARAYTA wa-la talayta`, glossed `ma `arafta wa-la ta`allamta` beside it | rendered snippet Fayḍ[9]'),
    ],
   29: [
        ('arabicFootnotes', '0623064606460649', '06230646062b0649',
         ['064106270628', '06270628', '06310628', '0627062f06430631', '06270645'],
         ['0627063306410628', '06270645', '063306390628062f', '064106450627', '06270628063106310641'],
         5, 1, 67247, 'Anny -> Anthy | snippet only: a-dhakarun am UNTHA | rendered snippet fn-33-b019'),
        ('arabicFootnotes', '0623062d0631064206460647', '0623062d06310642062a0647',
         ['0647062f0627', '062706280641063106270628', '06410628', '0627064706270628', '06450627'],
         ['06270628062806270631', '060c', '06280648', '064306270628', '062706280641063106270628'],
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
                ('|'.join(A.hx(x) for x in old.split('|')),
                 A.hx(new), [A.hx(x) for x in lead],
                 [A.hx(x) for x in tail], width, mult, hint, note))
        for field, rows in by_field.items():
            text = data.get(field) or ''
            text, a, s, log = A.apply_rows(text, rows, f'lesson {lesson:02d} {field}',
                                           nfold=A.dotfold)
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
