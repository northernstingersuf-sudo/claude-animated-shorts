# Production review

## Scope and editorial decisions

The user requested a fully animated 3D adaptation. Practical-only capture instructions in the attached brief are therefore superseded for this delivery. This is an openly stylized CG production, not real footage or a verified tackle demonstration. Timing, shot order, two exact overlays, one bait / three passengers, release, false victory and separate-accessories reveal are retained.

Actual scene inspections led to revisions of opening text clearance, macro hand scale, rounded sleeves, visible mating eyelet, fingertip support, the rig's settled pose, pickup contact, wider case/pickup framing, metal reflection lighting and the S06 focus transfer. No generic footage or reference imagery is included.

## Departures and limits

- All props, hands, textures, lighting and motion are procedural. Hands and fabric remain stylized; skin anatomy, soft-body compression and cloth simulation are simplified. The plain room follows the brief's uncluttered setup.
- Equipment is generic. No Northern Stingers connector design, performance, packaging or trademarked product appearance is asserted.
- The virtual camera's distances and fields of view are adjusted to preserve portrait readability. They are not physical lens/capture metadata. The opening lift and tilt amplitudes are reduced for the portrait staging; S06 is wider than the proposed close-up to retain both story objects during the reach. The move types and locked cut times are preserved.
- Foley and room tone are synthesized original material sounds, not recordings of practical props. There is no music, narration or dialogue. The sparse mix is approximately −25.6 LUFS, −1.3 dBTP before AAC encoding, rather than the proposed −16 LUFS; no aggressive limiter is applied.
- Arial resolves to Liberation Sans on the Linux renderer; the copy, size, weight, placement and hard in/out times are preserved.
- Deliberate brief-directed locked holds in S03, S04 and S05 may be flagged by the template's frozen-frame heuristic. They are short performance pauses, not failed animation.
- Independent fresh-viewer testing, actual phone-speaker/headphone listening, TikTok/Instagram UI previews and real tackle compatibility testing are unavailable. No independent approval or platform-safe-area certification is claimed.
- GitHub Actions dispatch returned HTTP 422: “Actions has been disabled for this repository.” The branch and render workflow are supplied; local verified files satisfy the accessible-video alternative. Nothing is merged or published.

## Evidence

Local type check, Smoke2D, Smoke3D and audio-mux checks passed. The render-review log, representative stills, complete story draft, corrected S04 preview, final metadata and per-frame QA report accompany the delivered files. Latest hardware removal, overhead framing and case-retention changes were reviewed in targeted previews/stills after the complete story draft. Final stream and frame checks passed as recorded below. Actual captioned and clean export contact sheets were visually inspected; a successful process alone was not treated as visual approval.

## Per-shot critical review (self-review, not an independent rating)

| Shot | Review finding | Revision / remaining constraint |
|---|---|---|
| S01 | Immediate multiple-lure silhouette and exact opening line are legible | Raised text clearance, retained three distinct passenger silhouettes |
| S02 | Movement establishes tray-left / case-right geography and failed fit | Widened view and adjusted travel to show case and load together |
| S03 | Front eyelet and generic snap visible in macro | Smaller hands and clearer mating eyelet; simplified finger anatomy remains the weakest visual element |
| S04 | Gate opens, bait lifts away, rig lowers with all passengers intact | Corrected supporting hand and settle geometry; no missing or multiplied passengers |
| S05 | Horizontal, nose-right bait fits the case; overhead contrasts with the opening | Widened overhead, corrected latch state before S06 |
| S06 | Case-to-rig focus transfer and hand reach reopen the question | Corrected hand target after settle change, widened view; more negative space than the proposed CU |
| S07 | Tight attachment shot withholds full load and excludes the case | Same bag loop, rig and hand; no early full-bag reveal |
| S08 | One case and full cluster visible together, pat and step retained | Lowered bench below waist scene, widened final pullback to remove edge cropping and occlusion |

The editorial structure meets the intended quality target in self-review. Overall visual finish is approximately **7.8/10**, below the aspirational 8/10, chiefly because of procedural hand anatomy and fabric/material realism. Several framing and continuity revisions improve clarity but do not make this a photoreal production. No independent score is claimed.


## Final export results — verified 2026-11-27

| Check | Result |
|---|---|
| Final and clean master | PASS — 1080×1920, 16.000 s, exactly 480 frames |
| CFR | PASS — every presentation interval is 1/30 s within timestamp rounding tolerance |
| Picture | H.264 High, progressive SDR, bt709 primaries/transfer/matrix |
| Audio | AAC-LC, stereo, 48 kHz, approximately 253 kb/s; matching encoded AAC packet hashes and aligned starts |
| Overlay boundaries | PASS — present on frames 0/113/408/479; absent on 114/407; clean has no copy |
| Frame scan | No black or unplanned white frames in 480-frame scan |
| Held-frame flags | Reviewed: 146–164, 165–178, 206–221, 243–255, 270–284, 285–304, 350–375, 380–395. Intended holds or small mechanism movements below the scan threshold |
| Motion-spike flags | Frames 376–380: continuous S07 hand withdrawal, reviewed in the actual frame sheet; no extra cut |
| Final audio level | −25.8 LUFS integrated, −3.1 dB true peak; no clipping. Below the brief's proposed −16 LUFS target |
| Actual bitrate | Captioned video about 10.0 Mb/s from a 14 Mb/s VBR target; below the proposed 12–20 Mb/s range. Clean uses CRF 18; no filler bits added |
| Final visual review | First/last frames and representative encoded frames across all eight shots inspected; clean physical story inspected without overlays |
| Local environment | Node 24.22.3, Python 3.12.14, Chromium 156.0.8078.79, FFmpeg 7.1.5; CPU swangle, two production workers |
| Source | Feature branch `feat/accessories-3d-20261127`; main not merged or changed |
| GitHub Actions | NOT RUN — dispatch rejected because Actions is disabled. Local accessible files supplied |

The delivered source archive includes the exact generated WAV, pinned dependencies, caption, rights/continuity register, preview gate and final verification data. No publication has been performed.

Source branch: https://github.com/northernstingersuf-sudo/claude-animated-shorts/tree/feat/accessories-3d-20261127
