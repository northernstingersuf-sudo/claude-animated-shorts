# Accessories Don't Count — live-action production handoff

**Status: BLOCKED — original practical footage and audio not supplied.** This is an edit scaffold, not a completed video. Do not substitute animations, generated footage or unrelated stock. Do not publish or upload private source footage to this public repository without permission.

## Required acquisition
Shoot native vertical 9:16, 30 fps (prefer 2160×3840), with at least two seconds of handles. Keep the same hands, olive/chartreuse 15–17 cm soft bait, detachable rig, orange hard bait, silver spoon, dark-striped lure, clear 19×6×4 cm case and dark olive bag. Use inert/blunted hooks and a supported cluster, not hooks carrying weight. Verify real release mechanism and case fit. Match neutral 5000 K light, west key, charcoal clothing, no faces or reflections. Preserve original full-length takes separately. Edit exact shot-ready files at 30 fps CFR and 1080×1920 or 2160×3840, with no baked-in text, transitions or soundtrack.

| File | Frames | Timeline | Required action / capture |
|---|---:|---|---|
| F01.mp4 | 54 | 0–1.8 s | 50 mm, 12° upward tilt; bait already lifts three linked lures, clear tray |
| F02.mp4 | 60 | 1.8–3.8 s | 28 mm, 18 cm right truck; bundle meets tiny case rim |
| F03.mp4 | 51 | 3.8–5.5 s | 85 mm macro, 3–4 cm push; find real front release |
| F04.mp4 | 57 | 5.5–7.4 s | 100 mm locked macro; visibly separate bare bait from same three passengers |
| F05.mp4 | 63 | 7.4–9.5 s | 50 mm locked overhead; bare bait in case, close lid |
| F06.mp4 | 54 | 9.5–11.3 s | 50 mm locked, rack focus from latch to rig; reach back for cluster |
| F07.mp4 | 57 | 11.3–13.2 s | 85 mm locked close-up; secure rig to bag via soft tether; hide full cluster |
| F08.mp4 | 84 | 13.2–16.0 s | 28 mm, 25 cm pullback through 13.6; reveal both case and three-lure cluster, pat case, step right |

Lens values are full-frame equivalents. Follow the attached full production brief for detailed camera choreography, staging and capture.

Also supply a final 16-second stereo 48 kHz WAV (`mix.wav`) made from real recorded room tone, ring/metal contact, plastic case, connector/carabin­er clicks and fabric/footstep Foley. No music or voice. Key cue times: 0.1/0.6 ring ticks; 2.65 rim knock; 6.0 release; 6.4 settling; 8.1 lure placement; 9.0 hinge; 9.8 latch; 10.85 ring; 12.3 carabiner; 13.6 reveal jingle; 13.7 fabric; 14.7 pat; 15.1–16 step. Target −16 LUFS and ≤−1 dBTP, verify by listening.

## Assembly and review
Place cleared files under `public/accessories-dont-count/` locally; do not commit unapproved media to this public fork. Use the exact shot-ready durations above. Render fails if the required assets are missing; there are no placeholder visuals. The composition uses Inter if available to Chromium, Arial fallback; verify font and text fit in preview. The clean composition is identical except for text. The separate mixed WAV carries all audio; clip audio is muted.

Run from the repository root on this branch:
```sh
npm ci
npm run typecheck
python scripts/check_accessories_assets.py
npm run studio
```
Review the smoke tests, stills and preview before production as required by AGENTS.md. Use the dedicated footage-based composition instead of the animated/narrated bridge audio pipeline. After visual/audio approval:
```sh
npx remotion render src/index.ts AccessoriesDontCount out/accessories-dont-count.mp4 --codec=h264 --crf=16
npx remotion render src/index.ts AccessoriesDontCountClean out/accessories-dont-count-clean.mp4 --codec=h264 --crf=16
```
Verify both outputs with ffprobe and mobile playback: 1080×1920, 480 frames, 30 CFR, 16 seconds, H.264, AAC 48 kHz stereo, Rec.709 SDR, no clipping or unintended black bars; check bitrate and remux/re-encode if needed for brief delivery settings. Confirm overlays on frames 0–113 and 408–479 only. Record actual camera settings, continuity, clip rights and safe staging, independently review the final reveal if possible. All physical, editorial and output QA remain unknown until footage is acquired. No production render or publish authorization implied.

## Publishing caption
Accessories don't count. What's your personal record for lures tangled together? 🎣 #pikefishing #fishinghumor #northernstingers
