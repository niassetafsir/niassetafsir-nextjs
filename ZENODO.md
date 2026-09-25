# Zenodo DOI Registration

## Before depositing: re-measure

The figures below were counted from the repository on 25 September 2026. They move
whenever the corpus does. Re-run this before filling in the form, and correct any line
it contradicts:

```bash
node -e '
const fs=require("fs"), d="src/data/lessons";
const f=fs.readdirSync(d).filter(x=>/^\d+\.json$/.test(x)&&+x.replace(".json","")<=56);
let ar=0,en=[];
for(const x of f){const l=JSON.parse(fs.readFileSync(d+"/"+x,"utf8"));
  if(((l.arabicBody||l.arabicText||"")).length>500)ar++;
  if(l.hasEnglish&&(l.englishText||"").length>2000)en.push(+x.replace(".json",""));}
const st=JSON.parse(fs.readFileSync("src/data/verseCitationStatus.json","utf8"));
const tally={}; for(const a in st) for(const p in st[a]) for(const s in st[a][p])
  {const v=st[a][p][s]; const k=typeof v==="object"?v.status:v; tally[k]=(tally[k]||0)+1;}
const n=p=>{const j=JSON.parse(fs.readFileSync("src/data/"+p,"utf8"));
  return Array.isArray(j)?j.length:Object.keys(j).length;};
console.log({lessons:f.length, arabic:ar, english:en, spans:tally,
  footnotes:n("footnotesData.json"), concordanceAyat:n("concordance.json"),
  scholars:n("scholars.json")});'
```

## How to register (5 minutes)

1. Go to https://zenodo.org — sign in with ORCID or GitHub
2. Click **+ New Upload**
3. Fill in the form using the metadata below
4. Upload a PDF snapshot of the site (or just the About page as a PDF)
5. Click **Publish** — a DOI like `10.5281/zenodo.XXXXXXX` comes back
6. Add the DOI to the site's citation format

---

## Zenodo Metadata

**Title:**
Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm: A Digital Scholarly Edition and Research Platform

**Authors:**
- Kunateh, Amadu (Translator & Digital Editor)

**Description:**
A digital scholarly edition and research platform for *Fī Riyāḍ Tafsīr al-Qurʾān al-Karīm*
by Shaykh Ibrāhīm Niasse (d. 1975), compiled with footnotes by Muḥammad ibn Shaykh ʿAbd
Allāh al-Tijānī al-Ibrāhīmī and printed by Majmaʿ al-Yamāma, Tunis, December 2022, in ten
volumes. The platform carries the Arabic text of all 56 lessons, which run from Q 1:1 to
Q 114:6, an English translation of Lessons 1–5, and the compiler's apparatus of 2,034
footnotes classified by genre.

Every Qurʾānic quotation inside the Arabic body is located by comparison against a
reference muṣḥaf rather than by hand-tagging, and each is marked with what the comparison
found: of 8,571 quoted spans, 5,499 stand in the printed āya as written, 83 diverge from
it at one or more letters, and 2,989 could not be placed against the reference and are
left unmarked. Readers can submit a correction against any marked citation.

Research tools include a verse concordance over 1,079 āyāt, an index of 59 scholars and
sources, a glossary of key terms, and full-text search. Available at niassetafsir.org.

**Resource type:** Software / Dataset
**Access:** Open

**Keywords:**
Quranic exegesis, tafsīr, Ibrahim Niasse, West African Islam, Tijaniyya, digital humanities,
Islamic studies, critical edition, bilingual edition, Arabic text, scholarly platform

**License:** CC BY-NC-ND 4.0
(Attribution, Non-commercial, No derivatives)

Matches `LICENSE` in the repository, added 25 September 2026. That file also carries the
carve-outs -- the Qur'anic text, the underlying tafsir, comparative texts, vendored
fonts -- and notes that CC BY-NC-ND is a poor fit for the application code.

**Related identifiers:**
- https://niassetafsir.org (is hosted at)
- https://niassetafsir.com (is hosted at)

**Notes:**
Full bilingual print edition (Arabic/English, 7 vols.) in preparation for academic publication.

---

## What changed, 25 September 2026

The earlier draft described a much smaller site: "30 lessons, Suras 1–16", "a partial
English translation (Lessons 1–2)", "798 footnotes", "a verse concordance (1,529
entries)". Three of those four are now wrong, and the first two understate the edition by
about half. A DOI record is permanent; depositing those numbers would have fixed them in
the citation record.
