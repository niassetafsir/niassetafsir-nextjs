#!/usr/bin/env bash
#
# Builds a self-contained copy of the site that runs with no network at all --
# for showing the edition on a laptop with no wifi.
#
# WHAT IT PRODUCES
#
#   offline-demo/            open index.html, or serve the folder
#
# HOW IT WORKS
#
# The site is built and served locally, then crawled with wget, which rewrites
# every link to a relative path. Three things do not survive that on their own,
# so they are handled first:
#
#   1. The Critical Apparatus panel fetches /api/footnotes?lessonId=N. A static
#      mirror has no server to answer a query string, so NEXT_PUBLIC_OFFLINE=1
#      makes the two callers read public/data/offline/footnotes-N.json instead.
#      Those files are generated below by the same code path the route uses.
#
#   2. Amiri comes from Google Fonts by @import. Downloaded and self-hosted, so
#      the Arabic renders in the right face on a machine that has never seen it.
#
#   3. ArabicWordTool calls an external morphology API. It already fails soft;
#      offline it simply falls back, which is correct behaviour and not worth
#      faking.
#
# WHAT WILL NOT WORK OFFLINE, and should be said out loud when demonstrating:
# the audio (Wolof and Qurʾānic recitation stream from YouTube/external hosts)
# and the feedback forms, which post to a live endpoint.
#
#   bash scripts/build-offline-demo.sh
#
set -euo pipefail
cd "$(dirname "$0")/.."

PORT=3199
OUT=offline-demo
STAGE=.offline-stage

echo "==> 1/6  generating the static apparatus files"
node scripts/build-offline-api.js

echo "==> 2/6  self-hosting Amiri"
# globals.css is rewritten in place to point at the local font, and restored
# on the way out -- including if the build fails. A demo build must never
# leave the repository pointing at a font it does not ship.
CSS=src/app/globals.css
PRINT=src/app/lesson/\[id\]/print/page.tsx
cp "$CSS" "$CSS.pre-offline"
cp "$PRINT" "$PRINT.pre-offline"
restore() {
  [ -f "$CSS.pre-offline" ] && mv "$CSS.pre-offline" "$CSS"
  [ -f "$PRINT.pre-offline" ] && mv "$PRINT.pre-offline" "$PRINT"
  kill ${SERVER:-0} 2>/dev/null || true
}
trap restore EXIT

NEXT_PUBLIC_OFFLINE=1 node scripts/vendor-fonts.js
# The print view links the Google stylesheet directly rather than importing it.
# Only redirect it if the font actually came down -- otherwise the print view
# would point at a file that is not there.
if [ -f public/fonts/.vendored ]; then
  sed -i.bak "s|https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400\&display=swap|/fonts/amiri.css|g" "$PRINT"
  rm -f "$PRINT.bak"
fi

echo "==> 3/6  building with NEXT_PUBLIC_OFFLINE=1"
NEXT_PUBLIC_OFFLINE=1 npm run build >/dev/null

echo "==> 4/6  serving on :$PORT"
npx next start -p "$PORT" >/tmp/offline-serve.log 2>&1 &
SERVER=$!
for i in $(seq 1 40); do
  curl -sf "http://localhost:$PORT/" >/dev/null && break
  sleep 1
done

echo "==> 5/6  crawling"
rm -rf "$STAGE" "$OUT"
mkdir -p "$STAGE"

# Seed the crawl with every route the site does not link to from the home page
# in plain HTML -- lesson panels are tab state, not links, and the verse pages
# are reached through a client-side jump bar.
#
# The seed list is exhaustive, so the crawl runs at --level=1. At level 3 it
# followed prev/next from every verse page and pulled in 3,000 āyāt nothing
# indexes, taking the folder from 140 MB to 399 MB for pages no link in the
# demo reaches.
SEEDS=$STAGE/seeds.txt
: > "$SEEDS"
for p in "" about about/tafsir audio bookmarks clips footnotes glossary hadith \
         notes order preorder read research saved search term translators-note verse \
         get-involved get-involved/feedback get-involved/join get-involved/report-error \
         get-involved/suggestions; do
  echo "http://localhost:$PORT/$p" >> "$SEEDS"
done
for i in $(seq 1 56); do
  echo "http://localhost:$PORT/lesson/$i" >> "$SEEDS"
  echo "http://localhost:$PORT/lesson/$i/print" >> "$SEEDS"
done
for i in $(seq 1 114); do echo "http://localhost:$PORT/surah/$i" >> "$SEEDS"; done
for i in $(seq 1 10);  do echo "http://localhost:$PORT/volume/$i" >> "$SEEDS"; done
node scripts/offline-seed-verses.js "$PORT" >> "$SEEDS"

wget --quiet --show-progress --progress=dot:giga \
     --recursive --level=1 --no-parent \
     --page-requisites --adjust-extension --convert-links \
     --restrict-file-names=windows \
     --domains=localhost --no-host-directories \
     --directory-prefix="$STAGE/site" \
     --input-file="$SEEDS" || true

echo "==> 6/6  assembling"
mv "$STAGE/site" "$OUT"
# wget only takes what it can see in the HTML, which leaves two holes.
#
# Route chunks. Next names them from a build manifest, not from a <script> tag
# on every page, so wget missed app/research, app/volume/[id] and
# app/translators-note entirely -- those pages rendered as an empty shell. Copy
# the whole static tree rather than trying to guess which chunks a route wants.
mkdir -p "$OUT/_next"
mkdir -p "$OUT/_next/static"
cp -R .next/static/. "$OUT/_next/static/"

# Anything only a fetch() knows about: the hadith index, the glossary graph,
# the search index, the root lexicon, and the offline apparatus files.
mkdir -p "$OUT/data"
cp -R public/data/. "$OUT/data/" 2>/dev/null || true
cp -R public/fonts "$OUT/fonts" 2>/dev/null || true
node scripts/offline-readme.js "$OUT"

echo
echo "done: $OUT  ($(du -sh "$OUT" | cut -f1))"
echo "open $OUT/index.html, or from that folder run:  python3 -m http.server 8000"
