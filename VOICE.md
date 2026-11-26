# Neural voice and timing pipeline

## Default voice
Kokoro v1.0 (82M parameters), CPU ONNX runtime, voice `am_michael` (US English), speed 1.0. This is an initial candidate for a consistent Northern Stingers narrator, not a final artistic choice. The upstream model card declares Apache-2.0; the ONNX inference library is MIT. Model binaries are fetched from the versioned upstream release. Record the printed SHA-256s; Python direct dependencies are version-pinned but the transitive environment is not fully locked. No API key, account, GPU or voice cloning needed.

- Model: https://huggingface.co/hexgrad/Kokoro-82M
- Voice list: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- ONNX library: https://github.com/thewh1teagle/kokoro-onnx
- Model assets: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
- WhisperX: https://github.com/m-bain/whisperX (BSD-2-Clause)
- English alignment model: https://huggingface.co/facebook/wav2vec2-base-960h (Apache-2.0)
- Independent ASR: https://huggingface.co/Systran/faster-whisper-tiny.en (MIT)

Install in a Python 3.12 virtual environment on Linux with FFmpeg, espeak-ng and libsndfile, then run:
```bash
bash scripts/install_voice.sh
python scripts/produce_audio.py audio/voice-smoke.json out/narration --engine kokoro
python scripts/align_voice.py audio/voice-smoke.json out/narration
python scripts/verify_voice.py audio/voice-smoke.json out/narration
```
The output contains dry voice, original music, SFX, stereo 48 kHz mix, cue metadata, word timestamps (s/e in seconds plus 30fps frame indices), alignment report and quality/performance report. English only for the reviewed alignment/ASR setup. Write numbers as spoken words. Keep scene slots roomy; generation rejects speech requiring more than 1.5x acceleration rather than truncating it. Use the aligned word timestamps to design animation events in Codex before rendering. The auto audio mode generates and aligns the soundtrack before rendering but does not rewrite camera/character animation automatically.

## VoiceStudio (optional, separate service)
Install VoiceStudio locally and choose an explicitly commercially permitted engine/voice. Its default OmniVoice weights are non-commercial; do not use them for brand videos. Voice cloning requires permission from the speaker. The adapter uses VoiceStudio's documented ElevenLabs-compatible endpoint, not ElevenLabs itself. VoiceStudio runs on your device or trusted server, not on a standard GitHub runner. The optional adapter is untested against a live instance. No server credentials belong in the repository, config JSON or public CI artifacts.

```bash
export VOICESTUDIO_URL=http://127.0.0.1:3900
export VOICESTUDIO_MODEL_ID='<verified commercial engine ID>'
export VOICESTUDIO_VOICE_ID='<approved voice profile or preset>'
export VOICESTUDIO_COMMERCIAL_APPROVED=1
# For authenticated servers, set VOICESTUDIO_API_KEY securely in your shell.
python scripts/produce_audio.py audio/voice-smoke.json out/studio --engine voicestudio
python scripts/align_voice.py audio/voice-smoke.json out/studio
python scripts/verify_voice.py audio/voice-smoke.json out/studio
```
For remote use, HTTPS and a trusted server are required. The acknowledgement is not a substitute for checking model/voice rights. See https://github.com/debpalash/VoiceStudio/blob/main/docs/elevenlabs-api.md and https://github.com/debpalash/VoiceStudio/blob/main/docs/mcp.md for Codex local MCP setup. Export approved final mix to public/audio/<composition-id>.wav if you want cloud rendering to use it rather than generating its own audio. Keep timing metadata with the project.

## Automated tests
The Neural voice validation Actions workflow runs independently of the 3D render. It exports the Kokoro sample, eSpeak baseline and machine-readable metrics: exact duration/format, silence/clipping, ASR word error rate (WER), WhisperX word coverage, model initialization and CPU synthesis real-time factor. Initial smoke gates: WER <= 25%, alignment coverage >= 90%, synthesis RTF <= 5 (excluding model load). Baseline uses relaxed WER/performance gates. These are diagnostic thresholds, not guarantees of naturalness; manually compare both voices and inspect word timings before publication. Automated forced alignment uses the supplied script, so ASR WER is measured independently. No subjective naturalness score is claimed.

In production, auto audio with an existing WAV uses that file; otherwise the render workflow generates Kokoro audio from audio/<composition-id>.json by default. Explicit espeak is still available for scratch tests; the five-second bridge smoke test intentionally stays on its previously validated scratch voice. The original bridge-specific score remains optional and unchanged. Neural CI and full-length narration must pass before making a production claim.
