"""Merge the Tabṣirat al-anām and Rijāl wa-adwār dossiers into src/data/corpus.json.

Idempotent: removes any earlier copy of these works' loci and links first.
Source: scripts/data/corpus-additions-dossiers.json, generated from the two
Word dossiers of 15 Nov 2026.
"""
import json, re
P='src/data/corpus.json'
d=json.load(open(P))
add=json.load(open('scripts/data/corpus-additions-dossiers.json'))
WITS={'rijal-tunis-2012','tabsira-typescript'}
d['loci']=[l for l in d['loci'] if l['witnessId'] not in WITS]
ids={l['id'] for l in add['loci']}
d['verseLinks']=[k for k in d['verseLinks'] if k['locusId'] not in ids]
for l in add['loci']:
    if 'raw' in l['address']: l['address']['raw']=l['address']['raw'].replace('--','–')
    if l['id']=='rijal-001': l['voice']='own'
    if 'copiedFrom' not in l and l.get('textEn'):
        l['editorialNote']='The English is a summary of how he uses the verse here, not a translation of the passage.'
d['loci']+=add['loci']; d['verseLinks']+=add['verseLinks']
works={w['id'] for w in d['works']}
if 'tabsirat-al-anam' not in works:
    d['works'].append({"id":"tabsirat-al-anam","titleAr":"تبصرة الأنام في أن العلم هو الإمام","titleTranslit":"Tabṣirat al-anām fī anna al-ʿilm huwa al-imām","titleEn":"Enlightening Mankind: That Knowledge Is the Imām","genre":"risala","attestation":"A","byNiasse":True,"composed":{"hijri":"1366","gregorian":"1946–47","certainty":"attested"},"exegeticalRegister":["prooftext","formula","allusion"],"publish":True,"author":"Ibrāhīm Niasse","relation":"self","note":"A treatise against claiming religious leadership by descent. Most of it transcribes other authors — al-Rāzī's Mafātīḥ al-ghayb on Q 2:31 fills pp. 13–28; his own verse use is the opening khuṭba, the catena opening Faṣl 1, and the colophon (Kaolack, 1366)."})
if 'rijal-wa-adwar' not in works:
    d['works'].append({"id":"rijal-wa-adwar","titleAr":"رجال وأدوار في ظل صاحب الفيضة التجانية: الملف السنغالي","titleTranslit":"Rijāl wa-adwār fī ẓill ṣāḥib al-fayḍa al-Tijāniyya: al-Malaff al-Sinighālī","titleEn":"Men and Roles in the Shade of the Master of the Fayḍa: The Senegal File","genre":"biography","attestation":"A","byNiasse":False,"composed":{"hijri":"1433","gregorian":"2012","certainty":"attested"},"exegeticalRegister":["allusion","application","formula"],"publish":True,"author":"Muḥammad wuld al-Shaykh ʿAbd Allāh al-Tijānī","relation":"compiler","note":"Notices of Niasse's muqaddams, reproducing his letters, ijāzas, taqdīms, poems and waṣiyya, and sayings reported of him. Entries here are his words only; the editor's own uses of verses are not indexed."})
wits={w['id'] for w in d['witnesses']}
if 'tabsira-typescript' not in wits:
    d['witnesses'].append({"id":"tabsira-typescript","workId":"tabsirat-al-anam","medium":"digital","language":"ar","year":"2012","addressScheme":"pdf-page","isBase":True})
if 'rijal-tunis-2012' not in wits:
    d['witnesses'].append({"id":"rijal-tunis-2012","workId":"rijal-wa-adwar","medium":"print","language":"ar","year":"2012","publisher":"Majmaʿ al-Yamāma","place":"Tunis","addressScheme":"printed-page","isBase":True})
json.dump(d,open(P,'w'),ensure_ascii=False,indent=2)
print(len(d['works']),len(d['witnesses']),len(d['loci']),len(d['verseLinks']))
