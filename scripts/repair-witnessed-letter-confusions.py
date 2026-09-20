#!/usr/bin/env python3
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
"""
import json, sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'lessons'

# lesson, field, offset, expected word as codepoints, index of the letter to
# swap, its replacement, before -> after, what settles the reading, the witness
SITES = [
    (  5, 'arabicFootnotes',   9878, '064a06280642064a0639', 0, '0628',
     'ybqy` -> bbqy`',
     'marra bi-Baqi` al-Gharqad',
     'footnotesData.json fn-5-10, same sentence, reads bi-Baqi`'),
    (  6, 'arabicFootnotes',  26461, '064a06420631064a0646', 3, '0628',
     'yqryn -> yqrbn',
     'la YAQRABANNA al-salata sakran',
     'footnotesData.json fn-6-23, same sentence, reads yaqrabanna'),
    (  7, 'arabicFootnotes',  27052, '062a062d0628064a', 2, '064a',
     'tHby -> tHyy',
     'Q 2:260 kayfa TUHYI l-mawta, inside `nahnu ahaqqu bi-l-shakk min Ibrahim`',
     'footnotesData.json fn-7-25 reads tuhyi; Q 2:260 settles it independently'),
    ( 27, 'arabicFootnotes',  39527, '0648062a06420641064a', 1, '062b',
     'wtqfy -> wthqfy',
     'qurashiyyan wa-THAQAFI, glossed three words on by `aw thaqafiyyan wa-qurashi`',
     'footnotesData.json fn-52-b021, same sentence, reads wa-thaqafi'),
    ( 18, 'arabicBody',  27327, '06280633062a0639062a0628', 0, '064a',
     'bst`tb -> yst`tb',
     'Bukhari, fa-la`allahu an YASTA`TIB',
     'lesson 24 arabicFootnotes @2584 carries the same sentence with yasta`tib'),
    ( 18, 'arabicFootnotes',  26600, '06280633062a0639062a0628', 0, '064a',
     'bst`tb -> yst`tb',
     'Bukhari, fa-la`allahu an YASTA`TIB',
     'lesson 24 arabicFootnotes @2584 carries the same sentence with yasta`tib'),
    (  1, 'arabicFootnotes',  18412, '0642064e06270646062a064e0647064f06480627', 0, '0641',
     'qAnthwA -> fAnthwA',
     'Q 59:7 wa-ma nahakum `anhu FA-NTAHU',
     'rendered snippet fn-1-18'),
    (  1, 'arabicFootnotes',  18436, '0641064f06440650', 0, '0642',
     'fl -> ql',
     'Q 3:31 QUL in kuntum tuhibbuna llah',
     'rendered snippet fn-1-18'),
    (  1, 'arabicFootnotes',  41503, '062706440631064306270629', 2, '0632',
     'AlrkAh -> AlzkAh',
     'snippet only: Bukhari kitab al-ZAKAT, the same chapter name again',
     'rendered snippet fn-1-49'),
    (  1, 'arabicFootnotes',  41594, '062706440631064306270629', 2, '0632',
     'AlrkAh -> AlzkAh',
     'snippet only: Bukhari kitab al-ZAKAT',
     'rendered snippet fn-1-49'),
    (  3, 'arabicFootnotes',  27195, '063006460648064a06470645', 3, '0628',
     'dhnwyhm -> dhnwbhm',
     'snippet only: li-yuhatta biha DHUNUBUHUM',
     'rendered snippet fn-3-38'),
    (  5, 'arabicFootnotes',  57673, '063006430631062a064a', 3, '0646',
     'dhkrty -> dhkrny',
     'the same hadith reads DHAKARANI three words on',
     'rendered snippet fn-5-45'),
    (  5, 'arabicFootnotes',  57767, '062a06420631064a062a', 3, '0628',
     'tqryt -> tqrbt',
     'the same hadith reads TAQARRABTU twelve words on',
     'rendered snippet fn-5-45'),
    (  5, 'arabicFootnotes',  70537, '062a0645062a', 0, '0646',
     'tmt -> nmt',
     'his wife has just said `inni qad NAMT`',
     'rendered snippet fn-5-53'),
    (  5, 'arabicFootnotes',  76371, '0645064e06410650064a0644064b0627', 2, '0642',
     'mfylA -> mqylA',
     'Q 25:24 wa-ahsanu MAQILA',
     'rendered snippet fn-5-57'),
    (  6, 'arabicFootnotes',  34004, '06270644064a062a0629', 2, '0628',
     'Alyth -> Albth',
     'snippet only: wa-lahu l-janna al-BATTA',
     'rendered snippet fn-6-29'),
    (  6, 'arabicFootnotes',  55214, '0648064e0641064f06480645064f064806270652', 2, '0642',
     'wfwmwA -> wqwmwA',
     'Q 2:238 wa-QUMU lillahi qanitin',
     'rendered snippet fn-6-51'),
    (  6, 'arabicFootnotes',  55231, '0641064e06460650062a0650064a0646064e060c', 0, '0642',
     'fntyn -> qntyn',
     'Q 2:238 wa-qumu lillahi QANITIN',
     'rendered snippet fn-6-51'),
    (  6, 'arabicFootnotes',  55632, '064a062806270628', 0, '0628',
     'ybAb -> bbAb',
     'snippet only: nahran BI-BAB ahadikum',
     'rendered snippet fn-6-53'),
    (  6, 'arabicFootnotes',  67603, '0648064e0628064e06410650064a0651064e0629064c', 4, '0642',
     'wbfyh -> wbqyh',
     'Q 2:248 wa-BAQIYYA; al-Qurtubi glosses it `ikhtulifa fi l-baqiyya` in the next clause',
     'rendered snippet fn-6-64'),
    (  7, 'arabicFootnotes',  19201, '0641064e06270644064e', 0, '0642',
     'fAl -> qAl',
     'Q 2:258 idh QALA Ibrahim rabbiya lladhi yuhyi wa-yumit',
     'rendered snippet Al-Ṣāwī[3]'),
    (  7, 'arabicFootnotes',  19484, '0641064e06270644064e', 0, '0642',
     'fAl -> qAl',
     'Q 2:258 QALA Ibrahim fa-inna llaha ya\'ti bi-l-shams',
     'rendered snippet Al-Sawi[3]'),
    (  8, 'arabicFootnotes',    571, '064a064e0641064f06480644064f06480646064e', 2, '0642',
     'yfwlwn -> yqwlwn',
     'Q 3:16 alladhina YAQULUNA rabbana',
     'rendered snippet fn-8-1'),
    (  9, 'arabicFootnotes',  31587, '0639064e064a0650', 2, '0646',
     '`y -> `n',
     'Q 3:114 wa-yanhawna `AN al-munkar',
     'rendered snippet fn-9-1-18'),
    ( 11, 'arabicFootnotes',  28739, '062a064e064106520631064e0628064f064806270652', 2, '0642',
     'tfrbwA -> tqrbwA',
     'Q 4:43 la TAQRABU l-salat',
     'rendered snippet fn-11-2-4'),
    ( 12, 'arabicFootnotes',  37241, '06450650062b06520641064e06270644064e', 4, '0642',
     'mthfAl -> mthqAl',
     'Q 99:8; MITHQAL stands correct ten words earlier',
     'rendered snippet fn-12-3-2'),
    ( 12, 'arabicFootnotes',  37360, '0627064406520641064f06310652062806500649', 3, '0642',
     'Alfrby -> Alqrby',
     'Q 16:90 wa-ita\'i dhi l-QURBA',
     'rendered snippet fn-12-3-2'),
    ( 13, 'arabicFootnotes',   9397, '06270644065206410650064a064e0645064e06290650', 3, '0642',
     'Alfymh -> Alqymh',
     'Q 4:159 wa-yawma l-QIYAMA',
     'rendered snippet fn-13-3'),
    ( 14, 'arabicFootnotes',  12257, '062806270644062a0648062706410644', 3, '0646',
     'bAltwAfl -> bAlnwAfl',
     'snippet only: the hadith qudsi `bi-l-NAWAFIL hatta uhibbah`',
     'rendered snippet fn-14-1-7'),
    ( 14, 'arabicFootnotes',  48816, '0648064e0644064e0641064e062f0652', 4, '0642',
     'wlfd -> wlqd',
     'Q 53:13 wa-LAQAD ra\'ahu nazlatan ukhra',
     'rendered snippet fn-14-2-10'),
    ( 15, 'arabicFootnotes',  45704, '0627064406520641064f063106520621064e06270646064e', 3, '0642',
     'AlfrAn -> AlqrAn',
     'Q 4:82 / 47:24 afala yatadabbaruna l-QUR\'AN',
     'rendered snippet fn-15-1-19'),
    ( 15, 'arabicFootnotes',  58342, '064a064e0641064f06480644064f06480646064e', 2, '0642',
     'yfwlwn -> yqwlwn',
     'Q 6:33 la-yahzunuka lladhi YAQULUN',
     'rendered snippet Sirr[200]'),
    ( 15, 'arabicFootnotes',  58808, '0648064e0644064e0641064e062f0652', 4, '0642',
     'wlfd -> wlqd',
     'Q 6:34 wa-LAQAD ja\'aka min naba\'i l-mursalin',
     'rendered snippet fn-15-1-22'),
    ( 16, 'arabicFootnotes',  34945, '0641064e06270644064e', 0, '0642',
     'fAl -> qAl',
     'Q 6:74 wa-idh QALA Ibrahim li-abih',
     'rendered snippet fn-16-2-6'),
    ( 18, 'arabicFootnotes',  24887, '0641064e06310650064a0628064c', 0, '0642',
     'fryb -> qryb',
     'Q 7:56 inna rahmata llahi QARIB mina l-muhsinin',
     'rendered snippet fn-18-2-3'),
    ( 19, 'arabicFootnotes',  11749, '0648064e0641064e06270644064f064806270652', 2, '0642',
     'wfAlwA -> wqAlwA',
     'Q 7:132 wa-QALU mahma ta\'tina bihi min aya',
     'rendered snippet fn-19-2-2'),
    ( 19, 'arabicFootnotes',  22632, '0644064e0641064e062f0652', 2, '0642',
     'lfd -> lqd',
     'Q 18:62 LAQAD laqina min safarina hadha nasaba',
     'rendered snippet fn-19-4'),
    ( 19, 'arabicFootnotes',  23149, '0641064e0648065206450650', 0, '0642',
     'fwm -> qwm',
     'Q 7:142 ukhlufni fi QAWMI wa-aslih',
     'rendered snippet fn-19-4'),
    ( 19, 'arabicFootnotes',  25002, '0641064e06270644064e', 0, '0642',
     'fAl -> qAl',
     'Q 7:143 QALA rabbi arini anzur ilayk',
     'rendered snippet fn-19-1-10'),
    ( 19, 'arabicFootnotes',  25125, '0641064e06270644064e', 0, '0642',
     'fAl -> qAl',
     'Q 7:143 QALA lan tarani',
     'rendered snippet fn-19-1-10'),
    ( 19, 'arabicFootnotes',  36327, '0641064e064806520645065006470650060c', 0, '0642',
     'fwmh -> qwmh',
     'Q 7:150 wa-lamma raja`a Musa ila QAWMIHI ghadban',
     'rendered snippet fn-19-2-9'),
    ( 20, 'arabicFootnotes',   7541, '0628064306310647', 0, '064a',
     'bkrh -> ykrh',
     'snippet only: the hadith qudsi `YAKRAHU l-mawt wa-ana akrahu masa\'atah`',
     'rendered snippet fn-20-b014'),
    ( 21, 'arabicFootnotes',  32715, '0642064e062506500646', 0, '0641',
     'qAn -> fAn',
     'Q 8:66 FA-IN yakun minkum mi\'atun sabira',
     'rendered snippet fn-21-3-7'),
    ( 21, 'arabicFootnotes',  35846, '0641064f0644064f0648062806500647065006450652', 0, '0642',
     'flwbhm -> qlwbhm',
     'Q 10:88 wa-shdud `ala QULUBIHIM',
     'rendered snippet fn-21-3-8'),
    ( 23, 'arabicFootnotes',  28094, '0644064e0641064e062f', 2, '0642',
     'lfd -> lqd',
     'Q 9:117 LAQAD taba llahu `ala l-nabi; the prose two words earlier has laqad',
     'rendered snippet Tawba[42]'),
    ( 23, 'arabicFootnotes',  45372, '0627064406520641064f063106520621064e06270646064f', 3, '0642',
     'AlfrAn -> AlqrAn',
     'Q 43:31 lawla nuzzila hadha l-QUR\'AN',
     'rendered snippet fn-23-4'),
    ( 25, 'arabicFootnotes',  28318, '0641064e06270644064e', 0, '0642',
     'fAl -> qAl',
     'Q 11:46 QALA ya Nuh innahu laysa min ahlik',
     'rendered snippet fn-25-1-10'),
    ( 26, 'arabicFootnotes',   3846, '06270652064406520641064f0631065006490670', 4, '0642',
     'Alfry -> Alqry',
     'Q 11:102 idha akhadha l-QURA, the same lemma again',
     'rendered snippet fn-26-b018'),
    ( 26, 'arabicFootnotes',   3994, '06270644065206410650063106500649', 3, '0642',
     'Alfry -> Alqry',
     'Q 11:102 idha akhadha l-QURA wa-hiya zalima',
     'rendered snippet fn-26-b018'),
    ( 27, 'arabicFootnotes',  16824, '0641064e06270644064f064806270652', 0, '0642',
     'fAlwA -> qAlwA',
     'Q 12:88 fa-lamma dakhalu `alayhi QALU',
     'rendered snippet Ibn Abī Shayba[1]'),
    ( 27, 'arabicFootnotes',  17064, '062a064306440649', 0, '062b',
     'tkly -> thkly',
     'snippet only: hazana sab`ina THAKLA',
     'rendered snippet fn-27-b003'),
    ( 28, 'arabicFootnotes',  35825, '062f06310628062a', 2, '064a',
     'drbt -> dryt',
     'snippet only: the formula `la DARAYTA wa-la talayta`, glossed `ma `arafta wa-la ta`allamta` beside it',
     'rendered snippet Fayḍ[9]'),
    ( 29, 'arabicFootnotes',   5952, '0623062d0631064206460647', 4, '062a',
     'AHrqnh -> AHrqth',
     'the next clause of the same hadith reads `ma AKALATHU l-nar`',
     'rendered snippet fn-29-b024'),
    ( 29, 'arabicFootnotes',  67245, '0623064606460649', 2, '062b',
     'Anny -> Anthy',
     'snippet only: a-dhakarun am UNTHA',
     'rendered snippet fn-33-b019'),
    ( 19, 'arabicFootnotes',  23197, '0641064e06480652064506500649', 0, '0642',
     'fwmy -> qwmy',
     'Q 7:142 ukhlufni fi QAWMI wa-aslih, the same aya quoted twice in one sentence; the first is repaired at @23149',
     'rendered snippet fn-19-4'),
]


def hx(s):
    return ''.join(chr(int(s[i:i + 4], 16)) for i in range(0, len(s), 4))


def main(write=False):
    done = skipped = 0
    classes = Counter()
    by_lesson = {}
    for row in SITES:
        by_lesson.setdefault(row[0], []).append(row)
    for lesson in sorted(by_lesson):
        p = ROOT / f'{lesson:02d}.json'
        L = json.loads(p.read_text(encoding='utf-8'))
        touched = 0
        print(f'  lesson {lesson:02d}')
        # descending offset per field, so earlier swaps cannot move later ones
        for les, field, off, word, idx, cp, note, what, witness in sorted(
                by_lesson[lesson], key=lambda r: (r[1], -r[2])):
            text = L.get(field) or ''
            old = hx(word)
            new = old[:idx] + chr(int(cp, 16)) + old[idx + 1:]
            here = text[off:off + len(old)]
            if here == new:
                skipped += 1
                continue
            assert here == old, (
                f'lesson {lesson:02d} {field} @{off}: found '
                f'{[hex(ord(c)) for c in here]}, expected '
                f'{[hex(ord(c)) for c in old]} - the file has moved under this table')
            assert len(new) == len(old)
            L[field] = text[:off] + new + text[off + len(old):]
            classes[f'{ord(old[idx]):04x}>{cp}'] += 1
            print(f'    {field:16s} @{off:<6} {note:<16} {what}')
            print(f'    {"":16s} {"":7} witness: {witness}')
            touched += 1
            done += 1
        if write and touched:
            p.write_text(json.dumps(L, ensure_ascii=False), encoding='utf-8')
    print(f'\n{done} words repaired'
          + (f', {skipped} already repaired' if skipped else ''))
    for k, v in classes.most_common():
        print(f'  {k}  {v}')
    if write:
        print('WRITTEN')


if __name__ == '__main__':
    main('--write' in sys.argv)
