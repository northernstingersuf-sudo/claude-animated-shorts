# PikeStrikes production

60 seconds, 1800 frames, 1080 × 1920, 30 fps. `art.ts` builds original painted
Canvas textures and plum-outline cards; `world.ts` builds the original Three.js
lake and shoreline. Postprocessing reuses bridge ink, two-pass lens blur and
neutral tone mapping without changing the bridge. The local MIT-derived ink and lens
modules reduce the search radius and sample counts for CPU rendering. `story.ts` reads checked-in
WhisperX metadata, making reaction events two frames early where appropriate.

The composition is silent by design; mux the approved soundtrack explicitly, as
in the existing pipeline. This avoids accidentally mixing a second audio track.

Local commands from repository root (Python 3.12 venv, Node 22, FFmpeg):

```sh
npm ci
bash scripts/install_voice.sh
python scripts/produce_audio.py audio/PikeStrikes.json out/pike-audio --engine kokoro
python scripts/align_voice.py audio/PikeStrikes.json out/pike-audio
python scripts/verify_voice.py audio/PikeStrikes.json out/pike-audio
npm run typecheck
node scripts/pike-render.mjs stills
node scripts/pike-render.mjs preview
node scripts/pike-render.mjs draft
# Inspect draft before requesting this:
node scripts/pike-render.mjs production
```

The generated timing file must match the checked-in dry voice. Do not regenerate
narration and silently substitute new timings. See `scripts/pike-finish-audio.py`
for copying aligned metadata and adding word-synchronized ambience/SFX without
resynthesizing voice. Check cue/word differences before committing replacement
metadata. `scripts/pike-render.mjs` uses `public/audio/PikeStrikes.wav` and keeps
silent renders separately. Set `CHROME_PATH=/usr/bin/chromium` locally if needed.

GitHub Actions fallback from the unmerged branch: use the existing **Render videos**
workflow, select `feat/short-001-pike-strikes`, composition `PikeStrikes`, mode
`draft` (then `production` after review). This existing workflow delegates only
PikeStrikes draft/production to the new reusable sharded renderer. The unchanged
smoke/bridge jobs retain their existing behaviour. Fifteen 120-frame chunks are
assembled and checked for the complete 1800-frame output. No merge is required.

```sh
gh workflow run render.yml --ref feat/short-001-pike-strikes -f composition=PikeStrikes -f mode=draft -f audio=auto -f voice_engine=kokoro
gh run list --workflow render.yml --branch feat/short-001-pike-strikes
gh run watch <run-id>
gh run download <run-id> --name pike-full-<run-id> --dir out/cloud-draft
```

Use `-f mode=production` for 1080 output after reviewing the draft. Neither new
standalone dispatch workflow needs to be registered on main for this route.
These branch workflows are prepared, not claimed to have passed in Actions.

Narration review: automated ASR verifies recognition, not naturalness. A listening
review of the dry voice and final mix remains required before publication. The
recorded environment is in `artifacts/pike-strikes/python-environment.txt`; direct
requirements are pinned but the upstream installer does not constrain transitive
Torch resolution. Use `torch==2.6.0+cpu` and `torchaudio==2.6.0+cpu` as pip constraints
after the CPU installation. On this environment, the pinned CTranslate2 4.4.0
wheel needed its executable-stack bit cleared with a local `patchelf --clear-execstack`
on `ctranslate2.libs/libctranslate2-d3638643.so.4.4.0` before ASR could load.
No repository dependency version was changed for this host repair.
