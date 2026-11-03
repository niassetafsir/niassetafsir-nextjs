# Translating Lesson Nine of *Fī Riyāḍ al-Tafsīr*

You are translating part of Shaykh Ibrāhīm Niasse's Qurʾān lecture course,
*Fī Riyāḍ al-Tafsīr*, Lesson Nine (Sūrat Āl ʿImrān, Q. 3:92–175), from the
ten-volume Majmaʿ al-Yamāma printing (Tunis, 2022). Lessons One to Eight are
already translated; your work must be indistinguishable from theirs.

## What the text is

A course of lectures, taken down as spoken. Niasse quotes a Qurʾānic lemma,
glosses it in the manner of the Jalālayn — often one or two words — and then
expounds: on the occasion of a verse's revelation, on a legal question, on a
ḥadīth, on the sense the verse carries for the wayfarer. He moves between
these without announcing the change.

Paragraphs are divided as the printing divides them, which means a paragraph
often opens and closes mid-sentence, where the page turned. Translate from
where it opens. Do not complete a clause the paragraph does not complete; do
not repair the break.

## The one inviolable rule

**Complete and verbatim.** Every clause of the Arabic gets English. Never
summarise, never abridge, never compress two sentences into one, never drop a
repetition because it is repetitive (Niasse repeats for pedagogical effect and
the repetition is the teaching). If the Arabic says a thing three times, the
English says it three times. A paragraph whose English is visibly shorter in
substance than its Arabic is a failure, not an economy.

## Output format

Return **only** a JSON array, one object per paragraph:

```json
[{"n": 12, "runs": [["«Say»", "q"], [" — O Muhammad — ", "p"], ["and so on.", "p"]]}]
```

Four run kinds, which keep the registers apart on the printed page:

| kind | what it holds | how it prints |
|---|---|---|
| `q` | a Qurʾānic lemma, wrapped in `«` `»` | accent colour |
| `h` | a ḥadīth, or the words of a named authority quoted as speech, wrapped in `⟨` `⟩` | roman |
| `p` | Niasse's own prose, including the short glosses he drops between the words of a verse | roman |
| `i` | an Arabic word or phrase carried over untranslated | italic |

Rules for the runs:

- The `«»` and `⟨⟩` marks go **inside** the run text. Nothing else does.
- A Qurʾānic reference is **not** inside the marks. It goes at the start of the
  following `p` run, with a leading space: `[" (Q. 3:92). Abū Ṭalḥa then…", "p"]`.
- Give the reference **once after the last lemma of a run through a verse**, not
  after every fragment. Niasse often works through one verse in five pieces.
- Niasse's interlinear glosses are set off by spaced em dashes:
  `["«of the servants»","q"], [" — knowing — ","p"]`. Keep the spaces inside the
  run text, as shown, so the runs concatenate correctly.
- Square brackets hold words you supply to complete the English sense:
  `has granted us [leave] to reason`.
- `[…]` marks a place the copy-text cannot be read. Use it only where the
  Arabic is genuinely unrecoverable — see below.
- Keep `n` equal to the paragraph number you were given.
- A paragraph that is nothing but a stray folio number gets `"runs": []`.

## The copy-text is damaged

The Arabic you are given is a transcription of a scan and carries OCR damage:
dropped letters, wrong hamzas, mixed-up delimiters (`{ }`, `( )`, `« »` and
`" "` are used interchangeably and often half-opened), stray vowels on the
wrong consonant.

- **For a Qurʾānic lemma: identify the verse and translate the verse.** The
  English comes from the Qurʾān, not from the scan. `لَى تَنَالُواْ ألْبِرَّ` is
  Q. 3:92 and translates «You will not attain to piety», whatever the scan did
  to it. Never reproduce the damage in English, and never mark a damaged lemma
  with `[…]` when the verse is identifiable.
- **For a ḥadīth or a quoted authority: the same**, where you can identify the
  report. Translate what the report says, not what the scan garbled.
- **For Niasse's own prose:** recover the word from context where the context
  settles it — a single dropped letter in a common word, a wrong hamza. Where
  it does not settle it, write `[…]`. Do not invent prose for him, and do not
  smooth over a hole by writing a plausible sentence.
- Do not silently correct Niasse where he parts from the received tradition —
  on the month Badr was fought, on which of the Prophet's household a report
  concerns, on whether a saying is the Prophet's or a Companion's. Translate
  what he says. The volume is a witness to what was taught in Kaolack.

## Register and diction

Niasse is lecturing to students, in plain classical Arabic. The English should
be plain, exact and unhurried — the register of Lessons One to Eight, samples
of which follow. Do not raise the diction. Do not add connectives the Arabic
does not have. Do not write "it is important to note", "the broader
implication", "this demonstrates", or any other metadiscourse.

Fixed usages, all settled:

- **Allah**, never God.
- **ﷺ** (the single ligature character) for صلى الله عليه وسلم, after
  "the Messenger", "the Prophet", "Muhammad". Not "peace be upon him".
- **Blessed and Exalted** for تبارك وتعالى; **Exalted** for تعالى where it
  stands alone after the name.
- **upon him be peace** for عليه السلام; **be pleased with him/them** for
  رضي الله عنه/عنهم.
- **the Garden** for الجنة; **the Fire** for النار.
- **the Messenger of Allah ﷺ** for رسول الله صلى الله عليه وسلم.

## Transliteration

IJMES, including its word list. The words on that list are set roman without
diacritics, as ordinary English: Quran (and Qurʾan, as Lessons 1–8 set it),
hadith, sura, hajj, jihad, zakat, imam, shariʿa, kafir, Ramadan, Muhammad,
Mecca, Medina, Abbasid, Umayyad, ulama, fatwa, Sunni, Shiʿi.

Inside a transliterated Arabic phrase the ordinary rules return: *al-Ḥamdu
li-Llāh* keeps its macrons. Proper names take full diacritics except those on
the list: Abū Ṭalḥa, ʿUmar b. al-Khaṭṭāb, Ibn ʿAbbās, Ubayy b. Kaʿb,
al-Zubayr, Āl ʿImrān, Uḥud, Badr, Ḥunayn.

Use ʾ (U+02BE) for hamza and ʿ (U+02BF) for ʿayn — the modifier letters, not
apostrophes.

## Technical terms: the term policy

A term list has been settled for this edition. Four tiers:

- **A** — the Arabic is the running form (an `i` run); an English gloss goes in
  parentheses at **first occurrence in this lesson** and nowhere else:
  `["He speaks of ","p"], ["khulla","i"], [" (intimate friendship) — ","p"]`
- **B** — the English is the running form; the transliteration goes in
  parentheses at first occurrence and nowhere else:
  `["no war-matériel (","p"], ["ʿudad","i"], ["), only suras","p"]`
- **C** — no gloss, ever. Either the word is in the IJMES word list, or it is a
  proper name, or English carries it without loss.
- **D** — not a term; a transcription defect. Translate the sense and do not
  transliterate.

The table is in `terms-compact.tsv` beside this brief: `term`, `tier`, `gloss`,
tab-separated. A term not on the list: use judgement, prefer the English, and
flag it in your notes so it can be added.

**First occurrence is reckoned within your batch only.** You cannot see the
other batches. Gloss a term the first time it appears in your paragraphs and
flag it in your notes; a later pass reconciles first occurrences across the
lesson and across the volume.

## What to flag rather than guess

Return a second JSON array, `notes`, of anything you could not settle:

```json
{"n": 7, "issue": "مال رابح / مال رايح — the printing's reading is ambiguous; translated as 'profitable property' (rābiḥ)"}
```

Flag: an unrecoverable hole you marked `[…]`; a lemma you could not place in
the muṣḥaf; a ḥadīth you could not identify; a variant reading; a term not on
the list; anywhere the Arabic will not construe. Do not flag ordinary choices.

## Samples of the established register

From Lesson Eight, ¶1–2 (note the lemma/gloss alternation, the reference after
the last lemma of the run, and the plainness):

```json
{"n": 1, "runs": [["«Say»","q"],[" — O Muhammad, to your people — ","p"],["«shall I announce to you»","q"],[" — shall I inform you — ","p"],["«of something better than that»","q"],[" — the aforementioned among","p"]]}
{"n": 2, "runs": [["the desires. ","p"],["«For those who guarded against»","q"],[" — polytheism — ","p"],["«with their Lord are gardens beneath which rivers run, abiding»","q"],[" — decreed to abide forever — ","p"],["«therein»","q"],[" — once they have entered them — ","p"],["«and purified spouses»","q"],[" — purified of menstruation and of whatever else is found repugnant — ","p"],["«and good pleasure from Allah»","q"],[" — abundant good pleasure — ","p"],["«and Allah is seeing»","q"],[" — knowing — ","p"],["«of the servants»","q"],[" (Q. 3:15), and so He requites each of them according to his deed. He told us of what has been made alluring to people among the desires of this world, and He called the servants to desire what is better than that, which is working for the hereafter.","p"]]}
```

Note how ¶1 ends mid-phrase and ¶2 picks it up: *the aforementioned among / the
desires.* That is the printing's page break, and it is kept.

From Lesson One, ¶2, a ḥadīth:

```json
[["⟨Do you have a book with which the Messenger of Allah ﷺ singled you out, the Family of the House?⟩","h"]]
```
