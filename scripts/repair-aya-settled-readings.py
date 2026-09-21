#!/usr/bin/env python3
"""Fifth repair pass: readings the aya settles, whatever letter it takes.

The four earlier passes would only swap a letter for another letter inside the
eight confusion classes the brief names (qaf/fa, ha/jim, dal/dhal, ra/zay,
sad/dad, `ayn/ghayn, nun/lam, and ba/ta/tha/nun/ya among themselves).  That
rule is a property of those scripts, not of the evidence.  Where a Qur\'anic
citation is aligned to its aya and the aya fixes the word, the substitution
here is whatever gets from the scan\'s form to the aya\'s -- one letter or two,
in class or out.  The site is still anchored by offset and codepoint, the swap
is still length-preserving, and a site the aya does not settle is left alone.

Every row carries the aya it was checked against and the score behind it: the
number of the site\'s distinct +-4 neighbour words that occur within +-4 of the
target in that aya.  Read the score as the strength of the witness, not as the
warrant -- see the two paragraphs at the end of section 1.

1.  GHAYN FOLLOWED BY FA -- 318 sites, class `ghfr`

    The scan loses the fa\'s dot and writes mim, ba, qaf, ha or `ayn in its
    place, so `ghafur\' comes out as `ghamur\', `ghabur\', `ghaqur\',
    `ghahur\'; `yaghfir\' as `yaghmir\', `yaghbir\'; `maghfira\' as
    `maghmira\'; `ghafla\' as `ghamla\'; `istaghfara\' as `istaghmara\'.

    The implemented criterion is not a root but a letter pair: the target is a
    mushaf word in which GHAYN is immediately followed by FA.  294 of the 318
    are from ghafara, 22 from ghafala (`ghafla\', `ghafilin\', `aghfalna\'),
    and 2 are `shaghafaha\' at Q 12:30.  Calling the set `the ghayn-fa-ra
    family\' would leave 24 sites outside its own description.

    A site qualifies only where ALL of these hold:
      - its raw skeleton differs from such a mushaf word in exactly one
        position, and that position is the fa;
      - the letter standing in the fa\'s place is mim, ba, qaf, ha or `ayn.
        YA is excluded on purpose: ya in the fa slot yields real words --
        `ghayur\', `aghyar\', `yughayyir\' -- and would fire on sound text;
      - exactly one mushaf word answers that description, so the target is not
        a choice;
      - the scan\'s own form is NOT itself a mushaf word;
      - and the neighbour score reaches 2 somewhere in the mushaf.

    Five candidates passed the skeleton test and were REJECTED by hand:
      L16 fn @22863   `ighbarra\', a name gone dusty -- not `ighfir\'
      L55 body @50881 `ghubar\' glossing Q 100:4 `naq`an\' -- not `ghaffar\'
      L56 body @26492 al-Fatiha `ghayr al-maghdub\', ya read as ba
      L30 body @3361  `Umar b. `Abd al-`Aziz, `ayn read as ghayn
      L54 body @28404 Q 82:4 `al-qubur\', qaf read as ghayn
    Eight more dropped automatically because the scan\'s form is itself a
    mushaf word.  `al-ghabirin\' is the one that matters: strip the dagger
    alif and Q 7:83 `al-ghabirin\' and Q 7:155 `al-ghafirin\' share a
    skeleton.

    THE AYA COLUMN WAS WRONG AT 57 SITES IN THE FIRST VERSION OF THIS SCRIPT.
    It had been taken from whichever aya containing the target word had the
    most neighbours anywhere in it, which is not the same as the aya the
    passage is quoting.  It is now computed slot by slot -- every position in
    the mushaf where the target word stands is scored separately -- and the
    outliers were read one at a time.  Thirty-one sites could not be settled
    that way and their aya is named by hand from the passage; two are marked
    `-\' because no single aya is being quoted (L4 fn @14489 uses `rabbi
    ghfir li\' as a formula, and L1 body @13441 is not Qur\'anic at all).

    For 24 sites the score is 1 and for 7 it is 0.  Those sites were kept
    because the four structural conditions above already fix the target: one
    mushaf word answers the skeleton, and the scan\'s form is not a word.
    The aya named beside them is a reading of the passage, not a machine
    result.  Anyone auditing this file should start there.

2.  `mi\' for `fi\' -- 242 sites, class `fi`

    The scan writes MIM + YA/MAQSURA for both `fi\' and `min\', and mim/fa is
    not a confusion the earlier rule admits, so every one was left.  These are
    settled slot by slot: for each candidate aya every `fi\' slot and every
    `min\' slot is scored by how many of the lesson\'s +-3 neighbours fall
    within +-3 of it, and the site is repaired only where the best slot is a
    `fi\', scores at least three, and beats the best `min\' slot outright.

    302 `mi\' remain in the corpus.  119 scored `min\' level with `fi\' and 75
    scored `min\' higher; the rest sit outside any citation the aligner can
    anchor.  None was guessed.

3.  Twenty-five sites confirmed one at a time -- class `named`

    Each carries its own warrant in the table.  Three deserve saying aloud:
      - L45 @16598 `fa-li-dhalika\' was written by the first pass and REVERTED
        by the second, because finishing the citation needed `fadi`u\' and jim
        for fa was out of class.  It is written again now that @16609 can be
        finished with it.  Half a citation was the reason to revert; the whole
        citation is the reason to restore.  The two REVERTS rows in
        complete-quranic-letter-confusions.py that undid it and L16 @13075
        were deleted in the same change, since they now abort that script.
      - L5 fn @47311 is listed on the AK worklist as the Hajjaj / Yahya b.
        Ya`mar report with the record reading `qnbdh\'.  It is nothing of the
        kind: the line reads `qala llahu `azza wa-jall QATABADHUHU wara\'a
        zuhurihim wa-shtaraw bihi thamanan qalilan\', which is Q 3:187
        `fa-nabadhuhu\'.  Two letters, both in class, settled by the aya.
      - L1 @13441 `riy\'\' for `ru\'iya\' is a transposition, not a
        substitution: the hamza seat and the ya stand in each other\'s places.
        `riy\'\' is not an Arabic word and the passive of ra\'a is the only
        reading the sentence admits.

    THE SAME SENTENCE CAN BE CORRUPTED TWO DIFFERENT WAYS, AND ONE ROW THEN
    COVERS ONLY ONE OF THEM.  The Sibawayh anecdote stands twice in Lesson 1.
    `arabicBody\' @13441 read `ry\'\' and `arabicFootnotes\' @20074 reads
    `rb\'\' -- ba, not ya.  The first version of this file carried the body
    row alone, so the footnote kept the wrong reading twenty thousand
    characters from the right one.  `rb\'\' is the worse of the two to leave
    standing, because `rabi\'a\' is a real verb, "to keep lookout", and its
    skeleton is also the mushaf\'s `rabbi\': the footnote reads as Arabic and
    nothing downstream would have caught it.  Both rows are here now.
    The corpus corroborates the repair on its own: scholars.json spells the
    same passive `r\'y\' at al-Ghazali[7], `majnun Layla RU\'IYA `ala katifihi
    kalb\', and the Sibawayh record is the only place it is spelt otherwise.

    That prompted a sweep of all 578 sites for the general case -- a parallel
    copy of a repaired word carrying a DIFFERENT misreading, which a table keyed
    to one corrupt form cannot see.  Lessons 1-30 carry much of arabicBody again
    in arabicFootnotes; the two word sequences were aligned per lesson and every
    repaired site mapped to its partner.  356 sites had a parallel copy, 192 are
    in lessons 31-56 where arabicFootnotes is empty, and 30 the alignment could
    not map were retried by anchoring on neighbours instead of on the word: 22
    of those have no parallel passage at all.  FOUR partners carried a different
    corruption, three of them written here:

      L1  fn   @20074  rb\'    -> ru\'iya     (above)
      L7  body @36850  mih    -> fi          Q 2:284
      L11 body @26066  ta`mir -> wa-yaghfir  Q 4:48

    The fourth, L16 body @19367, reads `fi\' with the ya simply absent -- a
    missing letter, not a substitution, so it is out of scope and on the
    worklist.

    Each of the three drags in the rest of its citation, because half a
    citation is worse than none:
      L7  body @36892 `fih\' and @36897 `anmusikum\' complete Q 2:284;
      L11 body @26026 `at\' and @26039 `ya`mir\' complete Q 4:48.
    Q 4:48 in that copy still ends `yasha\'ah\' for `yasha\'u\': a letter too
    many, which cannot be removed without moving every later offset.

    L11 @26039 and @26066 are also the one place where the GHAYN is damaged as
    well as the fa -- `yaghfir\' read as `ya`mir\'.  Section 1 requires the
    ghayn to be intact, so that whole class was invisible to this pass.  It is
    1,005 candidates corpus-wide and it is NOT worked here: 726 of them are the
    name `Umar and most of the rest are sound `amal, `aql, `abara.  Only 46
    reach a neighbour score of 2.  It belongs in a pass of its own.

    NOT WRITTEN, THOUGH IT WAS IN THE FIRST VERSION OF THIS FILE: L21 body
    @5220 `miyyatan\' for Q 8:45 `fi\'atan\'.  Moving the mim alone leaves
    `fiyyatan\', which is not a word -- the ya and its shadda stay behind --
    and 7 characters cannot become 6 in a length-preserving write.  The
    reading is settled and the write is not available.  It is on the worklist
    beside the word-boundary cases.

4.  THE HAMZA-SEAT POLICY IS SET ASIDE HERE, DELIBERATELY

    The earlier scripts refuse to overwrite a hamza seat on principle, because
    a seat is an orthographic choice and not damage.  Four sites break that
    rule, and only because an aya decides the letter:
        L21 @29999  mi\'aq    -> mithaq    Q 8:72
        L50 @40403  ka-ma\'al -> ka-mathal Q 59:15
        L56 @25114  yufi\'un  -> yuqinun   Q 2:4  (with the fa/qaf beside it)
        L9  @10750  ghani\'u  -> ghaniyy   Q 3:97
    L50 was recorded as Q 2:261 in the first version of this file.  The
    passage is Q 59:15, `ka-mathali lladhina min qablihim qariban\'.  The
    reading survives the error because `ka-mathal\' stands in both, but a site
    that breaks a standing policy on the ground that an aya decides it has to
    name the right aya.

5.  NOT TOUCHED, AND WHY

      - Lesson 8, by instruction.
      - Word boundaries.  `thumma-ttaqaw\' (L15 body @13337, Q 5:93) and
        `alqaw-ma\' (L37 body @12887, Q 10:80) need a space INSERTED, which
        moves every later offset in that field.  67 anchors in L15
        `arabicBody\' and 23 in L37 `arabicBody\', across three of the four
        earlier scripts, sit after the insertion point.
      - Q 2:229 `al-talaqu marratan\' (L6 body @34198, fn @41992, fn @42962),
        for the same reason: an alif has to be inserted, and 66 anchors in L6
        `arabicBody\' and 20 in `arabicFootnotes\' lie after it.

Usage: dry run by default; pass --write to apply.  Idempotent: a site whose
letters already read as the repair wants is skipped.
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WRITE = '--write' in sys.argv

# (field, offset, codepoints of the word as the file holds it,
#  ((index into the word, new codepoint), ...), verse, neighbour score,
#  class, note)
FIXES = {
    1: [
        ('arabicBody',  13441, '0631064a0626', ((1, '0626'), (2, '064a'), ), '-', 0, 'named', 'riy\' -> RU\'IYA Sibawayh fi l-janna'),
        ('arabicFootnotes',  20074, '063106280626', ((1, '0626'), (2, '064a'), ), '-', 0, 'named', 'riy\' -> RU\'IYA; the SECOND copy of the Sibawayh sentence, corrupted as `rb\'` not `ry\'`'),
    ],
    2: [
        ('arabicBody',   2091, '0648064e064a064e063a0652064506500631064f', ((6, '0641'), ), '4:48', 5, 'ghfr', 'ويغمر -> ويغفر'),
        ('arabicBody',   2063, '064a064e063a0652064506500631064f', ((4, '0641'), ), '4:48', 3, 'ghfr', 'يغمر -> يغفر'),
    ],
    4: [
        ('arabicFootnotes',  14489, '0625063a06520645065006310652', ((3, '0641'), ), '-', 0, 'ghfr', 'اغمر -> اغفر'),
    ],
    5: [
        ('arabicBody',  60261, '0648064e062706330652062a064e063a0652063906500631064f06480627', ((9, '0641'), ), '2:199', 2, 'ghfr', 'واستغعروا -> واستغفروا'),
        ('arabicBody',  59552, '06450650064a', ((0, '0641'), ), '2:197', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  52667, '06450650064a', ((0, '0641'), ), '2:178', 6, 'fi', 'mi -> FI'),
        ('arabicBody',  47377, '06450650064a', ((0, '0641'), ), '2:159', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  43973, '0645064e063a0652064506500631064e0629', ((4, '0641'), ), '3:133', 2, 'ghfr', 'مغمره -> مغفره'),
        ('arabicBody',  42068, '06450650064a', ((0, '0641'), ), '2:144', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  13176, '0645064a', ((0, '0641'), ), '2:114', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  75900, '06450650064a', ((0, '0641'), ), '2:201', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  75507, '063a064e0645064f06480631064c', ((2, '0641'), ), '2:173', 2, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  75457, '0648064e062706330652062a064e063a0652063906500631064f06480627', ((9, '0641'), ), '2:199', 2, 'ghfr', 'واستغعروا -> واستغفروا'),
        ('arabicFootnotes',  74758, '06450650064a', ((0, '0641'), ), '2:197', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  72884, '063a064e0645064f06480631064c', ((2, '0641'), ), '2:192', 3, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  66673, '06450650064a', ((0, '0641'), ), '2:178', 6, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  65584, '062806500627064406520645064e063a0652064506500631064e06290650', ((9, '0641'), ), '2:175', 3, 'ghfr', 'بالمغمره -> بالمغفره'),
        ('arabicFootnotes',  65185, '063a064e0645064f06480631064c', ((2, '0641'), ), '2:173', 4, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  61416, '06450650064a', ((0, '0641'), ), '2:159', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  55522, '0645064e063a0652064506500631064e0629', ((4, '0641'), ), '3:133', 2, 'ghfr', 'مغمره -> مغفره'),
        ('arabicFootnotes',  53468, '06450650064a', ((0, '0641'), ), '2:144', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  47311, '0642064e062a064e0628064e0630064f06480647', ((0, '0641'), (2, '0646'), ), '3:187', 3, 'named', 'qatabadhuhu -> FA-NAbadhuhu wara\'a zuhurihim'),
        ('arabicFootnotes',  14389, '0645064a', ((0, '0641'), ), '2:114', 4, 'fi', 'mi -> FI'),
    ],
    6: [
        ('arabicBody',  50144, '06450650064a', ((0, '0641'), ), '2:246', 6, 'fi', 'mi -> FI'),
        ('arabicBody',  31869, '063a064e0628064f06480631064c', ((2, '0641'), ), '24:62', 4, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',  31852, '063a064e0645064f06480631064c', ((2, '0641'), ), '24:33', 4, 'ghfr', 'غمور -> غفور'),
        ('arabicBody',  31609, '063a064e0628064f06480631064c', ((2, '0641'), ), '2:225', 2, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',  22250, '06450650064a', ((0, '0641'), ), '5:91', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  19427, '063a064e0628064f06480631', ((2, '0641'), ), '2:218', 3, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',   9037, '06450650064a', ((0, '0641'), ), '2:208', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  64855, '06450650064a', ((0, '0641'), ), '2:246', 6, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  64688, '06450650064a', ((0, '0641'), ), '2:246', 6, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  64055, '06450650064a', ((0, '0641'), ), '2:261', 7, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  50507, '063a064e0628064f06480631064c', ((2, '0641'), ), '2:235', 3, 'ghfr', 'غبور -> غفور'),
        ('arabicFootnotes',  38910, '063a064e0628064f06480631064c', ((2, '0641'), ), '24:62', 4, 'ghfr', 'غبور -> غفور'),
        ('arabicFootnotes',  38893, '063a064e0645064f06480631064c', ((2, '0641'), ), '24:33', 4, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  38655, '063a064e0628064f06480631064c', ((2, '0641'), ), '2:225', 2, 'ghfr', 'غبور -> غفور'),
        ('arabicFootnotes',  35523, '0648064e0627064406520645064e063a0652064506500631064e06290650', ((9, '0641'), ), '2:221', 2, 'ghfr', 'والمغمره -> والمغفره'),
        ('arabicFootnotes',  25743, '06450650064a', ((0, '0641'), ), '5:91', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  22498, '063a064e0628064f06480631', ((2, '0641'), ), '2:218', 3, 'ghfr', 'غبور -> غفور'),
        ('arabicFootnotes',   9578, '06450650064a', ((0, '0641'), ), '2:208', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',   2439, '06450650064a', ((0, '0641'), ), '2:204', 6, 'fi', 'mi -> FI'),
    ],
    7: [
        ('arabicBody',  41713, '06450650064a', ((0, '0641'), ), '3:5', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  36897, '0623064e064606520645064f063306500643064f06450652', ((4, '0641'), ), '2:284', 0, 'named', 'anmusikum -> anFusikum; finishing the citation'),
        ('arabicBody',  36892, '06410650062d0650', ((2, '064a'), ), '2:284', 0, 'named', 'fih -> FI; ha for ya, the same fault as @36850 in the same citation'),
        ('arabicBody',  36850, '06450650062d0650', ((0, '0641'), (2, '064a'), ), '2:284', 0, 'named', 'mih -> FI; `fi l-samawat` stands sound 24 characters earlier in the same citation'),
        ('arabicBody',   4420, '064a064e063a0652062806500631064e', ((4, '0641'), ), '26:82', 3, 'ghfr', 'يغبر -> يغفر'),
        ('arabicFootnotes',  63460, '06450650064a', ((0, '0641'), ), '3:13', 6, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  60376, '06450650064a', ((0, '0641'), ), '3:7', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  52007, '06450650064a', ((0, '0641'), ), '3:5', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  47814, '0648064e0627063a06520645065006310652', ((5, '0641'), ), '2:286', 6, 'ghfr', 'واغمر -> واغفر'),
        ('arabicFootnotes',  46059, '063a064e062806520631064e06270646064e0643064e', ((2, '0641'), ), '2:285', 5, 'ghfr', 'غبرانك -> غفرانك'),
        ('arabicFootnotes',  45985, '063a064e062806520631064e06270646064e0643064e', ((2, '0641'), ), '2:285', 5, 'ghfr', 'غبرانك -> غفرانك'),
        ('arabicFootnotes',  45536, '0641064e064a064e063a06520645065006310652', ((6, '0641'), ), '2:284', 5, 'ghfr', 'فيغمر -> فيغفر'),
        ('arabicFootnotes',  45443, '06450650064a', ((0, '0641'), ), '2:284', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',   2394, '064a064e063a0652062806500631064e', ((4, '0641'), ), '26:82', 3, 'ghfr', 'يغبر -> يغفر'),
    ],
    9: [
        ('arabicBody',  47379, '0644064e0645064e063a0652064506500631064e0629064c', ((6, '0641'), ), '3:157', 3, 'ghfr', 'لمغمره -> لمغفره'),
        ('arabicBody',  47346, '06450650064a', ((0, '0641'), ), '3:157', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  46980, '0644064e0645064e063a0652064506500631064e0629', ((6, '0641'), ), '3:157', 2, 'ghfr', 'لمغمره -> لمغفره'),
        ('arabicBody',  46449, '063a064e0645064f06480631064c', ((2, '0641'), ), '2:235', 2, 'ghfr', 'غمور -> غفور'),
        ('arabicBody',  41903, '0625063a06520628065006310652', ((3, '0641'), ), '3:147', 2, 'ghfr', 'اغبر -> اغفر'),
        ('arabicBody',  36253, '064506500649', ((0, '0641'), ), '3:137', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  33055, '0645064e063a0652064506500631064e0629064d', ((4, '0641'), ), '3:133', 5, 'ghfr', 'مغمره -> مغفره'),
        ('arabicBody',  32613, '063a064e0647064f06480631064c', ((2, '0641'), ), '3:129', 3, 'ghfr', 'غهور -> غفور'),
        ('arabicBody',  10757, '0639064e064a', ((2, '0646'), ), '3:97', 4, 'named', '`ay -> `AN(i) l-`alamin'),
        ('arabicBody',  10750, '063a064e064606500626064f', ((4, '064a'), ), '3:97', 3, 'named', 'ghaniU with a hamza seat -> ghaniyy'),
        ('arabicBody',  10735, '062c064e06270646064e', ((0, '0641'), ), '3:97', 3, 'named', 'jana -> FA-inna'),
        ('arabicFootnotes',  70217, '06450650064a', ((0, '0641'), ), '3:169', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  63879, '0644064e0645064e063a0652064506500631064e0629064c', ((6, '0641'), ), '3:157', 3, 'ghfr', 'لمغمره -> لمغفره'),
        ('arabicFootnotes',  63846, '06450650064a', ((0, '0641'), ), '3:157', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  63480, '0644064e0645064e063a0652064506500631064e0629', ((6, '0641'), ), '3:157', 2, 'ghfr', 'لمغمره -> لمغفره'),
        ('arabicFootnotes',  62949, '063a064e0645064f06480631064c', ((2, '0641'), ), '2:235', 2, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  58146, '0625063a06520628065006310652', ((3, '0641'), ), '3:147', 2, 'ghfr', 'اغبر -> اغفر'),
        ('arabicFootnotes',  51169, '064506500649', ((0, '0641'), ), '3:137', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  50160, '064a064e063a06520645065006310652', ((4, '0641'), ), '3:135', 4, 'ghfr', 'يغمر -> يغفر'),
        ('arabicFootnotes',  50123, '0628064e062706330652062a064e063a06520641064e0631064f06480627', ((0, '0641'), ), '3:135', 5, 'ghfr', 'باستغفروا -> فاستغفروا'),
        ('arabicFootnotes',  47672, '0645064e063a0652064506500631064e0629064d', ((4, '0641'), ), '3:133', 5, 'ghfr', 'مغمره -> مغفره'),
        ('arabicFootnotes',  47252, '063a064e0647064f06480631064c', ((2, '0641'), ), '3:129', 3, 'ghfr', 'غهور -> غفور'),
        ('arabicFootnotes',  15232, '06280650063a064e064506500644064d', ((4, '0641'), ), '2:74', 4, 'ghfr', 'بغمل -> بغفل'),
    ],
   10: [
        ('arabicBody',  27308, '06450650064a', ((0, '0641'), ), '4:10', 7, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  41525, '06450650064a', ((0, '0641'), ), '4:10', 7, 'fi', 'mi -> FI'),
    ],
   11: [
        ('arabicBody',  41917, '06450650064a', ((0, '0641'), ), '4:74', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  38154, '0648064e062706330652062a064e063a06520628064e0631064e', ((9, '0641'), ), '4:64', 4, 'ghfr', 'واستغبر -> واستغفر'),
        ('arabicBody',  26066, '0648064e062a064e06390652064506500631064f', ((2, '064a'), (4, '063a'), (6, '0641'), ), '4:48', 0, 'named', 'ta`mir -> waYaGHFir; the same, three letters'),
        ('arabicBody',  26039, '064a064e06390652064506500631064f', ((2, '063a'), (4, '0641'), ), '4:48', 0, 'named', 'ya`mir -> yaGHFir; the ghayn is damaged too, which no rule in this pass could see'),
        ('arabicBody',  26026, '0627062a', ((1, '0646'), ), '4:48', 0, 'named', 'at -> INna llah; opening the citation'),
        ('arabicBody',  24990, '0648064e064a064e063a0652062806500631064f', ((6, '0641'), ), '4:48', 3, 'ghfr', 'ويغبر -> ويغفر'),
        ('arabicBody',  24412, '0648064e064a064e063a0652062806500631064f', ((6, '0641'), ), '4:48', 4, 'ghfr', 'ويغبر -> ويغفر'),
        ('arabicBody',  24385, '064a064e063a06520645065006310652', ((4, '0641'), ), '4:48', 3, 'ghfr', 'يغمر -> يغفر'),
        ('arabicBody',  21741, '063a064e0628064f06480631064b0627', ((2, '0641'), ), '4:43', 1, 'ghfr', 'غبورا -> غفورا'),
        ('arabicBody',   2936, '063a064e0645064f06480631064c', ((2, '0641'), ), '2:218', 2, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  56264, '06450650064a', ((0, '0641'), ), '4:76', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  55432, '06450650064a', ((0, '0641'), ), '2:246', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  50719, '0648064e062706330652062a064e063a06520628064e0631064e', ((9, '0641'), ), '4:64', 4, 'ghfr', 'واستغبر -> واستغفر'),
        ('arabicFootnotes',  35810, '062706440652063a064e0645064f06480631064f', ((5, '0641'), ), '39:53', 3, 'ghfr', 'الغمور -> الغفور'),
        ('arabicFootnotes',  35767, '064a064e063a0652064506500631064f', ((4, '0641'), ), '39:53', 4, 'ghfr', 'يغمر -> يغفر'),
        ('arabicFootnotes',  35537, '0648064e064a064e063a0652064506500631064f', ((6, '0641'), ), '4:48', 5, 'ghfr', 'ويغمر -> ويغفر'),
        ('arabicFootnotes',  35508, '064a064e063a0652064506500631064f', ((4, '0641'), ), '4:48', 3, 'ghfr', 'يغمر -> يغفر'),
        ('arabicFootnotes',  35362, '063a064e0628064f064806310627064b', ((2, '0641'), ), '25:70', 4, 'ghfr', 'غبورا -> غفورا'),
        ('arabicFootnotes',  34074, '0648064e064a064e063a0652062806500631064f', ((6, '0641'), ), '4:48', 3, 'ghfr', 'ويغبر -> ويغفر'),
        ('arabicFootnotes',  33496, '0648064e064a064e063a0652062806500631064f', ((6, '0641'), ), '4:48', 4, 'ghfr', 'ويغبر -> ويغفر'),
        ('arabicFootnotes',  33469, '064a064e063a06520645065006310652', ((4, '0641'), ), '4:48', 3, 'ghfr', 'يغمر -> يغفر'),
        ('arabicFootnotes',  30773, '063a064e0628064f06480631064b0627', ((2, '0641'), ), '4:43', 1, 'ghfr', 'غبورا -> غفورا'),
        ('arabicFootnotes',   2552, '063a064e0645064f06480631064c', ((2, '0641'), ), '2:218', 2, 'ghfr', 'غمور -> غفور'),
    ],
   12: [
        ('arabicBody',  42143, '06450650064a', ((0, '0641'), ), '4:140', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  41700, '06440650064a064e063a0652064506500631064e', ((6, '0641'), ), '4:137', 2, 'ghfr', 'ليغمر -> ليغفر'),
        ('arabicBody',  35785, '063a064e0628064f064806310627064b', ((2, '0641'), ), '4:23', 3, 'ghfr', 'غبورا -> غفورا'),
        ('arabicBody',  30200, '064a064e063a0652064506500631064f', ((4, '0641'), ), '39:53', 3, 'ghfr', 'يغمر -> يغفر'),
        ('arabicBody',  26555, '0648064e064a064e063a0652064506500631064f', ((6, '0641'), ), '4:48', 3, 'ghfr', 'ويغمر -> ويغفر'),
        ('arabicBody',  26512, '064a064e063a0652064506500631064f', ((4, '0641'), ), '4:48', 2, 'ghfr', 'يغمر -> يغفر'),
        ('arabicBody',  26445, '064a064e063a0652064506500631064f', ((4, '0641'), ), '4:48', 2, 'ghfr', 'يغمر -> يغفر'),
        ('arabicBody',  24614, '0648064e062706330652062a064e063a06520645065006310652', ((9, '0641'), ), '47:19', 4, 'ghfr', 'واستغمر -> واستغفر'),
        ('arabicBody',  23951, '06440650064a064e063a0652062806500631064e', ((6, '0641'), ), '48:2', 2, 'ghfr', 'ليغبر -> ليغفر'),
        ('arabicBody',  21442, '063a064e0628064f064806310627064b', ((2, '0641'), ), '4:110', 3, 'ghfr', 'غبورا -> غفورا'),
        ('arabicBody',  21399, '064a064e06330652062a064e063a06520645065006310650', ((8, '0641'), ), '4:110', 2, 'ghfr', 'يستغمر -> يستغفر'),
        ('arabicBody',  19909, '063a064e0628064f064806310627064b', ((2, '0641'), ), '4:23', 3, 'ghfr', 'غبورا -> غفورا'),
        ('arabicBody',  19853, '0648064e062706330652062a064e063a06520645065006310650', ((9, '0641'), ), '3:159', 1, 'ghfr', 'واستغمر -> واستغفر'),
        ('arabicBody',  11215, '064506500649', ((0, '0641'), ), '4:100', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  11162, '063a064e0645064f064806310627064c', ((2, '0641'), ), '4:99', 2, 'ghfr', 'غمورا -> غفورا'),
        ('arabicBody',   4604, '06450650064a', ((0, '0641'), ), '4:89', 5, 'fi', 'mi -> FI'),
        ('arabicBody',   2269, '06450650064a', ((0, '0641'), ), '4:89', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  52445, '06450650064a', ((0, '0641'), ), '4:140', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  52013, '06440650064a064e063a0652064506500631064e', ((6, '0641'), ), '4:137', 2, 'ghfr', 'ليغمر -> ليغفر'),
        ('arabicFootnotes',  45174, '063a064e0628064f064806310627064b', ((2, '0641'), ), '4:23', 3, 'ghfr', 'غبورا -> غفورا'),
        ('arabicFootnotes',  40567, '062706440652063a064e0628064f06480631064f', ((5, '0641'), ), '39:53', 4, 'ghfr', 'الغبور -> الغفور'),
        ('arabicFootnotes',  40525, '064a064e063a0652064506500631064f', ((4, '0641'), ), '39:53', 5, 'ghfr', 'يغمر -> يغفر'),
        ('arabicFootnotes',  37947, '064a064e063a0652064506500631064f', ((4, '0641'), ), '39:53', 3, 'ghfr', 'يغمر -> يغفر'),
        ('arabicFootnotes',  33539, '0648064e064a064e063a0652064506500631064f', ((6, '0641'), ), '4:48', 3, 'ghfr', 'ويغمر -> ويغفر'),
        ('arabicFootnotes',  33496, '064a064e063a0652064506500631064f', ((4, '0641'), ), '4:48', 2, 'ghfr', 'يغمر -> يغفر'),
        ('arabicFootnotes',  33429, '064a064e063a0652064506500631064f', ((4, '0641'), ), '4:48', 2, 'ghfr', 'يغمر -> يغفر'),
        ('arabicFootnotes',  31316, '0648064e062706330652062a064e063a06520645065006310652', ((9, '0641'), ), '47:19', 4, 'ghfr', 'واستغمر -> واستغفر'),
        ('arabicFootnotes',  30282, '06440650064a064e063a0652062806500631064e', ((6, '0641'), ), '48:2', 2, 'ghfr', 'ليغبر -> ليغفر'),
        ('arabicFootnotes',  27660, '063a064e0628064f064806310627064b', ((2, '0641'), ), '4:110', 3, 'ghfr', 'غبورا -> غفورا'),
        ('arabicFootnotes',  27617, '064a064e06330652062a064e063a06520645065006310650', ((8, '0641'), ), '4:110', 2, 'ghfr', 'يستغمر -> يستغفر'),
        ('arabicFootnotes',  26665, '063a064e0628064f064806310627064b', ((2, '0641'), ), '4:23', 3, 'ghfr', 'غبورا -> غفورا'),
        ('arabicFootnotes',  26623, '0648064e062706330652062a064e063a06520645065006310650', ((9, '0641'), ), '4:106', 2, 'ghfr', 'واستغمر -> واستغفر'),
        ('arabicFootnotes',  26016, '063a064e0628064f064806310627064b', ((2, '0641'), ), '4:23', 3, 'ghfr', 'غبورا -> غفورا'),
        ('arabicFootnotes',  25960, '0648064e062706330652062a064e063a06520645065006310650', ((9, '0641'), ), '3:159', 1, 'ghfr', 'واستغمر -> واستغفر'),
        ('arabicFootnotes',  15717, '063a064e0628064f064806310627064b', ((2, '0641'), ), '4:100', 4, 'ghfr', 'غبورا -> غفورا'),
        ('arabicFootnotes',  13989, '064506500649', ((0, '0641'), ), '4:100', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  13936, '063a064e0645064f064806310627064c', ((2, '0641'), ), '4:99', 2, 'ghfr', 'غمورا -> غفورا'),
        ('arabicFootnotes',  12016, '0648064e0645064e063a0652064706500631064e0629064b', ((6, '0641'), ), '4:96', 3, 'ghfr', 'ومغهره -> ومغفره'),
        ('arabicFootnotes',   5651, '064a064e063a0652064506500631064f', ((4, '0641'), ), '4:48', 2, 'ghfr', 'يغمر -> يغفر'),
    ],
   13: [
        ('arabicBody',  42214, '063a064e0642064f06480631', ((2, '0641'), ), '5:3', 2, 'ghfr', 'غقور -> غفور'),
        ('arabicBody',  31493, '06450650064a', ((0, '0641'), ), '4:176', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  20033, '06440650064a064e063a0652064506500631064e', ((6, '0641'), ), '4:137', 4, 'ghfr', 'ليغمر -> ليغفر'),
        ('arabicBody',   2541, '063a064e0628064f064806310627064b', ((2, '0641'), ), '4:96', 3, 'ghfr', 'غبورا -> غفورا'),
        ('arabicFootnotes',  54370, '063a064e0642064f06480631', ((2, '0641'), ), '5:3', 2, 'ghfr', 'غقور -> غفور'),
        ('arabicFootnotes',  40927, '06450650064a', ((0, '0641'), ), '4:176', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  26886, '06440650064a064e063a0652064506500631064e', ((6, '0641'), ), '4:137', 4, 'ghfr', 'ليغمر -> ليغفر'),
    ],
   14: [
        ('arabicBody',  16322, '06450650064a', ((0, '0641'), ), '2:114', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  15156, '0648064e064a064e063a0652064506500631064f', ((6, '0641'), ), '5:40', 2, 'ghfr', 'ويغمر -> ويغفر'),
        ('arabicBody',  13332, '06450650064a', ((0, '0641'), ), '5:36', 5, 'fi', 'mi -> FI'),
        ('arabicBody',   7604, '06450650064a', ((0, '0641'), ), '5:31', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  52866, '0648064e064a064e06330652062a064e063a0652062806500631064e06480646064e0629064c', ((10, '0641'), ), '5:74', 2, 'ghfr', 'ويستغبرونه -> ويستغفرونه'),
        ('arabicFootnotes',  19711, '06450650064a', ((0, '0641'), ), '2:114', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  18549, '0648064e064a064e063a0652064506500631064f', ((6, '0641'), ), '5:40', 2, 'ghfr', 'ويغمر -> ويغفر'),
        ('arabicFootnotes',  18274, '063a064e0645064f06480631064c', ((2, '0641'), ), '5:39', 4, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  15841, '06450650064a', ((0, '0641'), ), '5:36', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',   5521, '06450650064a', ((0, '0641'), ), '5:31', 4, 'fi', 'mi -> FI'),
    ],
   15: [
        ('arabicBody',  34563, '062a064e063a06520645065006310652', ((4, '0641'), ), '5:118', 6, 'ghfr', 'تغمر -> تغفر'),
        ('arabicBody',  33029, '062a064e063a06520645065006310652', ((4, '0641'), ), '5:118', 2, 'ghfr', 'تغمر -> تغفر'),
        ('arabicBody',  32471, '06450650064a', ((0, '0641'), ), '5:116', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  19237, '063a064e0628064f06480631064c', ((2, '0641'), ), '2:225', 2, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',  17225, '0623064e06440652063a064e0628064f06480631064f', ((6, '0641'), ), '15:49', 4, 'ghfr', 'الغبور -> الغفور'),
        ('arabicBody',  17160, '063a064e0645064f06480631064c', ((2, '0641'), ), '5:98', 5, 'ghfr', 'غمور -> غفور'),
        ('arabicBody',  16938, '063a064e0628064f06480631', ((2, '0641'), ), '5:98', 5, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',   9442, '06450650064a0650', ((0, '0641'), ), '2:225', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  42233, '062a064e063a06520645065006310652', ((4, '0641'), ), '5:118', 6, 'ghfr', 'تغمر -> تغفر'),
        ('arabicFootnotes',  40182, '062a064e063a06520645065006310652', ((4, '0641'), ), '5:118', 2, 'ghfr', 'تغمر -> تغفر'),
        ('arabicFootnotes',  39630, '06450650064a', ((0, '0641'), ), '5:116', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  23751, '063a064e0628064f06480631064c', ((2, '0641'), ), '2:225', 2, 'ghfr', 'غبور -> غفور'),
        ('arabicFootnotes',  21102, '0623064e06440652063a064e0628064f06480631064f', ((6, '0641'), ), '15:49', 4, 'ghfr', 'الغبور -> الغفور'),
        ('arabicFootnotes',  21037, '063a064e0645064f06480631064c', ((2, '0641'), ), '5:98', 5, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  20879, '063a064e0628064f06480631064c', ((2, '0641'), ), '5:98', 5, 'ghfr', 'غبور -> غفور'),
        ('arabicFootnotes',  20815, '063a064e0628064f06480631', ((2, '0641'), ), '5:98', 5, 'ghfr', 'غبور -> غفور'),
        ('arabicFootnotes',   9634, '06450650064a0650', ((0, '0641'), ), '2:225', 4, 'fi', 'mi -> FI'),
    ],
   16: [
        ('arabicBody',  26749, '06450650064a', ((0, '0641'), ), '10:66', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  26187, '064506500649', ((0, '0641'), ), '6:73', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  24347, '06450650064a', ((0, '0641'), ), '6:68', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  22385, '062a062a0643064e06480646064e0646064e', ((0, '0644'), (1, '0646'), ), '6:63', 1, 'named', 'tatakunanna -> LANAKUNanna'),
        ('arabicBody',  15090, '06450650064a', ((0, '0641'), ), '42:20', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  13075, '062a064e06280650064a0639064e', ((0, '0634'), (2, '0641'), ), '6:51', 4, 'named', 'tabi`a -> SHAFI`, glossed `yashfa`u lahum` in the same line'),
        ('arabicFootnotes',  30838, '06450650064a', ((0, '0641'), ), '10:66', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  30276, '064506500649', ((0, '0641'), ), '6:73', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  28218, '06450650064a', ((0, '0641'), ), '6:68', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  21853, '06450650064a', ((0, '0641'), ), '31:34', 7, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  13788, '06450650064a', ((0, '0641'), ), '42:20', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  10605, '062a064e06280650064a0639064e', ((0, '0634'), (2, '0641'), ), '6:51', 4, 'named', 'the same citation in the footnote copy'),
    ],
   17: [
        ('arabicBody',  42041, '0644064e063a064e0628064f06480631064c', ((4, '0641'), ), '6:165', 3, 'ghfr', 'لغبور -> لغفور'),
        ('arabicBody',  36150, '06450650064a0650', ((0, '0641'), ), '6:158', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  28547, '06450650064a', ((0, '0641'), ), '2:179', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  23633, '063a064e0645064f06480631064c', ((2, '0641'), ), '2:173', 4, 'ghfr', 'غمور -> غفور'),
        ('arabicBody',  21999, '06450650064a', ((0, '0641'), ), '6:145', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  15104, '06280650063a064e064506500644064d', ((4, '0641'), ), '2:74', 2, 'ghfr', 'بغمل -> بغفل'),
        ('arabicBody',  14308, '063a064e064506500644064f06480646064e', ((2, '0641'), ), '6:131', 3, 'ghfr', 'غملون -> غفلون'),
        ('arabicFootnotes',  43453, '0644064e063a064e0628064f06480631064c', ((4, '0641'), ), '6:165', 3, 'ghfr', 'لغبور -> لغفور'),
        ('arabicFootnotes',  35900, '06450650064a0650', ((0, '0641'), ), '6:158', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  24533, '06450650064a', ((0, '0641'), ), '2:179', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  18314, '063a064e0645064f06480631064c', ((2, '0641'), ), '2:173', 4, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  16686, '06450650064a', ((0, '0641'), ), '6:145', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',   9795, '06280650063a064e064506500644064d', ((4, '0641'), ), '2:74', 2, 'ghfr', 'بغمل -> بغفل'),
        ('arabicFootnotes',   9000, '063a064e064506500644064f06480646064e', ((2, '0641'), ), '6:131', 3, 'ghfr', 'غملون -> غفلون'),
    ],
   18: [
        ('arabicBody',  10947, '062a064e063a06520628065006310652', ((4, '0641'), ), '7:23', 4, 'ghfr', 'تغبر -> تغفر'),
        ('arabicFootnotes',   8546, '062a064e063a06520628065006310652', ((4, '0641'), ), '7:23', 4, 'ghfr', 'تغبر -> تغفر'),
    ],
   19: [
        ('arabicBody',  48785, '0633064e064a064f063a06520628064e06310652', ((6, '0641'), ), '7:169', 3, 'ghfr', 'سيغبر -> سيغفر'),
        ('arabicBody',  45414, '062a064e063a06520628064e06310652', ((4, '0641'), ), '7:161', 5, 'ghfr', 'تغبر -> تغفر'),
        ('arabicBody',  41495, '06450650064a', ((0, '0641'), ), '7:157', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  40461, '06450650064a', ((0, '0641'), ), '7:156', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  38482, '06450650064a', ((0, '0641'), ), '7:151', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  38384, '0625063a06520645065006310652', ((3, '0641'), ), '7:151', 0, 'ghfr', 'اغمر -> اغفر'),
        ('arabicBody',  34760, '06450650064a0650', ((0, '0641'), ), '7:146', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  22846, '06450650064a', ((0, '0641'), ), '28:5', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  21546, '063a064e0645065006440650064a0646064e', ((2, '0641'), ), '7:136', 3, 'ghfr', 'غملين -> غفلين'),
        ('arabicBody',  15696, '06450650064a', ((0, '0641'), ), '7:129', 5, 'fi', 'mi -> FI'),
        ('arabicBody',   4405, '06450650064a0650', ((0, '0641'), ), '7:94', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  48405, '0633064e064a064f063a06520628064e06310652', ((6, '0641'), ), '7:169', 3, 'ghfr', 'سيغبر -> سيغفر'),
        ('arabicFootnotes',  44881, '062a064e063a06520628064e06310652', ((4, '0641'), ), '7:161', 5, 'ghfr', 'تغبر -> تغفر'),
        ('arabicFootnotes',  40787, '06450650064a', ((0, '0641'), ), '7:157', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  39550, '06450650064a', ((0, '0641'), ), '7:156', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  37537, '06450650064a', ((0, '0641'), ), '7:151', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  37439, '0625063a06520645065006310652', ((3, '0641'), ), '7:151', 0, 'ghfr', 'اغمر -> اغفر'),
        ('arabicFootnotes',  36249, '0648064e064a064e063a06520645065006310652', ((6, '0641'), ), '7:149', 5, 'ghfr', 'ويغمر -> ويغفر'),
        ('arabicFootnotes',  33102, '06450650064a0650', ((0, '0641'), ), '7:146', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  18696, '06450650064a', ((0, '0641'), ), '28:5', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  18406, '063a064e0645065006440650064a0646064c', ((2, '0641'), ), '7:136', 3, 'ghfr', 'غملين -> غفلين'),
        ('arabicFootnotes',  17410, '063a064e0645065006440650064a0646064e', ((2, '0641'), ), '7:136', 2, 'ghfr', 'غملين -> غفلين'),
        ('arabicFootnotes',   9151, '06450650064a', ((0, '0641'), ), '7:129', 5, 'fi', 'mi -> FI'),
    ],
   20: [
        ('arabicBody',  49960, '064a064f063a06520628064e06310652', ((4, '0641'), ), '8:38', 2, 'ghfr', 'يغبر -> يغفر'),
        ('arabicBody',  46963, '0648064e064a064e063a06520645065006310652', ((6, '0641'), ), '3:31', 3, 'ghfr', 'ويغمر -> ويغفر'),
        ('arabicBody',  28629, '062706440652063a064e0645065006440650064a0646064e', ((5, '0641'), ), '7:205', 2, 'ghfr', 'الغملين -> الغفلين'),
        ('arabicBody',   1923, '063a064e0645065006440650064a0646064e', ((2, '0641'), ), '7:172', 3, 'ghfr', 'غملين -> غفلين'),
        ('arabicFootnotes',  66065, '064a064f063a06520628064e06310652', ((4, '0641'), ), '8:38', 2, 'ghfr', 'يغبر -> يغفر'),
        ('arabicFootnotes',  64740, '064a064e06330652062a064e063a0652064706500631064f06480646064e', ((8, '0641'), ), '8:33', 4, 'ghfr', 'يستغهرون -> يستغفرون'),
        ('arabicFootnotes',  62420, '0648064e064a064e063a06520645065006310652', ((6, '0641'), ), '3:31', 3, 'ghfr', 'ويغمر -> ويغفر'),
        ('arabicFootnotes',  47802, '0648064e0645064e063a0652064506500631064e0629064c', ((6, '0641'), ), '8:4', 6, 'ghfr', 'ومغمره -> ومغفره'),
        ('arabicFootnotes',  47386, '0648064e0645064e063a0652064506500631064e0629064c', ((6, '0641'), ), '8:4', 6, 'ghfr', 'ومغمره -> ومغفره'),
        ('arabicFootnotes',  46233, '0648064e0645064e063a0652064506500631064e0629064c', ((6, '0641'), ), '8:4', 3, 'ghfr', 'ومغمره -> ومغفره'),
        ('arabicFootnotes',  41743, '062706440652063a064e0645065006440650064a0646064e', ((5, '0641'), ), '7:205', 2, 'ghfr', 'الغملين -> الغفلين'),
        ('arabicFootnotes',  37423, '0625063a06520645065006310652', ((3, '0641'), ), '38:35', 2, 'ghfr', 'اغمر -> اغفر'),
        ('arabicFootnotes',    296, '063a064e0645065006440650064a0646064e', ((2, '0641'), ), '7:172', 3, 'ghfr', 'غملين -> غفلين'),
    ],
   21: [
        ('arabicBody',  41226, '06450650064a', ((0, '0641'), ), '9:20', 6, 'fi', 'mi -> FI'),
        ('arabicBody',  41037, '06450650064a', ((0, '0641'), ), '9:19', 7, 'fi', 'mi -> FI'),
        ('arabicBody',  35031, '063a064e0645064f06480631064c', ((2, '0641'), ), '5:98', 3, 'ghfr', 'غمور -> غفور'),
        ('arabicBody',  30555, '0645064e063a0652064506500631064e0629064c', ((4, '0641'), ), '8:74', 5, 'ghfr', 'مغمره -> مغفره'),
        ('arabicBody',  29999, '06450650064a0626064e0642064c', ((3, '062b'), ), '8:72', 4, 'named', 'mi\'aqun with a hamza seat -> mithaq'),
        ('arabicBody',  29903, '06450650064a', ((0, '0641'), ), '8:72', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  28672, '06450650064a', ((0, '0641'), ), '8:72', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  26693, '063a064e0645064f06480631064c', ((2, '0641'), ), '3:31', 5, 'ghfr', 'غمور -> غفور'),
        ('arabicBody',  26658, '0648064e064a064e063a06520645065006310652', ((6, '0641'), ), '3:31', 4, 'ghfr', 'ويغمر -> ويغفر'),
        ('arabicBody',  22482, '063a064e0645064f06480631064c', ((2, '0641'), ), '14:36', 3, 'ghfr', 'غمور -> غفور'),
        ('arabicBody',  22169, '062a064e063a06520645065006310652', ((4, '0641'), ), '5:118', 5, 'ghfr', 'تغمر -> تغفر'),
        ('arabicFootnotes',  62008, '063a064e0645064f06480631064c', ((2, '0641'), ), '3:129', 3, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  59277, '06450650064a', ((0, '0641'), ), '9:20', 6, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  59088, '06450650064a', ((0, '0641'), ), '9:19', 7, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  52888, '063a064e0645064f06480631064c', ((2, '0641'), ), '5:98', 3, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  46667, '0645064e063a0652064506500631064e0629064c', ((4, '0641'), ), '8:74', 5, 'ghfr', 'مغمره -> مغفره'),
        ('arabicFootnotes',  46020, '06450650064a', ((0, '0641'), ), '8:72', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  44419, '06450650064a', ((0, '0641'), ), '8:72', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  42151, '063a064e0645064f06480631064c', ((2, '0641'), ), '3:31', 5, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  42116, '0648064e064a064e063a06520645065006310652', ((6, '0641'), ), '3:31', 4, 'ghfr', 'ويغمر -> ويغفر'),
        ('arabicFootnotes',  41750, '063a064e0645064f06480631064c', ((2, '0641'), ), '8:69', 3, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  36933, '062a064e063a06520645065006310652', ((4, '0641'), ), '5:118', 5, 'ghfr', 'تغمر -> تغفر'),
        ('arabicFootnotes',  36838, '063a064e0645064f06480631064c', ((2, '0641'), ), '14:36', 4, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  35603, '063a064e0645064f06480631064c', ((2, '0641'), ), '14:36', 3, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  34600, '062a064e063a06520645065006310652', ((4, '0641'), ), '5:118', 5, 'ghfr', 'تغمر -> تغفر'),
        ('arabicFootnotes',  26372, '06450650064a', ((0, '0641'), ), '8:63', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  21826, '06450650064a', ((0, '0641'), ), '8:60', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',   8592, '0648064e062706330652062a064e063a06520645065006310652', ((9, '0641'), ), '3:159', 5, 'ghfr', 'واستغمر -> واستغفر'),
    ],
   22: [
        ('arabicBody',  45922, '063a064e0628064f06480631064c', ((2, '0641'), ), '9:91', 3, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',  42003, '064a064e063a0652064506500631064e', ((4, '0641'), ), '9:80', 3, 'ghfr', 'يغمر -> يغفر'),
        ('arabicBody',  41959, '062a064e06330652062a064e063a06520645065006310652', ((8, '0641'), ), '9:80', 3, 'ghfr', 'تستغمر -> تستغفر'),
        ('arabicBody',  41934, '062a064e06330652062a064e063a06520628065006310652', ((8, '0641'), ), '9:80', 3, 'ghfr', 'تستغبر -> تستغفر'),
        ('arabicBody',  41904, '062506330652062a064e063a06520639065006310652', ((7, '0641'), ), '9:80', 1, 'ghfr', 'استغعر -> استغفر'),
        ('arabicBody',  37605, '0648064e064a064e063a0652062806500631064f', ((6, '0641'), ), '4:48', 3, 'ghfr', 'ويغبر -> ويغفر'),
        ('arabicBody',  36862, '064a064e063a06520645065006310652', ((4, '0641'), ), '4:48', 2, 'ghfr', 'يغمر -> يغفر'),
        ('arabicBody',  36686, '062a064e06330652062a064e063a06520645065006310652', ((8, '0641'), ), '9:80', 2, 'ghfr', 'تستغمر -> تستغفر'),
        ('arabicBody',  36252, '0623064e06330652062a064e063a06520628064e06310652062a064e', ((8, '0641'), ), '63:6', 2, 'ghfr', 'استغبرت -> استغفرت'),
        ('arabicBody',  35568, '062a064e06330652062a064e063a06520639065006310652', ((8, '0641'), ), '9:80', 2, 'ghfr', 'تستغعر -> تستغفر'),
        ('arabicBody',  30047, '06450650064a', ((0, '0641'), ), '9:74', 6, 'fi', 'mi -> FI'),
        ('arabicBody',  18997, '06230644062a0651064e06470650', ((2, '0644'), ), '9:60', 4, 'named', 'al-tah -> al-LAh'),
        ('arabicBody',  18982, '0628064e06310650064a0637064e0629064f', ((0, '0641'), (5, '0636'), ), '9:60', 4, 'named', 'bariTatun -> FariDatan'),
        ('arabicFootnotes',  64885, '063a064e0628064f06480631064c', ((2, '0641'), ), '9:91', 3, 'ghfr', 'غبور -> غفور'),
        ('arabicFootnotes',  60481, '064a064e063a0652064506500631064e', ((4, '0641'), ), '9:80', 3, 'ghfr', 'يغمر -> يغفر'),
        ('arabicFootnotes',  60437, '062a064e06330652062a064e063a06520645065006310652', ((8, '0641'), ), '9:80', 3, 'ghfr', 'تستغمر -> تستغفر'),
        ('arabicFootnotes',  60412, '062a064e06330652062a064e063a06520628065006310652', ((8, '0641'), ), '9:80', 3, 'ghfr', 'تستغبر -> تستغفر'),
        ('arabicFootnotes',  60382, '062506330652062a064e063a06520639065006310652', ((7, '0641'), ), '9:80', 1, 'ghfr', 'استغعر -> استغفر'),
        ('arabicFootnotes',  54070, '0648064e064a064e063a0652062806500631064f', ((6, '0641'), ), '4:48', 3, 'ghfr', 'ويغبر -> ويغفر'),
        ('arabicFootnotes',  52852, '064a064e063a06520645065006310652', ((4, '0641'), ), '4:48', 2, 'ghfr', 'يغمر -> يغفر'),
        ('arabicFootnotes',  52676, '062a064e06330652062a064e063a06520645065006310652', ((8, '0641'), ), '9:80', 2, 'ghfr', 'تستغمر -> تستغفر'),
        ('arabicFootnotes',  52242, '0623064e06330652062a064e063a06520628064e06310652062a064e', ((8, '0641'), ), '63:6', 2, 'ghfr', 'استغبرت -> استغفرت'),
        ('arabicFootnotes',  51413, '064a064e063a0652062806500631064e', ((4, '0641'), ), '9:80', 4, 'ghfr', 'يغبر -> يغفر'),
        ('arabicFootnotes',  51368, '062a064e06330652062a064e063a06520645065006310652', ((8, '0641'), ), '9:80', 4, 'ghfr', 'تستغمر -> تستغفر'),
        ('arabicFootnotes',  51235, '062a064e06330652062a064e063a06520639065006310652', ((8, '0641'), ), '9:80', 2, 'ghfr', 'تستغعر -> تستغفر'),
        ('arabicFootnotes',  44405, '06450650064a', ((0, '0641'), ), '9:74', 6, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  12298, '064506500649', ((0, '0641'), ), '9:38', 7, 'fi', 'mi -> FI'),
    ],
   23: [
        ('arabicBody',  44556, '06450650064a', ((0, '0641'), ), '10:22', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  43719, '06450650064a', ((0, '0641'), ), '10:18', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  42106, '06450650064a', ((0, '0641'), ), '10:11', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  33337, '06450650064a', ((0, '0641'), ), '9:125', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  23621, '062706330652062a0650063a06520645064e06270631064f', ((7, '0641'), ), '9:114', 3, 'ghfr', 'استغمار -> استغفار'),
        ('arabicBody',  22625, '064a064e06330652062a064e063a0652063906500631064f064806270652', ((8, '0641'), ), '9:113', 4, 'ghfr', 'يستغعروا -> يستغفروا'),
        ('arabicBody',  21660, '064a064e06330652062a064e063a0652064506500631064f064806270652', ((8, '0641'), ), '9:113', 4, 'ghfr', 'يستغمروا -> يستغفروا'),
        ('arabicBody',  19521, '06450650064a', ((0, '0641'), ), '9:111', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  16971, '06450650064a', ((0, '0641'), ), '9:110', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  54990, '06450650064a', ((0, '0641'), ), '10:23', 6, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  54644, '06450650064a', ((0, '0641'), ), '10:22', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  54597, '06450650064a', ((0, '0641'), ), '10:22', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  53807, '06450650064a', ((0, '0641'), ), '10:18', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  52209, '06450650064a', ((0, '0641'), ), '10:11', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  39990, '06450650064a', ((0, '0641'), ), '9:125', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  26697, '062706330652062a0650063a06520645064e06270631064f', ((7, '0641'), ), '9:114', 3, 'ghfr', 'استغمار -> استغفار'),
        ('arabicFootnotes',  26402, '064a064e06330652062a064e063a0652063906500631064f064806270652', ((8, '0641'), ), '9:113', 5, 'ghfr', 'يستغعروا -> يستغفروا'),
        ('arabicFootnotes',  25720, '064a064e06330652062a064e063a0652063906500631064f064806270652', ((8, '0641'), ), '9:113', 4, 'ghfr', 'يستغعروا -> يستغفروا'),
        ('arabicFootnotes',  24132, '064a064e06330652062a064e063a0652064506500631064f064806270652', ((8, '0641'), ), '9:113', 4, 'ghfr', 'يستغمروا -> يستغفروا'),
        ('arabicFootnotes',  22030, '06450650064a', ((0, '0641'), ), '9:111', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  19515, '06450650064a', ((0, '0641'), ), '9:110', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',   4268, '063a064e0628064f06480631064c', ((2, '0641'), ), '9:102', 4, 'ghfr', 'غبور -> غفور'),
    ],
   24: [
        ('arabicBody',  39587, '062506330652062a064e063a0652063906500631064e064806270652', ((7, '0641'), ), '11:3', 2, 'ghfr', 'استغعروا -> استغفروا'),
        ('arabicBody',  35631, '06450650064a', ((0, '0641'), ), '10:99', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  12702, '064506500649', ((0, '0641'), ), '10:61', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  11141, '06450650064a', ((0, '0641'), ), '6:91', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  49689, '062506330652062a064e063a0652064506500631064f064806270652', ((7, '0641'), ), '11:3', 4, 'ghfr', 'استغمروا -> استغفروا'),
        ('arabicFootnotes',  48519, '062506330652062a064e063a0652063906500631064e064806270652', ((7, '0641'), ), '11:3', 2, 'ghfr', 'استغعروا -> استغفروا'),
        ('arabicFootnotes',  47452, '062706440652063a064e0628064f06480631064f', ((5, '0641'), ), '10:107', 3, 'ghfr', 'الغبور -> الغفور'),
        ('arabicFootnotes',  44478, '06450650064a', ((0, '0641'), ), '10:99', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  40632, '0644064e063a064e064506500644064f06480646064e', ((4, '0641'), ), '10:92', 2, 'ghfr', 'لغملون -> لغفلون'),
        ('arabicFootnotes',  17580, '06450650064a', ((0, '0641'), ), '10:64', 6, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  15763, '06450650064a', ((0, '0641'), ), '10:64', 6, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  14002, '064506500649', ((0, '0641'), ), '10:61', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  13408, '06450650064a', ((0, '0641'), ), '10:61', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  12460, '06450650064a', ((0, '0641'), ), '6:91', 3, 'fi', 'mi -> FI'),
    ],
   25: [
        ('arabicBody',  34523, '06450650064a', ((0, '0641'), ), '11:67', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  11517, '06450650064a', ((0, '0641'), ), '11:20', 6, 'fi', 'mi -> FI'),
        ('arabicBody',   9525, '06450650064a', ((0, '0641'), ), '11:16', 6, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  43373, '06450650064a', ((0, '0641'), ), '11:79', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  38606, '06450650064a', ((0, '0641'), ), '11:67', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  33468, '062706330652062a064e063a0652064506500631064f064806270652', ((7, '0641'), ), '11:52', 2, 'ghfr', 'استغمروا -> استغفروا'),
        ('arabicFootnotes',  29737, '062a064e063a06520628065006310652', ((4, '0641'), ), '11:47', 2, 'ghfr', 'تغبر -> تغفر'),
        ('arabicFootnotes',  11365, '06450650064a', ((0, '0641'), ), '11:20', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',   7766, '06450650064a', ((0, '0641'), ), '11:16', 6, 'fi', 'mi -> FI'),
    ],
   26: [
        ('arabicBody',  39934, '0634064e063a064e0628064e0647064e0627', ((4, '0641'), ), '12:30', 1, 'ghfr', 'شغبها -> شغفها'),
        ('arabicFootnotes',  53824, '064506500649', ((0, '0641'), ), '12:42', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  45950, '0634064e063a064e0628064e0647064e0627', ((4, '0641'), ), '12:30', 0, 'ghfr', 'شغبها -> شغفها'),
        ('arabicFootnotes',  36925, '0628064e0623064e0643064e0644064e0647064f', ((0, '0641'), ), '12:17', 4, 'named', 'ba-akalahu -> FA-akalahu l-dhi\'b'),
        ('arabicFootnotes',  34638, '063a064e064506500644064f06480646064e', ((2, '0641'), ), '12:13', 2, 'ghfr', 'غملون -> غفلون'),
        ('arabicFootnotes',   1150, '06450650064a', ((0, '0641'), ), '11:60', 5, 'fi', 'mi -> FI'),
    ],
   27: [
        ('arabicFootnotes',  36026, '0645064e063a0652064506500631064e0629064d', ((4, '0641'), ), '13:6', 5, 'ghfr', 'مغمره -> مغفره'),
        ('arabicFootnotes',  35747, '06450650064a', ((0, '0641'), ), '13:5', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  35081, '06450650064a0650', ((0, '0641'), ), '13:4', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  32295, '06450650064a0650', ((0, '0641'), ), '12:109', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  23769, '0623064e06330652062a064e063a0652064506500631064f', ((8, '0641'), ), '12:98', 4, 'ghfr', 'استغمر -> استغفر'),
        ('arabicFootnotes',   9154, '06450650064a', ((0, '0641'), ), '12:68', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',   2130, '06450650064a', ((0, '0641'), ), '12:56', 4, 'fi', 'mi -> FI'),
    ],
   28: [
        ('arabicFootnotes',  40054, '063a064e0628064f06480631064c', ((2, '0641'), ), '14:36', 3, 'ghfr', 'غبور -> غفور'),
        ('arabicFootnotes',   3381, '06450650064a', ((0, '0641'), ), '13:26', 4, 'fi', 'mi -> FI'),
    ],
   29: [
        ('arabicBody',  55666, '06450650064a0650', ((0, '0641'), ), '16:79', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  51762, '06450650064a', ((0, '0641'), ), '16:71', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  37942, '064506500649', ((0, '0641'), ), '16:13', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  18091, '06230644063a064e0647064f06480631064e', ((4, '0641'), ), '15:49', 4, 'ghfr', 'الغهور -> الغفور'),
        ('arabicFootnotes',  69977, '06450650064a0650', ((0, '0641'), ), '16:79', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  64695, '06450650064a', ((0, '0641'), ), '16:71', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  47702, '064506500649', ((0, '0641'), ), '16:13', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  20532, '062706440652063a064e0645064f06480631064f', ((5, '0641'), ), '42:5', 3, 'ghfr', 'الغمور -> الغفور'),
        ('arabicFootnotes',  20401, '06230644063a064e0647064f06480631064e', ((4, '0641'), ), '15:49', 4, 'ghfr', 'الغهور -> الغفور'),
    ],
   30: [
        ('arabicBody',  69687, '06450650064a', ((0, '0641'), ), '39:42', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  56461, '06450650064a', ((0, '0641'), ), '17:70', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  48486, '06450650064a0650', ((0, '0641'), ), '17:46', 8, 'fi', 'mi -> FI'),
        ('arabicBody',  37808, '06450650064a', ((0, '0641'), ), '17:4', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  35052, '064a064e063a0652064506500631064f', ((4, '0641'), ), '12:92', 5, 'ghfr', 'يغمر -> يغفر'),
        ('arabicBody',  20994, '06450650064a', ((0, '0641'), ), '16:127', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  18339, '06450650064a', ((0, '0641'), ), '16:122', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  17507, '0644064e063a064e0628064f06480631', ((4, '0641'), ), '7:153', 3, 'ghfr', 'لغبور -> لغفور'),
        ('arabicBody',  16772, '063a064e0645064f06480631064c', ((2, '0641'), ), '16:115', 4, 'ghfr', 'غمور -> غفور'),
        ('arabicBody',  13703, '0644064e063a064e0628064f06480631', ((4, '0641'), ), '16:110', 1, 'ghfr', 'لغبور -> لغفور'),
        ('arabicBody',  13449, '06450650064a', ((0, '0641'), ), '16:109', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  11042, '0648064e0646064e0647064f06450652', ((0, '0627'), ), '16:103', 5, 'named', 'wa-nahum -> Annahum'),
        ('arabicFootnotes',  87104, '06450650064a', ((0, '0641'), ), '39:42', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  71203, '06450650064a', ((0, '0641'), ), '17:70', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  66109, '06450650064a', ((0, '0641'), ), '17:58', 5, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  63005, '06450650064a0650', ((0, '0641'), ), '17:46', 8, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  62742, '063a064e0645064f064806310627064b', ((2, '0641'), ), '17:44', 4, 'ghfr', 'غمورا -> غفورا'),
        ('arabicFootnotes',  51459, '06450650064a', ((0, '0641'), ), '17:4', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  47079, '064a064e063a0652064506500631064f', ((4, '0641'), ), '12:92', 5, 'ghfr', 'يغمر -> يغفر'),
        ('arabicFootnotes',  26602, '06450650064a', ((0, '0641'), ), '16:127', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  21410, '06450650064a', ((0, '0641'), ), '16:122', 3, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  19926, '0644064e063a064e0628064f06480631', ((4, '0641'), ), '7:153', 3, 'ghfr', 'لغبور -> لغفور'),
        ('arabicFootnotes',  18359, '063a064e0645064f06480631064c', ((2, '0641'), ), '16:115', 4, 'ghfr', 'غمور -> غفور'),
        ('arabicFootnotes',  14626, '0644064e063a064e0628064f06480631', ((4, '0641'), ), '16:110', 1, 'ghfr', 'لغبور -> لغفور'),
        ('arabicFootnotes',  14372, '06450650064a', ((0, '0641'), ), '16:109', 4, 'fi', 'mi -> FI'),
        ('arabicFootnotes',  14317, '062706440652063a064e064506500644064f06480646064e', ((5, '0641'), ), '16:108', 3, 'ghfr', 'الغملون -> الغفلون'),
    ],
   31: [
        ('arabicBody',  51660, '06450650064a', ((0, '0641'), ), '18:104', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  51271, '06450650064a', ((0, '0641'), ), '18:101', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  35338, '062306440652063a064e0645064f06480631064f', ((5, '0641'), ), '18:58', 3, 'ghfr', 'الغمور -> الغفور'),
        ('arabicBody',  21688, '0627063a06520628064e064406520646064e0627', ((3, '0641'), ), '18:28', 5, 'ghfr', 'اغبلنا -> اغفلنا'),
    ],
   32: [
        ('arabicBody',  57615, '06450650064a', ((0, '0641'), ), '20:52', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  42626, '064506500649', ((0, '0641'), ), '20:6', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  19705, '0633064e0623064e06330652062a064e063a0652062806500631064f', ((10, '0641'), ), '19:47', 2, 'ghfr', 'ساستغبر -> ساستغفر'),
        ('arabicBody',  17219, '063a064e064506520644064e0629064d', ((2, '0641'), ), '19:39', 2, 'ghfr', 'غمله -> غفله'),
    ],
   33: [
        ('arabicBody',  36172, '063a064e064506520644064e0629064d', ((2, '0641'), ), '21:1', 2, 'ghfr', 'غمله -> غفله'),
        ('arabicBody',  25486, '062a064e063a06520645065006310652', ((4, '0641'), ), '7:23', 5, 'ghfr', 'تغمر -> تغفر'),
        ('arabicBody',   9267, '06440650064a064e063a0652064506500631064e', ((6, '0641'), ), '20:73', 4, 'ghfr', 'ليغمر -> ليغفر'),
    ],
   34: [
        ('arabicBody',  62367, '064506500649', ((0, '0641'), ), '22:78', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  56584, '063a064e0628064f06480631064c', ((2, '0641'), ), '24:62', 2, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',  55872, '0645064a', ((0, '0641'), ), '22:56', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  54508, '06450650064a', ((0, '0641'), ), '22:52', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  52132, '0645064e063a0652064506500631064e0629064c', ((4, '0641'), ), '22:50', 6, 'ghfr', 'مغمره -> مغفره'),
        ('arabicBody',  51632, '06450650064a', ((0, '0641'), ), '22:46', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  51405, '06450650064a', ((0, '0641'), ), '22:46', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  34315, '06450650064a', ((0, '0641'), ), '22:8', 7, 'fi', 'mi -> FI'),
        ('arabicBody',  32165, '06450650064a', ((0, '0641'), ), '2:23', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  24709, '063a064e064506520644064e0629064d', ((2, '0641'), ), '21:97', 1, 'ghfr', 'غمله -> غفله'),
        ('arabicBody',  17511, '06450650064a', ((0, '0641'), ), '21:86', 4, 'fi', 'mi -> FI'),
    ],
   35: [
        ('arabicBody',  36879, '063a064e0645064f06480631064c', ((2, '0641'), ), '3:89', 4, 'ghfr', 'غمور -> غفور'),
        ('arabicBody',  32433, '0625063a06520645065006310652', ((3, '0641'), ), '23:118', 2, 'ghfr', 'اغمر -> اغفر'),
        ('arabicBody',  24751, '06450650064a', ((0, '0641'), ), '23:79', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  18746, '06450650064a', ((0, '0641'), ), '23:61', 5, 'fi', 'mi -> FI'),
    ],
   36: [
        ('arabicBody',  59402, '0648064e064a064e063a0652064506500631064f', ((6, '0641'), ), '4:48', 4, 'ghfr', 'ويغمر -> ويغفر'),
        ('arabicBody',  59373, '064a064e063a0652064506500631064f', ((4, '0641'), ), '4:48', 2, 'ghfr', 'يغمر -> يغفر'),
        ('arabicBody',  58725, '063a064e0628064f064806310627064b', ((2, '0641'), ), '4:96', 3, 'ghfr', 'غبورا -> غفورا'),
        ('arabicBody',  33329, '062306440652063a064e0645064f06480631064f', ((5, '0641'), ), '15:49', 4, 'ghfr', 'الغمور -> الغفور'),
        ('arabicBody',  22459, '06450650064a', ((0, '0641'), ), '25:7', 8, 'fi', 'mi -> FI'),
        ('arabicBody',  16663, '063a064e0645064f06480631064c', ((2, '0641'), ), '24:62', 3, 'ghfr', 'غمور -> غفور'),
        ('arabicBody',  16619, '0648064e062706330652062a064e063a06520645065006310652', ((9, '0641'), ), '24:62', 5, 'ghfr', 'واستغمر -> واستغفر'),
        ('arabicBody',   7057, '06450650064a', ((0, '0641'), ), '24:57', 7, 'fi', 'mi -> FI'),
        ('arabicBody',   3141, '06450650064a', ((0, '0641'), ), '24:55', 6, 'fi', 'mi -> FI'),
    ],
   37: [
        ('arabicBody',  66177, '064506500649', ((0, '0641'), ), '27:52', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  48014, '06450650064a', ((0, '0641'), ), '26:225', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  37094, '06450650064a', ((0, '0641'), ), '26:8', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  28083, '06450650064a', ((0, '0641'), ), '26:84', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  27742, '06440650064a064e063a0652062806500631064e', ((6, '0641'), ), '48:2', 2, 'ghfr', 'ليغبر -> ليغفر'),
        ('arabicBody',  27593, '064a064e063a0652064506500631064e', ((4, '0641'), ), '26:82', 2, 'ghfr', 'يغمر -> يغفر'),
        ('arabicBody',  25805, '064a064e063a0652064506500631064e', ((4, '0641'), ), '26:82', 3, 'ghfr', 'يغمر -> يغفر'),
        ('arabicBody',  15423, '064a064e063a0652064506500631064e', ((4, '0641'), ), '26:51', 5, 'ghfr', 'يغمر -> يغفر'),
        ('arabicBody',  14913, '064506500649', ((0, '0641'), ), '7:123', 4, 'fi', 'mi -> FI'),
    ],
   38: [
        ('arabicBody',  68073, '06450650064a', ((0, '0641'), ), '28:83', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  53478, '064a064e06330652062a064e063a0652064506500631064f064806270652', ((8, '0641'), ), '9:113', 5, 'ghfr', 'يستغمروا -> يستغفروا'),
        ('arabicBody',  36211, '062706440652063a064e0628064f06480631064f', ((5, '0641'), ), '10:107', 1, 'ghfr', 'الغبور -> الغفور'),
        ('arabicBody',  25837, '06450650064a', ((0, '0641'), ), '28:6', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  25623, '06450650064a', ((0, '0641'), ), '28:5', 4, 'fi', 'mi -> FI'),
        ('arabicBody',   8631, '064506500649', ((0, '0641'), ), '27:69', 4, 'fi', 'mi -> FI'),
    ],
   39: [
        ('arabicBody',  64069, '06450650064a', ((0, '0641'), ), '31:16', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  61698, '06450650064a', ((0, '0641'), ), '31:27', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  57575, '06450650064a0650', ((0, '0641'), ), '30:37', 6, 'fi', 'mi -> FI'),
        ('arabicBody',  55639, '06450650064a', ((0, '0641'), ), '30:27', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  51836, '064506500649', ((0, '0641'), ), '30:18', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  47376, '063a064e063906500644064f06480646064e', ((2, '0641'), ), '30:7', 2, 'ghfr', 'غعلون -> غفلون'),
        ('arabicBody',  46727, '064a064406470650', ((0, '0644'), ), '30:4', 3, 'named', 'yillahi -> LILLAHi l-amr'),
        ('arabicBody',  39427, '06450650064a0650', ((0, '0641'), ), '29:65', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  13022, '064506500649', ((0, '0641'), ), '2:130', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  12481, '06450650064a', ((0, '0641'), ), '29:27', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  10524, '064506500649', ((0, '0641'), ), '3:5', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  10180, '06450650064a', ((0, '0641'), ), '29:20', 4, 'fi', 'mi -> FI'),
        ('arabicBody',   5409, '06450650064a', ((0, '0641'), ), '29:9', 5, 'fi', 'mi -> FI'),
    ],
   40: [
        ('arabicBody',  49723, '06450650064a', ((0, '0641'), ), '33:26', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  48527, '063a064e0628064f064806310627064b', ((2, '0641'), ), '4:23', 3, 'ghfr', 'غبورا -> غفورا'),
        ('arabicBody',  32248, '063a064e0628064f064806310627064b', ((2, '0641'), ), '33:5', 2, 'ghfr', 'غبورا -> غفورا'),
        ('arabicBody',  29334, '06450650064a', ((0, '0641'), ), '33:4', 6, 'fi', 'mi -> FI'),
        ('arabicBody',  19018, '06450650064a', ((0, '0641'), ), '32:10', 4, 'fi', 'mi -> FI'),
        ('arabicBody',   3664, '064a064e063a0652064706500631064e', ((4, '0641'), ), '9:80', 3, 'ghfr', 'يغهر -> يغفر'),
        ('arabicBody',   3619, '062a064e06330652062a064e063a06520645065006310652', ((8, '0641'), ), '9:80', 2, 'ghfr', 'تستغمر -> تستغفر'),
    ],
   41: [
        ('arabicBody',  62902, '06450650064a', ((0, '0641'), ), '34:54', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  57850, '06450650064a', ((0, '0641'), ), '34:34', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  55405, '06450650064a', ((0, '0641'), ), '9:74', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  53789, '063a064e0645064f06480631', ((2, '0641'), ), '2:218', 2, 'ghfr', 'غمور -> غفور'),
        ('arabicBody',  50705, '06450650064a', ((0, '0641'), ), '10:61', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  49631, '0644064e063a064e0628064f06480631064c', ((4, '0641'), ), '35:34', 3, 'ghfr', 'لغبور -> لغفور'),
        ('arabicBody',  48300, '063a064e0642064f064806310627064b', ((2, '0641'), ), '33:73', 5, 'ghfr', 'غقورا -> غفورا'),
        ('arabicBody',  45662, '0648064e064a064e063a06520628065006310652', ((6, '0641'), ), '33:71', 6, 'ghfr', 'ويغبر -> ويغفر'),
        ('arabicBody',  43819, '063a064e0628064f064806310627064b', ((2, '0641'), ), '33:59', 4, 'ghfr', 'غبورا -> غفورا'),
        ('arabicBody',  32772, '06450650064a', ((0, '0641'), ), '33:34', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  31422, '063a064e0645064f064806310627', ((2, '0641'), ), '4:96', 3, 'ghfr', 'غمورا -> غفورا'),
    ],
   42: [
        ('arabicBody',  62640, '064506500649', ((0, '0641'), ), '37:78', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  60266, '06450650064a', ((0, '0641'), ), '37:88', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  37780, '06450650064a', ((0, '0641'), ), '36:56', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  32826, '06450650064a', ((0, '0641'), ), '36:41', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  23176, '062806500645064e063a0652064506500631064e0629064d', ((6, '0641'), ), '36:11', 1, 'ghfr', 'بمغمره -> بمغفره'),
        ('arabicBody',  19119, '06450650064a', ((0, '0641'), ), '35:44', 6, 'fi', 'mi -> FI'),
        ('arabicBody',  18901, '064506500649', ((0, '0641'), ), '30:9', 6, 'fi', 'mi -> FI'),
        ('arabicBody',  17643, '063a064e0628064f064806310627', ((2, '0641'), ), '17:44', 2, 'ghfr', 'غبورا -> غفورا'),
        ('arabicBody',  16699, '06450650064a', ((0, '0641'), ), '35:39', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  14145, '0644064e063a064e0628064f06480631', ((4, '0641'), ), '35:34', 3, 'ghfr', 'لغبور -> لغفور'),
        ('arabicBody',  11135, '063a064e0645064f06480631064c', ((2, '0641'), ), '35:30', 2, 'ghfr', 'غمور -> غفور'),
    ],
   43: [
        ('arabicBody',  58751, '064a064e063a0652063906500631064f', ((4, '0641'), ), '4:48', 3, 'ghfr', 'يغعر -> يغفر'),
        ('arabicBody',  58283, '062706440652063a064e0628064f06480631064f', ((5, '0641'), ), '39:53', 3, 'ghfr', 'الغبور -> الغفور'),
        ('arabicBody',  58241, '064a064e063a0652064506500631064f', ((4, '0641'), ), '39:53', 4, 'ghfr', 'يغمر -> يغفر'),
        ('arabicBody',  58094, '06450650064a', ((0, '0641'), ), '30:37', 7, 'fi', 'mi -> FI'),
        ('arabicBody',  40789, '06450650064a', ((0, '0641'), ), '39:6', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  29695, '0625063a06520645065006310652', ((3, '0641'), ), '38:35', 2, 'ghfr', 'اغمر -> اغفر'),
        ('arabicBody',  21371, '062706330652062a064e063a06520628064e0631064e', ((7, '0641'), ), '38:24', 0, 'ghfr', 'استغبر -> استغفر'),
        ('arabicBody',  11832, '06450650064a', ((0, '0641'), ), '38:7', 5, 'fi', 'mi -> FI'),
    ],
   44: [
        ('arabicBody',  58404, '0645064e063a0652064706500631064e0629064d', ((4, '0641'), ), '41:43', 5, 'ghfr', 'مغهره -> مغفره'),
        ('arabicBody',  57759, '06450650064a', ((0, '0641'), ), '41:40', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  50244, '063a064e0628064f06480631064d', ((2, '0641'), ), '41:32', 1, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',  37929, '06450650064a', ((0, '0641'), ), '41:5', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  32442, '06450650064a', ((0, '0641'), ), '40:80', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  29783, '06450650064a', ((0, '0641'), ), '40:72', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  22656, '0648064e062706330652062a064e063a06520645065006310652', ((9, '0641'), ), '40:55', 2, 'ghfr', 'واستغمر -> واستغفر'),
        ('arabicBody',  19869, '06450650064a', ((0, '0641'), ), '40:43', 7, 'fi', 'mi -> FI'),
        ('arabicBody',  19740, '062706440652063a064e06450651064e06310650', ((5, '0641'), ), '40:42', 1, 'ghfr', 'الغمر -> الغفر'),
        ('arabicBody',   5520, '0648064e064a064e06330652062a064e063a0652064706500631064f06480646064e', ((10, '0641'), ), '40:7', 2, 'ghfr', 'ويستغهرون -> ويستغفرون'),
    ],
   45: [
        ('arabicBody',  60173, '06450650064a', ((0, '0641'), ), '44:3', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  28136, '06450650064a0652', ((0, '0641'), ), '42:35', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  27762, '06450650064a0650', ((0, '0641'), ), '42:32', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  23873, '064506500649', ((0, '0641'), ), '42:27', 7, 'fi', 'mi -> FI'),
        ('arabicBody',  23116, '063a064e0628064f06480631', ((2, '0641'), ), '42:23', 3, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',  21104, '064506500649', ((0, '0641'), ), '42:23', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  16609, '062c064e0627062f06520639064f', ((0, '0641'), ), '42:15', 2, 'named', 'jadi`u -> FADI`u; the compiler glosses it `ay ila dhalika fa-d`u l-nas` in the next clause'),
        ('arabicBody',  16598, '0642064e064406500630064e064406500643064e', ((0, '0641'), ), '42:15', 1, 'named', 'fa-li-dhalika; reverted in pass 2 because the citation could not be finished, and now it can'),
        ('arabicBody',   7751, '0648064e064a064e06330652062a064e063a0652064506500631064f06480646064e', ((10, '0641'), ), '40:7', 1, 'ghfr', 'ويستغمرون -> ويستغفرون'),
        ('arabicBody',   7363, '0648064e064a064e06330652062a064e063a0652063906500631064f06480646064e', ((10, '0641'), ), '42:5', 3, 'ghfr', 'ويستغعرون -> ويستغفرون'),
    ],
   46: [
        ('arabicBody',  71107, '06440650064a064e063a0652064506500631064e', ((6, '0641'), ), '48:2', 2, 'ghfr', 'ليغمر -> ليغفر'),
        ('arabicBody',  68773, '06440650064a064e063a0652064506500631064e', ((6, '0641'), ), '48:2', 2, 'ghfr', 'ليغمر -> ليغفر'),
        ('arabicBody',  62082, '0648064e062706330652062a064e063a06520645065006310652', ((9, '0641'), ), '47:19', 1, 'ghfr', 'واستغمر -> واستغفر'),
        ('arabicBody',  59478, '0648064e0645064e063a0652062806500631064e0629064c', ((6, '0641'), ), '47:15', 3, 'ghfr', 'ومغبره -> ومغفره'),
        ('arabicBody',  51371, '064a064e063a06520639065006310652', ((4, '0641'), ), '46:31', 4, 'ghfr', 'يغعر -> يغفر'),
        ('arabicBody',  46480, '06450650064a', ((0, '0641'), ), '46:20', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  31942, '06440650064a064e063a0652063906500631064e', ((6, '0641'), ), '48:2', 2, 'ghfr', 'ليغعر -> ليغفر'),
        ('arabicBody',  14516, '064a064e063a0652064506500631064f064806270652', ((4, '0641'), ), '45:14', 4, 'ghfr', 'يغمروا -> يغفروا'),
        ('arabicBody',  14159, '06450650064a0650', ((0, '0641'), ), '45:13', 4, 'fi', 'mi -> FI'),
    ],
   47: [
        ('arabicBody',  63923, '06450650064a', ((0, '0641'), ), '51:29', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  60532, '0648064e0627064406520645064e06330652062a064e063a06520647065006310650064a0646064e', ((13, '0641'), ), '3:17', 1, 'ghfr', 'والمستغهرين -> والمستغفرين'),
        ('arabicBody',  60022, '064a064e06330652062a064e063a0652063906500631064f06480646064e', ((8, '0641'), ), '51:18', 1, 'ghfr', 'يستغعرون -> يستغفرون'),
        ('arabicBody',  52858, '063a064e064506520644064e0629064d', ((2, '0641'), ), '50:22', 3, 'ghfr', 'غمله -> غفله'),
        ('arabicBody',  43167, '06450650064a', ((0, '0641'), ), '49:16', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  30895, '063a064e0628064f06480631064c', ((2, '0641'), ), '49:5', 4, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',  30117, '0645064e063a0652064506500631064e0629064c', ((4, '0641'), ), '5:9', 3, 'ghfr', 'مغمره -> مغفره'),
        ('arabicBody',  28384, '0645064e063a0652064506500631064e0629064b', ((4, '0641'), ), '48:29', 4, 'ghfr', 'مغمره -> مغفره'),
        ('arabicBody',  27652, '06450650064a', ((0, '0641'), ), '48:29', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  21496, '06450650064a', ((0, '0641'), ), '48:26', 5, 'fi', 'mi -> FI'),
    ],
   48: [
        ('arabicBody',  40515, '06450650064a', ((0, '0641'), ), '53:36', 3, 'fi', 'mi -> FI'),
        ('arabicBody',  38205, '06450650064a', ((0, '0641'), ), '53:36', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  19850, '06450650064a', ((0, '0641'), ), '30:18', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  14489, '06450650064a', ((0, '0641'), ), '52:17', 3, 'fi', 'mi -> FI'),
        ('arabicBody',   3003, '0645064a', ((0, '0641'), ), '11:65', 3, 'fi', 'mi -> FI'),
    ],
   49: [
        ('arabicBody',  47673, '063a064e0628064e06480631064c', ((2, '0641'), ), '3:31', 4, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',  47646, '0648064e064a064e063a06520645065006310652', ((6, '0641'), ), '57:28', 5, 'ghfr', 'ويغمر -> ويغفر'),
        ('arabicBody',  45832, '06450650064a', ((0, '0641'), ), '57:26', 6, 'fi', 'mi -> FI'),
        ('arabicBody',  40894, '0645064e063a0652064706500631064e0629064d', ((4, '0641'), ), '57:21', 4, 'ghfr', 'مغهره -> مغفره'),
        ('arabicBody',  40784, '0648064e0645064e063a0652064506500631064e0629064c', ((6, '0641'), ), '57:20', 6, 'ghfr', 'ومغمره -> ومغفره'),
        ('arabicBody',  39031, '0648064e0645064e063a0652064506500631064e0629064c', ((6, '0641'), ), '57:20', 1, 'ghfr', 'ومغمره -> ومغفره'),
        ('arabicBody',  32116, '06450650064a', ((0, '0641'), ), '57:10', 4, 'fi', 'mi -> FI'),
        ('arabicBody',  30332, '06450650064a', ((0, '0641'), ), '57:6', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  27417, '06450650064a', ((0, '0641'), ), '34:2', 3, 'fi', 'mi -> FI'),
    ],
   50: [
        ('arabicBody',  73186, '064a064e063a06520645065006310652', ((4, '0641'), ), '61:12', 4, 'ghfr', 'يغمر -> يغفر'),
        ('arabicBody',  69552, '063a064e0628064f06480631064c', ((2, '0641'), ), '60:12', 3, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',  69509, '0648064e062706330652062a064e063a06520645065006310652', ((9, '0641'), ), '60:12', 4, 'ghfr', 'واستغمر -> واستغفر'),
        ('arabicBody',  69480, '06450650064a', ((0, '0641'), ), '60:12', 5, 'fi', 'mi -> FI'),
        ('arabicBody',  68244, '063a064e0645064f06480631064c', ((2, '0641'), ), '2:173', 2, 'ghfr', 'غمور -> غفور'),
        ('arabicBody',  68202, '0648064e062706330652062a064e063a06520645065006310652', ((9, '0641'), ), '47:19', 2, 'ghfr', 'واستغمر -> واستغفر'),
        ('arabicBody',  67807, '063a064e0628064f06480631064c', ((2, '0641'), ), '2:173', 2, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',  42371, '06450650064a', ((0, '0641'), ), '59:17', 6, 'fi', 'mi -> FI'),
        ('arabicBody',  40403, '0643064e0645064e0626064e06440650', ((4, '062b'), ), '59:15', 3, 'named', 'ka-ma\'ali with a hamza seat -> ka-mathali'),
        ('arabicBody',  39050, '064506500649', ((0, '0641'), ), '59:10', 7, 'fi', 'mi -> FI'),
        ('arabicBody',  38973, '0625064e063a06520645065006310652', ((4, '0641'), ), '59:10', 4, 'ghfr', 'اغمر -> اغفر'),
        ('arabicBody',  15087, '063a064e0628064f06480631064e', ((2, '0641'), ), '24:22', 3, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',   1873, '063a064e0645064f06480631064e', ((2, '0641'), ), '5:98', 2, 'ghfr', 'غمور -> غفور'),
    ],
   51: [
        ('arabicBody',  42441, '063a064e0645064f06480631064c', ((2, '0641'), ), '66:1', 4, 'ghfr', 'غمور -> غفور'),
        ('arabicBody',  41875, '063a064e0645064f06480631064c', ((2, '0641'), ), '66:1', 3, 'ghfr', 'غمور -> غفور'),
        ('arabicBody',  31805, '0648064e064a064e063a06520645065006310652', ((6, '0641'), ), '64:17', 3, 'ghfr', 'ويغمر -> ويغفر'),
        ('arabicBody',  27360, '063a064e0628064f06480631064c', ((2, '0641'), ), '64:14', 3, 'ghfr', 'غبور -> غفور'),
        ('arabicBody',  27329, '0648064e062a064e063a06520639065006310652064806270652', ((6, '0641'), ), '64:14', 3, 'ghfr', 'وتغعروا -> وتغفروا'),
        ('arabicBody',  19684, '064a064e063a0652062806500631064e', ((4, '0641'), ), '63:6', 3, 'ghfr', 'يغبر -> يغفر'),
        ('arabicBody',  19659, '062a064e06330652062a064e063a06520645065006310652', ((8, '0641'), ), '63:6', 4, 'ghfr', 'تستغمر -> تستغفر'),
        ('arabicBody',  19625, '0623064e06330652062a064e063a06520628064e06310652062a064e', ((8, '0641'), ), '63:6', 3, 'ghfr', 'استغبرت -> استغفرت'),
        ('arabicBody',  12992, '06450650064a', ((0, '0641'), ), '62:10', 4, 'fi', 'mi -> FI'),
    ],
   52: [
        ('arabicBody',  57545, '0625063a06520645065006310652', ((3, '0641'), ), '71:28', 0, 'ghfr', 'اغمر -> اغفر'),
        ('arabicBody',  53587, '063a064e06450651064e062706310627064b', ((2, '0641'), ), '71:10', 4, 'ghfr', 'غمارا -> غفارا'),
        ('arabicBody',  53547, '062506330652062a064e063a06520645065006310651064806270652', ((7, '0641'), ), '71:10', 4, 'ghfr', 'استغمروا -> استغفروا'),
        ('arabicBody',  53007, '063a064e06420651064e062706310627064b', ((2, '0641'), ), '71:10', 1, 'ghfr', 'غقارا -> غفارا'),
        ('arabicBody',  16951, '064506500649', ((0, '0641'), ), '23:2', 3, 'fi', 'mi -> FI'),
        ('arabicBody',   7841, '0645064e063a0652064506500631064e0629064c', ((4, '0641'), ), '11:11', 3, 'ghfr', 'مغمره -> مغفره'),
        ('arabicBody',   3483, '062706440652063a064e0645064f06480631064f', ((5, '0641'), ), '42:5', 1, 'ghfr', 'الغمور -> الغفور'),
        ('arabicBody',   3035, '063a064e064506520644064e0629', ((2, '0641'), ), '19:39', 4, 'ghfr', 'غمله -> غفله'),
        ('arabicBody',   3031, '06450650064a', ((0, '0641'), ), '19:39', 4, 'fi', 'mi -> FI'),
    ],
   53: [
        ('arabicBody',  35581, '0627064406520645064e063a0652063906500631064e0629', ((7, '0641'), ), '74:56', 1, 'ghfr', 'المغعره -> المغفره'),
        ('arabicBody',  21942, '06450650064a', ((0, '0641'), ), '31:27', 5, 'fi', 'mi -> FI'),
    ],
   54: [
        ('arabicBody',  46980, '062306440652063a064e0628064f06480631064e', ((5, '0641'), ), '85:14', 2, 'ghfr', 'الغبور -> الغفور'),
        ('arabicBody',  16740, '06450650064a', ((0, '0641'), ), '42:7', 3, 'fi', 'mi -> FI'),
    ],
   55: [
        ('arabicBody',  67254, '0648064e062706330652062a064e063a065206450650063106520629064c', ((9, '0641'), ), '110:3', 3, 'ghfr', 'واستغمره -> واستغفره'),
        ('arabicBody',  66946, '0648064e062706330652062a064e063a065206390650063106520629064c', ((9, '0641'), ), '110:3', 5, 'ghfr', 'واستغعره -> واستغفره'),
        ('arabicBody',  46734, '06450650064a', ((0, '0641'), ), '97:1', 4, 'fi', 'mi -> FI'),
    ],
   56: [
        ('arabicBody',  25114, '064a064f0648064106500626064f06480646064e', ((3, '0642'), (5, '0646'), ), '2:4', 2, 'named', 'yufi\'una -> yuqinun'),
    ],
}

def main():
    total = letters = skipped = 0
    for lesson in sorted(FIXES):
        path = ROOT / 'src' / 'data' / 'lessons' / f'{lesson:02d}.json'
        data = json.loads(path.read_text(encoding='utf-8'))
        touched = False
        # descending offset within each field, so a swap never moves a later anchor
        for field, off, cps, subs, verse, score, cls, note in sorted(
                FIXES[lesson], key=lambda r: (r[0], -r[1])):
            text = data[field]
            word = ''.join(chr(int(cps[i:i+4], 16)) for i in range(0, len(cps), 4))
            here = text[off:off+len(word)]
            want = list(word)
            for i, cp in subs:
                want[i] = chr(int(cp, 16))
            want = ''.join(want)
            if here == want:
                skipped += 1
                continue
            assert here == word, (
                f'lesson {lesson} {field} @{off}: expected '
                f'{" ".join("%04x" % ord(c) for c in word)} but found '
                f'{" ".join("%04x" % ord(c) for c in here)} -- the file has moved')
            data[field] = text[:off] + want + text[off+len(word):]
            total += 1
            letters += len(subs)
            touched = True
            if not WRITE:
                print(f'L{lesson:02d} {field:<16} @{off:<6} {verse:>8} s{score} {cls:<5} '
                      f'{word} -> {want}   {note}')
        if touched and WRITE:
            path.write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')
    verb = 'applied' if WRITE else 'would apply'
    print(f'{verb} {total} word repairs, {letters} letter substitutions; '
          f'{skipped} already in place')

if __name__ == '__main__':
    main()