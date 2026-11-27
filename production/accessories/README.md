# Accessories Don't Count — animated production

Original 16-second, eight-shot procedural Three.js / Remotion adaptation. The user's explicit animation request supersedes the attached brief's practical-only capture restrictions. No generated photographic footage, stock footage, copied reference frames, product model or external visual assets are used. The generic snap is a comedy prop, not a representation of a verified Northern Stingers mechanism.

## Reproduce

Node 22, Python 3.12, NumPy, Pillow (QA only), FFmpeg and a compatible Chromium browser are required.

```sh
npm ci --no-audit --no-fund
python -m pip install -r requirements-accessories.txt
python scripts/accessories-audio.py
npm run typecheck
# Use RENDER_BROWSER=/usr/bin/chromium when using an installed Chromium.
node scripts/accessories-review.mjs
# Inspect stills and draft.mp4, then record a fresh source-hash preview review.
node scripts/accessories-render.mjs production
python scripts/accessories-qa.py
python templates/scripts/short_qa.py out/accessories/AccessoriesDontCount.mp4 out/accessories/qa production/accessories/shots.json
```

`production` refuses stale scene hashes. The committed review records this delivered revision; any creative change requires another still/draft review and updated hashes. A review is an internal editorial decision, not independent audience approval.

Registered compositions: `AccessoriesDontCount` and `AccessoriesDontCountClean`. Both are 1080×1920, 30 fps, 480 frames; clean removes only the two overlays. Draft is 540×960. The dedicated `Accessories reel` GitHub workflow can repeat review or gated production when Actions is enabled by the repository owner. GitHub rejected dispatch during this production because repository Actions is disabled.

## Continuity and asset register

| Object | Continuity | Source / rights |
|---|---|---|
| P01 | Same olive/chartreuse paddle bait; nose up through release, nose right in case; removable nose fitting leaves with rig; no hardware after release | Original procedural geometry and scale texture |
| P02 | One generic opening front snap, removable nose fitting, cable and two treble positions; separates visibly from P01; retained with passengers and secured to bag | Original geometry, unbranded, inert virtual hooks |
| P03 | Exactly one orange bait, one silver spoon, one striped bait in the same rig child group throughout | Original geometry and textures; no duplication |
| P04 | Same clear hinged case, lid closes S05, latch S06; one bait only; clear face exposed on bag | Original geometry |
| P05 | Olive woven bag with webbing and lower retention strap, hidden until S07 | Original geometry and texture |
| P06 | Partitioned dark tray left of case, remains behind | Original geometry |
| Performer | Same charcoal sleeves and modeled hands, no head or face | Original procedural geometry; simplified anatomy |
| Sound | Continuous room noise, synthesized material ticks, plastic, clasp, fabric, pat and step | Original deterministic NumPy synthesis; no samples, music or voice |
| Type | Arial CSS family resolves to Liberation Sans on this Linux renderer | System-installed metrically compatible open font; no font file distributed |
| Lighting | West key, lower east fill, rear rim, neutral studio reflection environment | Three.js RoomEnvironment (MIT) and original staging |

MIT repository license retained. Dependency licenses remain in npm packages. No physical gear safety or product compatibility validation is claimed for virtual props.

## Directed timeline

See `shots.json` and the full attached `BRIEF.md`. The cuts remain at frames 54, 114, 165, 222, 285, 339 and 396. Opening copy is frames 0–113; final copy 408–479. No narration, music, extra copy, logo, promotional packaging, transitions or end card.

Production renders the complete moving clean master once. It then renders transparent 1080×1920 text plates from the registered `AccessoriesText` composition and composites them at frames 0–113 and 408–479 with FFmpeg. This preserves identical shot geometry, performance and synchronized AAC audio between the two masters, while avoiding a redundant second 3D render. The captioned H.264 export uses a 14 Mb/s target / 20 Mb/s maximum and fast-start metadata.

The workflow also runs on pushes to `feat/accessories-3d-20261127`, so enabling Actions and pushing a new/empty commit to this feature branch can generate the gated production artifact without merging the workflow into main. The existing review manifest must match the source and regenerated WAV. Repository Actions must first be enabled by its owner; no administration setting was changed during production.
