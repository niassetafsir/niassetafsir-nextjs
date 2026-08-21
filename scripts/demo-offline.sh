#!/usr/bin/env bash
#
# Run the real site on a laptop with no internet.
#
#     bash scripts/demo-offline.sh prepare    # ONCE, while you still have wifi
#     bash scripts/demo-offline.sh start      # any time after, offline
#
# `start` opens http://localhost:3000 and everything works: the panels, the
# apparatus, the verse jump bar, search, the filters, the printable view. This
# is the actual application, not a copy of it, so nothing degrades.
#
# Prefer this to scripts/build-offline-demo.sh. That one produces a folder of
# flat HTML for a machine with no Node at all, and pays for it -- 340 MB, and
# links carrying a query string (the Critical Apparatus filtered to one lesson)
# land on the unfiltered page, because a folder of files has no server to
# answer a query. Use it only if the demo machine is not this one.
#
# WHY `prepare` NEEDS WIFI, AND WHAT IT DOES WITH IT
#
#   1. `npm ci` -- dependencies.
#   2. Amiri. The stylesheet imports it from Google Fonts, so with no network
#      the Arabic falls back to whatever face the machine has, which on a Mac
#      with no Arabic typeface installed is bad enough to spoil a demo. This
#      downloads the font, builds against a local @font-face, and restores the
#      source afterwards, so the built output is self-contained and the
#      repository is left exactly as it was.
#   3. `npm run build`.
#
# Run it once on wifi. After that `start` needs nothing.
#
# WHAT STILL WILL NOT WORK, because it genuinely cannot:
#   - Audio. The Wolof sessions and the recitation stream from external hosts.
#   - The feedback and contact forms, which post to a live endpoint.
#   - The Arabic word tool's morphology lookup. It calls an external API, fails
#     soft, and shows the rest of the panel.
# Say these out loud when demonstrating rather than letting someone click one.
#
set -euo pipefail
cd "$(dirname "$0")/.."

MODE="${1:-}"
PORT="${PORT:-3000}"

case "$MODE" in
  prepare)
    echo "==> 1/3  dependencies"
    npm ci

    echo "==> 2/3  embedding Amiri"
    CSS=src/app/globals.css
    PRINT='src/app/lesson/[id]/print/page.tsx'
    cp "$CSS" "$CSS.pre-offline"
    cp "$PRINT" "$PRINT.pre-offline"
    restore() {
      [ -f "$CSS.pre-offline" ] && mv "$CSS.pre-offline" "$CSS"
      [ -f "$PRINT.pre-offline" ] && mv "$PRINT.pre-offline" "$PRINT"
    }
    trap restore EXIT

    node scripts/vendor-fonts.js
    if [ -f public/fonts/.vendored ]; then
      sed -i.bak "s|https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap|/fonts/amiri.css|g" "$PRINT"
      rm -f "$PRINT.bak"
      echo "    Amiri embedded — the Arabic will render correctly offline"
    else
      echo "    ! Amiri NOT embedded. The demo will still run, but on a machine"
      echo "      with no Amiri installed the Arabic will use a fallback face."
      echo "      Re-run this step somewhere with access to fonts.googleapis.com."
    fi

    echo "==> 3/3  building"
    npm run build

    echo
    echo "Ready. With no internet, run:   bash scripts/demo-offline.sh start"
    ;;

  start)
    if [ ! -d .next ]; then
      echo "No build found. Run this once while you have wifi:" >&2
      echo "    bash scripts/demo-offline.sh prepare" >&2
      exit 1
    fi
    if [ ! -f public/fonts/.vendored ]; then
      echo "! Amiri is not embedded — Arabic may render in a fallback face."
      echo "  Harmless, but re-run 'prepare' on wifi to fix it."
      echo
    fi
    cat <<'TOUR'
Serving on http://localhost:3000   (ctrl-C to stop)

A route through it that shows the real work:

  /lesson/1              the four panels. Comparison has content ONLY here --
                         Jalālayn and Rūḥ al-Bayān are transcribed for
                         al-Fātiḥa so far, and every other lesson says so
                         rather than showing an empty column.
  /lesson/1  Citations   the two apparatuses: the compiler's documentary
                         footnotes, and the editor's notes above them in gold.
  /lesson/6              the verse chips under the Arabic. A dashed chip is a
                         quotation this edition identified, not one the
                         printing bracketed -- hover for the tooltip.
  /verse/2:255           one āya, every place in the corpus that treats it.
  /footnotes             the apparatus by scholar, work and genre.
  /research              what the edition can be asked, with live counts.

Audio, the feedback forms and the word tool's morphology lookup need the
internet and will not work. Everything else will.

TOUR
    exec npx next start -p "$PORT"
    ;;

  *)
    echo "usage: bash scripts/demo-offline.sh {prepare|start}" >&2
    echo "  prepare   once, on wifi: install, embed Amiri, build" >&2
    echo "  start     any time after, offline: serve on localhost:$PORT" >&2
    exit 2
    ;;
esac
