#!/usr/bin/env bash
# Original template score + SFX requires a matching 67.5s narration and manually aligned word timings.
set -euo pipefail
if [ "$#" -ne 3 ]; then echo "Usage: bash scripts/original_bridge_audio.sh voice.wav words.json output-dir"; exit 2; fi
VOICE=$(realpath "$1")
WORDS=$(realpath "$2")
mkdir -p "$3"
OUT=$(realpath "$3")
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/voice"
cp -r templates/audio "$TMP/audio"
ffmpeg -y -v error -i "$VOICE" -ar 48000 -ac 1 -c:a pcm_s24le "$TMP/voice/voice.wav"
cp "$WORDS" "$TMP/voice/words.json"
python - "$TMP/voice/words.json" <<'PY'
import json,sys
words=json.load(open(sys.argv[1]))
assert isinstance(words,list) and words
last=0
for w in words:
    s,e=float(w["s"]),float(w["e"])
    assert last<=s<e<=67.5,(s,e)
    last=s
PY
python "$TMP/audio/mix.py"
cp "$TMP/audio/"*.wav "$TMP/audio/cues.md" "$OUT/"
