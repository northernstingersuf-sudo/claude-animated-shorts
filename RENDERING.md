# Cloud rendering
Enable Actions in the fork. The PR runs automatic smoke checks. After merging an approved PR, use Actions > Render videos > Run workflow with a registered composition ID. Modes: smoke, bridge-preview (five seconds of the bridge), still, draft, production, high-quality. Bridge resolutions: 540x960, 1080x1920, 1440x2560. Download output from the workflow artifacts. No local installation is necessary.

## Dependency reproducibility
The exact npm lockfile from successful run 45705417072 is restored and SHA-256 checked when absent; a branch-only bootstrap workflow commits that file. Once committed, all runs use npm ci directly. Node 22 and Python 3.12 are selected in CI.

## Models
All 25 expected prop names have deterministic procedural substitutes, not exact Kenney replicas. Existing vegetation and banners remain procedurally detailed in build.ts. Optional licensed GLBs can override them in public/bridge/kenney/. Retain any third-party license notices. No assets are downloaded from unverified sources. The bridge template now mounts synchronously when only bundled models are used.

## Audio
For original shorts, create audio/<composition-id>.json using audio/bridge-preview.json as the schema. Explicit scene slots contain narration, and timed step/whoosh/splash cues plus a simple original score are generated without an API key using eSpeak NG. The scratch voice is robotic; use a supplied original/licensed public/audio/<composition-id>.wav for production-quality narration. Audio cue timing is sentence-level, not word-level. Auto mode prefers a supplied WAV, otherwise the JSON if present. The full bridge score is separate: supply audio/bridge/voice.wav and audio/bridge/words.json with accurately aligned s/e word times matching the upstream 67.5-second picture. Select bridge-original to invoke the original Python synthesis/mix with pinned NumPy/SciPy. This full original-score option needs its own test with real aligned narration.

## Quality checks
Smoke tests include basic 2D/3D, audio muxing, two bridge stills with spatial contrast and distinct content, and a five-second 150-frame bridge render with generated narration and sound effects. Explicit flash frames 130–133 are exempt from the flat-frame check. The tests are heuristics, not a substitute for human visual review. Full-length CPU rendering remains unmeasured. No GPU or premium voice provider has been configured.

Local setup (optional): Node 22, Python 3, FFmpeg and eSpeak NG; npm ci; npm run studio. For manual original bridge audio, install requirements-bridge-audio.txt and run scripts/original_bridge_audio.sh.
