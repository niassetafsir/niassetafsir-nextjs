# English Translation Rebuild Plan — Lessons 1–6

**Scope:** Full paragraph-by-paragraph English translations (Brill/IJMES standards)  
**Status:** Strategy confirmed, ready for implementation  
**Estimated effort:** 120–180 work-hours (phased across multiple sessions)

---

## Why This Is Necessary

1. **Current state:** Existing English is 22–55% condensed vs. Arabic (only 15–46% of Arabic paragraph count)
2. **User requirement:** Full translations with paragraph-by-paragraph alignment
3. **Standards:** All transliterations must be IJMES-compliant; register must match Brill scholarly conventions
4. **Scope change:** Not a refinement of existing translations, but a complete rebuild

---

## Work Breakdown by Lesson

### Lesson 1: Al-Istiʿādha, Basmala, and Sūrat al-Fātiḥa · Q. 1:1–2:5

**Current state:**
- Arabic: 27,789 chars, ~83 paragraphs
- English: 22,854 chars, 46 paragraphs (55% condensed)
- Status: Production (not marked as draft)

**Tasks:**
1. Extract 83 Arabic paragraphs from arabicBody
2. Create full English translation (83 paragraphs to match)
3. IJMES compliance review (transcription terms, proper nouns)
4. Paragraph alignment verification
5. Back-translation spot-checks (10+ paragraphs)
6. Quality check against Brill standards

**Estimated effort:** 20–25 hours

---

### Lesson 2: Sūrat al-Baqara · Q. 2:6–25

**Current state:**
- Arabic: 17,922 chars, ~37 paragraphs
- English: 35,411 chars, 51 paragraphs (140% expanded — unusual)
- Status: Production (not marked as draft)

**Special consideration:** English exceeds Arabic in paragraph count. May indicate:
- Expansion/elaboration of original (needs audit)
- Translation divides longer Arabic paragraphs into smaller ones
- Addition of explanatory material not in source

**Tasks:**
1. Audit existing 51 English paragraphs against 37 Arabic paragraphs
2. Identify which English paragraphs correspond to which Arabic
3. Consolidate/restructure to achieve 37-to-37 alignment (matching Arabic)
4. Remove any additions not justified by Arabic source
5. Apply IJMES standards
6. Quality verification as above

**Estimated effort:** 18–22 hours

---

### Lesson 3: Sūrat al-Baqara · Q. 2:26–59

**Current state:**
- Arabic: 30,332 chars, ~70 paragraphs
- English: 28,954 chars, 32 paragraphs (46% condensed)
- Status: **DRAFT_TRANSLATION** (awaits word-for-word review)

**Tasks:**
1. Full word-for-word review against Arabic (this is the explicit requirement for DRAFT translations)
2. Identify which Arabic paragraphs are missing English coverage
3. Expand English to cover all 70 Arabic paragraphs
4. IJMES compliance
5. Quality verification
6. Once complete: **Remove lesson 3 from DRAFT_TRANSLATION list**

**Estimated effort:** 22–28 hours

---

### Lesson 4: Sūrat al-Baqara · Q. 2:60–105

**Current state:**
- Arabic: 31,689 chars, ~65 paragraphs
- English: 21,947 chars, 15 paragraphs (23% only — most heavily condensed)
- Status: **DRAFT_TRANSLATION**

**Critical issue:** Only 15 English paragraphs for 65 Arabic paragraphs. This is either:
- A very aggressive summary (not acceptable for "full translation")
- Severely incomplete work-in-progress

**Tasks:**
1. Audit all 15 existing English paragraphs for accuracy/fidelity
2. Identify gaps (which 50 Arabic paragraphs have no English)
3. Full rebuild: expand to cover all 65 Arabic paragraphs
4. IJMES compliance
5. Quality verification
6. Once complete: **Remove lesson 4 from DRAFT_TRANSLATION list**

**Estimated effort:** 25–35 hours (most reconstruction needed)

---

### Lesson 5: Sūrat al-Baqara · Q. 2:106–202

**Current state:**
- Arabic: 60,325 chars, ~127 paragraphs (longest lesson)
- English: 48,999 chars, 28 paragraphs (22% only)
- Status: **DRAFT_TRANSLATION**

**Special context:** Arabic was fully rebuilt from Google Drive in prior session (from ~43% to 100% of Drive docs). English has not been updated since; it's now severely out of proportion.

**Tasks:**
1. Determine which 28 English paragraphs correspond to which 127 Arabic paragraphs
2. Full rebuild: expand to cover all 127 paragraphs
3. IJMES compliance
4. Quality verification
5. Once complete: **Remove lesson 5 from DRAFT_TRANSLATION list**

**Estimated effort:** 30–40 hours (longest lesson)

---

### Lesson 6: Sūrat al-Baqara · Q. 2:203–252

**Current state:**
- Arabic: 53,650 chars, ~121 paragraphs
- English: **None** (hasEnglish: false)
- MT draft: `/translation-drafts/lesson-06-en-DRAFT-MT.md` (90 KB, marked "NOT for publication")
- Status: **MISSING**

**Approved approach:**
1. AK reviews the MT draft and provides corrections/feedback
2. Use corrected MT as starting point (not final form)
3. Rebuild into 121-paragraph full translation
4. Apply IJMES/Brill standards
5. Quality verification
6. Deploy to site (set hasEnglish: true)

**Tasks for this session:**
1. Prepare MT draft for your review (extract from file)
2. Flag areas needing attention
3. Await your corrections

**Estimated effort (after AK feedback):** 20–28 hours

---

## Phased Implementation Approach

Given the total scope (120–180 hours), recommend phasing:

### Phase 1 (Immediate): Lessons 1 & 2
- Combined: 38–47 hours
- Both production status (less risky to start here)
- Lesson 2 audit may reveal restructuring needs early
- Timeline: 2–3 weeks

### Phase 2 (Following): Lessons 3 & 4
- Combined: 47–63 hours
- Both DRAFT status (explicit requirement to complete word-for-word review)
- Lesson 4 most labor-intensive
- Timeline: 3–4 weeks

### Phase 3 (Final): Lesson 5 & 6
- Combined: 50–68 hours
- Lesson 5 longest
- Lesson 6 depends on AK's MT review feedback
- Timeline: 4–5 weeks

**Total timeline:** 8–12 weeks for full rebuild at measured pace

---

## Quality Control Workflow

### Per-Paragraph Verification
For each Arabic → English paragraph pair:

1. **Meaning fidelity**: English conveys all major points from Arabic
2. **Completeness**: No significant Arabic content omitted
3. **Accuracy**: Technical terms translate correctly
4. **Transliteration**: All Arabic terms use IJMES standards
5. **Register**: Scholarly, elevated, rigorous (no colloquialisms)
6. **Back-translation**: Translate English back to Arabic (mental check); does it match the original?

### Lesson-Level Verification
1. **Consistency**: All terms used consistently within lesson (e.g., always "ʿālim," never "alim")
2. **Cross-lesson consistency**: Same terms used same way across all six lessons
3. **HTML cleanliness**: All `<p>` tags properly closed, encoding correct
4. **Footnote alignment**: Any footnote markers align with existing apparatus
5. **Qur'anic citations**: All verse references present and correctly formatted

### Final Deployment Verification
1. **JSON validity**: All lesson files parse correctly
2. **Site rendering**: All six lessons display correctly on live site
3. **Alignment index**: Build bilingual paragraph-level index for future reference
4. **Search index**: Update search corpus with full English text (run `npm run build`)

---

## IJMES Compliance Checklist

All transliterated terms must follow IJMES standards:

### Key Terms (Check Against IJMES Word List)
- [ ] ʿālim / ʿulamaʾ (not alim/ulama)
- [ ] faqīh / fuqahāʾ (not faqih/fuqaha)
- [ ] Qur'ān(ic) (not Koran/Quran)
- [ ] sharīʿa (not sharia/shari'ah)
- [ ] dhimmī (not dhimmi)
- [ ] Sunni / Shiʿi (not Sunni/Shia)
- [ ] ʿarabiyyat (not arabiyat)
- [ ] tafsīr (not tafsir)
- [ ] ḥadīth (not hadith)
- [ ] ijmāʿ (not ijma)
- [ ] qiyās (not qiyas)
- [ ] islāh (not islah)
- All proper nouns (Muḥammad, ʿAbd Allāh, etc.)

### Consonant Diacritics (From IJMES Table)
- ḥ (emphatic h)
- ṭ (emphatic t)
- ṣ (emphatic s)
- ḍ (emphatic d)
- ẓ (emphatic z)
- ʿ (ayn, not apostrophe)
- ʾ (hamza, not apostrophe)

### Vowel Diacritics
- ā (long a)
- ū (long u)
- ī (long i)
- iyy (doubled ya, final i)
- uww (doubled waw, final u)
- au/aw (diphthong)
- ai/ay (diphthong)

---

## Tools & Resources Needed

1. **IJMES standards** (provided): Transliteration System + Word List
2. **Brill style guide** (reference): Nahj al-Balaghah methodology
3. **Google Drive Drive docs** (for cross-reference): Lessons 1–6 source material
4. **JSON editor** (for deployment): VS Code or similar
5. **Bilingual comparison tool** (for alignment): Side-by-side editor
6. **Back-translation reviewer** (for quality check): Native Arabic speaker familiar with classical Arabic

---

## Key Decisions Needed from User

1. **Priority order**: Phases 1 → 2 → 3 as proposed, or different order?
2. **Lesson 6 MT draft**: Review timeline? Submit feedback when ready?
3. **Quality bar**: Current plan assumes rigorous Brill-standard verification for all lessons. Acceptable?
4. **Resource constraints**: Any timeline constraints or budget limits?
5. **Back-translation verification**: Who will do this? (Native speaker recommended)

---

## File Locations & Deployment

**Input:**
- Arabic source: `/home/claude/niassetafsir-nextjs/src/data/lessons/0{1..6}.json` (arabicBody field)
- MT draft (Lesson 6): `/home/claude/niassetafsir-nextjs/translation-drafts/lesson-06-en-DRAFT-MT.md`

**Output:**
- Updated lesson JSON: `/home/claude/niassetafsir-nextjs/src/data/lessons/0{1..6}.json` (englishText field)
- DRAFT removal: `/home/claude/niassetafsir-nextjs/src/lib/draftTranslations.ts`

**Build & deploy:**
- `npm run build` (regenerates search index with new English text)
- Vercel deployment (user's responsibility via GitHub Desktop)

---

## References Attached to This Plan

- IJMES Transliteration System (PDF)
- IJMES Word List (PDF)
- Nahj al-Balaghah edition methodology (PDF excerpt) — demonstrates Brill scholarly standards

---

**Status:** Ready for implementation upon user confirmation of priorities and timeline.
