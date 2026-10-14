# Fī Riyāḍ al-Tafsīr — English translation conventions

The translator is Amadu Kunateh. The text is Shaykh Ibrāhīm Niasse's Qurʾān
commentary, delivered orally and transcribed: running prose in which Qurʾānic
lemmata and Jalālayn-style glosses alternate with Niasse's own exposition.

## Standard

Verbatim and line by line. Every Arabic clause gets an English clause. Do not
summarise, do not compress two sentences into one, do not drop an apparently
redundant phrase. Where the Arabic repeats, the English repeats. Where the
Arabic is elliptical, keep it elliptical and supply the missing word in
[square brackets].

## Register

Academic English for a scholarly press. Direct, claim-forward, concrete
subjects, active verbs. No homiletic flourish, no "indeed", no "verily", no
exclamation marks. Do not add honorific padding the Arabic does not have.

## Transliteration — IJMES

Full diacritics: ḥ ṣ ḍ ṭ ẓ ʿ ʾ ā ī ū. ʿayn is ʿ (U+02BF), hamza is ʾ (U+02BE).
The article stays al- before sun letters (al-Raḥmān, not ar-Raḥmān).
Proper names: Ibrāhīm, Muḥammad, Ḥawwāʾ, Iblīs, Nūḥ, Jibrīl, ʿUmar b. al-Khaṭṭāb.

## Fixed renderings — do not vary

    بسم الله الرحمن الرحيم   By Allah's Name: The Entirely Merciful,
                             The Especially Merciful
    الحمد لله                al-Ḥamdu li-Llāh (The Praise is for Allah)
    الله                     Allah — never "God"
    صلى الله عليه وسلم / ﷺ   ṣ.a.w.s.   (e.g. "the Prophet, ṣ.a.w.s.")
    عليه السلام              upon him be peace
    رضي الله عنه             may Allah be pleased with him
    تبارك وتعالى             Blessed and Exalted
    سبحانه وتعالى            Glorified and Exalted

## Four registers, marked in the output

Each paragraph comes back as a list of [text, kind] pairs:

    "q"  Qurʾānic lemma — the words of the āya Niasse is glossing.
         No quotation marks.
    "h"  ḥadīth, or a named authority quoted verbatim. Double quotation marks.
    "p"  Niasse's own prose, including his interlinear glosses.
    "i"  a transliterated Arabic word or phrase left untranslated.

In the Arabic, Qurʾānic lemmata are the material inside ( ) { } « » or ⟨ ⟩.
Treat bracket content as "q" only when it is actually Qurʾān; a gloss or an
aside inside brackets is "p".

## Qurʾānic citations

Render the lemma as Niasse cites it — the words he quotes, not a full āya.
Give the reference as (Q. 2:197) after the last lemma of a run, not after
every fragment. Use a plain, literal English; do not borrow a published
translation.

## Editorial additions

Anything supplied that is not in the Arabic goes in [square brackets].

## When the Arabic is damaged

The transcription carries OCR damage. If a span is unreadable, do NOT guess.
Emit ["[illegible: <the Arabic as it stands>]", "p"] and record it in the
"problems" array with the paragraph number and a conjecture, flagged as a
conjecture.

## Output

JSON only, no prose around it:

    {"paragraphs": [{"n": <paragraph number>,
                     "runs": [["text","kind"], ...]}],
     "problems": [{"n": <n>, "arabic": "...", "issue": "...",
                   "conjecture": "..."}]}
