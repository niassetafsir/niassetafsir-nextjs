# Writing an editor's note

Notes go in `src/data/editorNotes.json`. They appear at the top of a lesson's Critical Apparatus
panel, ruled in gold, above the compiler's footnotes and never merged with them. Every one carries
your name and is marked as absent from the printed edition.

They are **not** gated on `VERIFIED_APPARATUS_LESSONS`. That gate exists because the compiler's
inline `[N]` markers are unverified outside Lessons 1–7; your notes anchor to a paragraph and have no
marker to be wrong about. So you can write on Lesson 40 today.

## The shape

```json
{
  "id": "ed-6-1",
  "lessonId": 6,
  "voice": "editor",
  "paraIndex": 2,
  "anchorText": "لم ينتصف النهار حتى يقضي اللّٰه بينهم",
  "intervention": "debate",
  "en": "…",
  "ar": null,
  "refs": [
    { "work": "al-Ghazālī, Iḥyāʾ ʿulūm al-dīn", "cite": "iv. 512", "note": "the position Niasse is refusing" }
  ]
}
```

`paraIndex` counts paragraphs **after** `isPoem()` filtering — the same index `match-verses.js` and
`arabicCommentary.ts` use. To find it:

```
node -e "const l=require('./src/data/lessons/06.json');
  l.arabicBody.split('\n').filter(p=>p.trim()).forEach((p,i)=>console.log(i, p.slice(0,90)))"
```

`anchorText` is a few words of the Arabic the note attaches to. It displays above the note, and it is
insurance: `relocate()` in `src/lib/editorNotes.ts` uses it to find the paragraph again if paragraphs
are ever added or removed. It compares on a stripped form, so OCR corrections to the anchor itself
will not lose it. **Do not anchor to character offsets** — 3,146 characters of `arabicBody` were
corrected in one day, and offset anchors would have drifted silently across all of it.

## The intervention types

These classify Niasse's **interventions**. They are deliberately not the compiler's genre taxonomy
(Hadith Sciences, Tafsīr, Theology…), which classifies his **sources** — a different question.

| type | use it when |
|---|---|
| `debate` | Niasse is entering a live dispute in the tradition |
| `response` | he is answering a named position or school |
| `doctrine` | a doctrinal commitment worth making explicit |
| `source` | an unattributed borrowing or allusion identified |
| `divergence` | he departs from the position usually taken here |
| `context` | occasion, audience, or setting of the session |
| `terminology` | a term used in a sense a reader would otherwise miss |

Add a type by extending `Intervention` in `src/lib/editorNotes.ts` and `INTERVENTION_LABEL` in
`src/components/LessonCitations.tsx`. Keep the list short; a taxonomy nobody can hold in mind stops
classifying anything.

## One caution

`divergence` and `response` make claims about what Niasse is doing, not only about what he says. They
are the notes a reviewer will press hardest. Where the evidence is an inference rather than a
citation, say so in the note — the panel already tells the reader this is your judgement, and the
note should tell him how firm it is.
