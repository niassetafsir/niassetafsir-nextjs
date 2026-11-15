"""Naming policy for niassetafsir.org: on the site, Shaykh Ibrāhīm is never bare
"Niasse". Reader-facing text says "Shaykh Ibrāhīm" or "Shaykh Ibrāhīm Niasse".
(AK's ruling, 15 Nov 2026.)

Rewrites every string value in the data files the pages print. Other members of
the family keep their names: a "Niasse" preceded by another given name (Maryam,
Abū Bakr, ʿUthmān, ʿAbd Allāh, Khalīfa, ...) is left alone, as is any "Niasse"
already preceded by Ibrāhīm. "Shaykh Niasse" becomes "Shaykh Ibrāhīm Niasse".
Idempotent. tests/naming.test.js enforces the same rule.

Usage: python3 scripts/name-policy.py FILE.json [FILE.json ...]
"""
import json, re, sys

KEEP_BEFORE = re.compile(
    r"(Ibr[āa]h[īi]m|Ibrahim|Ibra|Maryam|ʿUthmān|ʿUmar|Bakr|Allāh|Khalīfa|Muḥammad|Aḥmad|"
    r"Ḥājj|Hādī|ʿĀqib|Mā|b\.|bint|ibn|Baye|Serigne|Sërin|Seydi|Mamadou)[\s ]*$")
TOKEN = re.compile(r"(Shaykh|Sheikh)?(\s*)Niass[eé]('s|’s)?(?![\w_])")

def fix(s: str) -> str:
    out, last = [], 0
    for m in TOKEN.finditer(s):
        start = m.start()
        name_at = start + len(m.group(1) or "") + len(m.group(2))
        before = s[max(0, name_at - 30):name_at]
        if m.group(1):  # "Shaykh Niasse" -> "Shaykh Ibrāhīm Niasse"
            out.append(s[last:start] + f"{m.group(1)} Ibrāhīm Niasse" + (m.group(3) or ""))
        elif KEEP_BEFORE.search(before) or re.search(r"[\w/_.-]$", before) or re.match(r"\s*,\s*Ibr", s[m.end():]):
            # another family member; part of a file name or identifier; or a
            # surname-first citation ("Niasse, Ibrāhīm")
            # another family member, or part of a file name or identifier
            out.append(s[last:m.end()])
        else:
            out.append(s[last:start] + m.group(2) + "Shaykh Ibrāhīm" + (m.group(3) or ""))
        last = m.end()
    out.append(s[last:])
    return "".join(out)

def walk(x):
    if isinstance(x, str): return fix(x)
    if isinstance(x, list): return [walk(v) for v in x]
    if isinstance(x, dict): return {k: walk(v) for k, v in x.items()}
    return x

if __name__ == "__main__":
    for path in sys.argv[1:]:
        raw = open(path, encoding="utf-8").read()
        data = json.loads(raw)
        new = walk(data)
        indent = 1 if '\n "' in raw[:200] else 2
        text = json.dumps(new, ensure_ascii=False, indent=indent) + ("\n" if raw.endswith("\n") else "")
        open(path, "w", encoding="utf-8").write(text)
        print(path, raw.count("Niasse") - text.count("Niasse") + text.count("Ibrāhīm Niasse") - raw.count("Ibrāhīm Niasse"), "rewritten")
