"""Merge the Tabṣirat al-anām and Rijāl wa-adwār dossiers into src/data/corpus.json.

Idempotent: removes any earlier copy of these works' loci and links first.
Source: scripts/data/corpus-additions-dossiers.json, generated from the two
Word dossiers of 15 Nov 2026.
"""
import json, re
P='src/data/corpus.json'
d=json.load(open(P))
add=json.load(open('scripts/data/corpus-additions-dossiers.json'))
# Majmūʿ riḥalāt (the four travelogues), dossier of 15 Nov 2026: certain and
# probable uses only; the 'possible' allusions stay in the Word dossier.
_r=json.load(open('scripts/data/corpus-additions-rihlat.json'))
add['loci']+=_r['loci']; add['verseLinks']+=_r['verseLinks']
# Kāshif al-ilbās and its Tadhyīl (Casablanca 1353 print), dossier of 15 Nov 2026:
# certain and probable uses in his voice, plus the commentaries he copies, labelled
# with the author speaking. Kept apart from source_name() below, whose short
# labels (e.g. 'Ibn Ḥajar' -> Fatḥ al-bārī) would mislabel this book's sources.
_k=json.load(open('scripts/data/corpus-additions-kashif.json'))
WITS={'kashif-casablanca-1353','tadhyil-casablanca-1353','rijal-tunis-2012','tabsira-typescript','rihla-hijaziyya-majmu','nayl-al-mafaz-majmu','rihla-ghannariyya-majmu','rihla-kunakiriyya-majmu'}
d['loci']=[l for l in d['loci'] if l['witnessId'] not in WITS]
ids={l['id'] for l in add['loci']+_k['loci']}
d['verseLinks']=[k for k in d['verseLinks'] if k['locusId'] not in ids]
for l in add['loci']:
    if 'raw' in l['address']: l['address']['raw']=l['address']['raw'].replace('--','–')
    if l['id']=='rijal-001': l['voice']='own'
    if 'copiedFrom' not in l and l.get('textEn'):
        l['editorialNote']='The English is a summary of how he uses the verse here, not a translation of the passage.'
def source_name(raw):
    """The author speaking, as a reader needs it on a card: work and author,
    with the authority he cites where the dossier records one. The dossier's
    working labels ('same bāb', 'Niasse: …') only make sense in its table."""
    base=[('al-Rāzī','al-Rāzī, Mafātīḥ al-ghayb'),('al-Bukhārī','al-Bukhārī, al-Ṣaḥīḥ, Kitāb al-ʿIlm'),
          ('Ibn Ḥajar','Ibn Ḥajar, Fatḥ al-bārī'),('Fatḥ al-bārī','Ibn Ḥajar, Fatḥ al-bārī'),
          ('Ismāʿīl Ḥaqqī','Ismāʿīl Ḥaqqī, Rūḥ al-bayān'),('Rūḥ al-bayān','Ismāʿīl Ḥaqqī, Rūḥ al-bayān'),
          ('al-Ghazālī','al-Ghazālī, Iḥyāʾ ʿulūm al-dīn'),('Iḥyāʾ','al-Ghazālī, Iḥyāʾ ʿulūm al-dīn'),
          ('Asās al-iqtibās','Asās al-iqtibās'),('Lisān al-ʿArab','Ibn Manẓūr, Lisān al-ʿArab'),
          ('Ibn Rushd','Ibn Rushd al-Jadd, al-Muqaddimāt'),('Anonymous verse','an anonymous poet')]
    name=next((v for k,v in base if raw.startswith(k)),raw)
    m=re.search(r'<\s*([^()]+?)(?:\s*\(|$)',raw)
    if m: name+=', citing '+m.group(1).strip()
    return name
for l in add['loci']:
    if 'copiedFrom' in l: l['copiedFrom']=source_name(l['copiedFrom'])
d['loci']+=add['loci']+_k['loci']; d['verseLinks']+=add['verseLinks']+_k['verseLinks']
d['works']=[w for w in d['works'] if w['id'] not in ('tabsirat-al-anam','rijal-wa-adwar')]
works={w['id'] for w in d['works']}
if 'tabsirat-al-anam' not in works:
    d['works'].append({"id":"tabsirat-al-anam","titleAr":"تبصرة الأنام في أن العلم هو الإمام","titleTranslit":"Tabṣirat al-anām fī anna al-ʿilm huwa al-imām","titleEn":"Imparting Insight to Humanity Concerning the Fact That Knowledge Is the Imām","genre":"risala","attestation":"A","byNiasse":True,"composed":{"hijri":"1366","gregorian":"1946–47","certainty":"attested"},"exegeticalRegister":["prooftext","formula","allusion"],"publish":True,"author":"Ibrāhīm Niasse","relation":"self","note":"A treatise against claiming religious leadership by descent. Most of it transcribes other authors — al-Rāzī's Mafātīḥ al-ghayb on Q 2:31 fills pp. 13–28; his own verse use is the opening khuṭba, the catena opening Faṣl 1, and the colophon (Kaolack, 1366)."})
if 'rijal-wa-adwar' not in works:
    d['works'].append({"id":"rijal-wa-adwar","titleAr":"رجال وأدوار في ظل صاحب الفيضة التجانية: الملف السنغالي","titleTranslit":"Rijāl wa-adwār fī ẓill ṣāḥib al-fayḍa al-Tijāniyya: al-Malaff al-Sinighālī","titleEn":"Men and Roles in the Shade of the Master of the Fayḍa: The Senegal File","genre":"biography","attestation":"A","byNiasse":False,"composed":{"hijri":"1433","gregorian":"2012","certainty":"attested"},"exegeticalRegister":["allusion","application","formula"],"publish":True,"author":"Ibrāhīm Niasse","compiler":"Muḥammad b. al-Shaykh ʿAbd Allāh al-Tijānī","relation":"compiler","note":"Notices of Niasse's muqaddams, reproducing his letters, ijāzas, taqdīms, poems and waṣiyya, and sayings reported of him. Entries here are his words only; the editor's own uses of verses are not indexed."})
wits={w['id'] for w in d['witnesses']}
if 'tabsira-typescript' not in wits:
    d['witnesses'].append({"id":"tabsira-typescript","workId":"tabsirat-al-anam","medium":"digital","language":"ar","year":"2012","addressScheme":"pdf-page","isBase":True})
if 'rijal-tunis-2012' not in wits:
    d['witnesses'].append({"id":"rijal-tunis-2012","workId":"rijal-wa-adwar","medium":"print","language":"ar","year":"2012","publisher":"Majmaʿ al-Yamāma","place":"Tunis","addressScheme":"printed-page","isBase":True})
RIHLA_WITNESSES={'rihla-hijaziyya':'rihla-hijaziyya-majmu','nayl-al-mafaz':'nayl-al-mafaz-majmu',
  'rihla-ghannariyya':'rihla-ghannariyya-majmu','rihla-kunakiriyya':'rihla-kunakiriyya-majmu'}
if 'nayl-al-mafaz' not in {w['id'] for w in d['works']}:
    d['works'].append({"id":"nayl-al-mafaz","titleAr":"نيل المفاز بالعود إلى الحجاز","titleTranslit":"Nayl al-mafāz bi-l-ʿawd ilā l-Ḥijāz","titleEn":"Attaining the Prize by Returning to the Ḥijāz","genre":"rihla","attestation":"A","byNiasse":True,"composed":{"hijri":"1370","gregorian":"1951","certainty":"attested"},"exegeticalRegister":["poetic","allusion"],"publish":True,"author":"Ibrāhīm Niasse","relation":"self","note":"His second pilgrimage, by Lagos, Kano, Rome and Cairo, in rajaz. In the Majmūʿ riḥalāt."})
for w in d['works']:
    if w['id'] in RIHLA_WITNESSES: w['publish']=True
wids={w['id'] for w in d['witnesses']}
for work,wit in RIHLA_WITNESSES.items():
    if wit not in wids:
        d['witnesses'].append({"id":wit,"workId":work,"medium":"print","language":"ar","addressScheme":"printed-page (PDF page in parentheses)","isBase":True,"editor":"Majmūʿ riḥalāt al-Shaykh Ibrāhīm (scribal colophons Jeddah, Shaʿbān 1413/1993)"})
for w in d['works']:
    if w['id']=='kashif': w['publish']=True
if 'tadhyil-kashif' not in {w['id'] for w in d['works']}:
    d['works'].append({"id":"tadhyil-kashif","titleAr":"تذييل كاشف الإلباس عن فيضة الختم أبي العباس","titleTranslit":"Tadhyīl Kāshif al-ilbās","titleEn":"Supplement to The Removal of Confusion","genre":"sufi-doctrine","attestation":"A","byNiasse":True,"composed":{"hijri":"1351","gregorian":"1932","certainty":"attested"},"exegeticalRegister":["prooftext","formula","allusion"],"publish":True,"author":"Ibrāhīm Niasse","relation":"self","note":"His supplement to Kāshif al-ilbās: on tarbiya, the Tijānī wird and waẓīfa, Ṣalāt al-Fātiḥ, the vision of God, the shaṭaḥāt of the majdhūbs. Finished at Kaos, 8 Muḥarram 1351. Most of its verses sit inside passages he quotes (al-Yūsī, Rūḥ al-bayān, Ibn ʿArabī, Ibn Ḥajar)."})
wids={w['id'] for w in d['witnesses']}
for wit,work in (('kashif-casablanca-1353','kashif'),('tadhyil-casablanca-1353','tadhyil-kashif')):
    if wit not in wids:
        d['witnesses'].append({"id":wit,"workId":work,"medium":"print","language":"ar","year":"1353/1934–35","place":"Casablanca","addressScheme":"printed-page (PDF page in parentheses)","isBase":True,"editor":"First edition, printed for al-Sharīf Sīdī Muḥammad Būṭālib of Kaolack; Princeton University Library copy"})
# The site carries Shaykh Ibrāhīm's own words only (AK, 15 Nov 2026). Passages he
# copies from other authors stay in the Word dossiers and the additions files,
# not on the verse pages.
_copied={l['id'] for l in d['loci'] if 'copiedFrom' in l}
d['loci']=[l for l in d['loci'] if l['id'] not in _copied]
d['verseLinks']=[k for k in d['verseLinks'] if k['locusId'] not in _copied]
# Naming policy: never bare "Niasse" on the site (scripts/name-policy.py).
import importlib.util
_spec = importlib.util.spec_from_file_location('name_policy', 'scripts/name-policy.py')
_np = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_np)
d = _np.walk(d)
json.dump(d,open(P,'w'),ensure_ascii=False,indent=2)
print(len(d['works']),len(d['witnesses']),len(d['loci']),len(d['verseLinks']))
