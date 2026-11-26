# Validation record — Northern Stingers 001

This record distinguishes executable checks from artistic approval. Source is a
60-second, 1800-frame Remotion composition configured at 1080×1920 / 30 fps.

Verified locally:

- `npm run typecheck`: passed after adding PikeStrikes.
- Existing Smoke2D and Smoke3D: H.264, 540×960, 30 frames, verified with
  `scripts/verify_video.py`. Explicit narration mux smoke also passed.
- `scripts/produce_audio.py`: completed eight Kokoro am_michael cues.
- `scripts/align_voice.py`: 146/146 words, coverage 1.0; measured WhisperX output
  checked in, with scores, seconds and 30 fps indices.
- `scripts/verify_voice.py`: passed; independent ASR WER 0.0, dry voice peak
  0.5971, clipped fraction 0.0, synthesis RTF 0.595, load 2.09 seconds.
- `pip check`: no broken requirements. Complete transitive versions and model
  hashes are included. CTranslate2 needed a local executable-stack flag repair.
- Mix: stereo 48 kHz PCM, exactly 60 s; measured -17.15 LUFS integrated,
  -4.50 dBTP, LRA 2.90 LU after normalization targeting -16 LUFS. Mean dry voice
  exceeds the combined score/effects by 15.34 dB during active voice samples.
  The loudness JSON's `input_*` fields describe the delivered file; `output_*`
  fields describe the analysis filter's hypothetical second normalization.
- First six-second animated preview: 270×480, 180 frames, audio present. Existing
  video verifier passed. Additional full-decoded-frame check found no flat frames
  and no consecutive identical frames. Reviewed a 12-image temporal sheet.

Visual iterations caught and corrected excessive plant occlusion, a disconnected
rod, a doubled-back fishing line, and a quadrant-only canvas after a buffer-size
optimization. The first temporal review prompted a clearer hinged jaw opening,
contact particles and a short impact camera move. These are original stylized
illustrations, not scientific motion-capture or calibrated fluid simulation.

Final draft validation:

- Full sixty-second draft completed at **144×256**, H.264 with AAC stereo.
  `verify_video.py`: 1800 frames at 30 fps, correct dimensions, audio present,
  spatial contrast and visible motion checks passed.
- `pike-inspect.py` decoded all 1800 frames: no flat frames; largest identical
  frame run one; mean interframe RGB delta 0.511. Reviewed the twenty-image
  full-film sheet and the ten-scene still sheet. These checks do not certify
  production-resolution edge quality or subjective artistic polish.
- Final 270×480 six-second preview passed the same video structure check;
  decoded all 180 frames, no flat or repeated consecutive frames. Inspected its
  temporal sheet and the 540×960 jaw-open still. Before final full draft, reset
  lure rotation and particle depth on every pose to avoid frame-history state.
- All ten 540×960 major-scene stills passed color diversity and contrast checks.
  Hook and open-jaw stills were refreshed after framing/animation revisions.
- Final TypeScript and `git diff --check` passed. No reference imagery is included.

Unverified / limitations:

- The unchanged BridgeShort still timed out locally at the default 33-second
  page timeout. In Actions run 45765897592 on initial PR revision 3d1517b, the
  TypeScript, 2D/WebGL smoke and Bridge template stills steps passed; the bridge
  preview was still running at that observation. No complete workflow success
  is inferred from those partial results. Bridge source and smoke steps remain
  preserved. Neural pipeline CI run 45765897591 completed successfully (its
  sample is separate from this film; the full film voice passed locally).
- A 1080×1920 full render and the new sharded Actions workflow are not validated.
- Automated ASR is not a subjective listening or naturalness review. Listening to
  the complete dry narration and final mix remains a publication gate.
- The scientific hook is questioned, not verified as a universal biological fact.
  See SCRIPT.md for source scope and uncertainty, including the muskellunge
  species limitation of the primary sensory experiment.

No merge or publication is authorized by this record.

Artifacts: `draft.mp4`, `preview.mp4`, `full-sheet.png`, `scene-sheet.png`,
`strike-sheet.png`, per-scene PNGs, lossless dry voice/music/SFX FLACs, media
metadata, actual render logs and machine-readable QA are beside this report.
The master mix is `public/audio/PikeStrikes.wav`. The local 270×480 full-draft
attempt was stopped for CPU throughput; the 135×240 attempt failed the H.264
even-dimension requirement. The delivered 144×256 draft completed successfully.
Production remains configured at 1080×1920 and needs the documented render run.
