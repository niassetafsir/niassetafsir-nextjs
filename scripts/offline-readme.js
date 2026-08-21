#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const out = process.argv[2];
fs.writeFileSync(path.join(out, 'READ-ME-FIRST.txt'),
`Fī Riyāḍ al-Tafsīr — offline copy
================================

Two ways to open it.

  1. Double-click index.html.

  2. Better, if anything looks wrong: open Terminal, cd into this folder, run

         python3 -m http.server 8000

     then visit http://localhost:8000 in a browser. Some browsers restrict
     what a page opened straight from disk may load; a local server does not.

WHAT WORKS
  Every lesson, all four panels: the Arabic, the comparison with Jalālayn and
  Rūḥ al-Bayān, the Critical Apparatus, and the overview.
  Every verse the edition indexes, with its cross-corpus loci.
  Footnotes, hadith index, glossary, terms, search, the sūra and volume
  browsers, and the printable lesson view.

WHAT DOES NOT, AND WHY
  Audio. The Wolof sessions and the Qurʾānic recitation stream from external
  hosts; there is nothing to play without a network.
  The feedback and contact forms, which post to a live endpoint.
  The Arabic word tool's morphology lookup, which calls an external API. It
  fails soft and shows the rest.

This is a copy taken at a moment in time. The live site is niassetafsir.org.
`, 'utf8');
console.log('  wrote READ-ME-FIRST.txt');
