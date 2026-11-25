# Rendering on GitHub Actions
1. Enable Actions in this fork (Actions tab, enable workflows if prompted).
2. Open the smoke pull request and inspect the Render videos check. Smoke runs on PRs. Manual dispatch becomes available when the workflow is present on the default branch.
3. After a successful smoke run, download the ZIP in the run's Artifacts section. It contains a 2D video, 3D video, bridge stills and the FFmpeg audio-mux test.
4. Once merged, use Actions > Render videos > Run workflow. Choose smoke, still, draft, production or high-quality. Use a registered composition ID. The draft uses 540x960 for the bridge; production 1080x1920; high-quality 1440x2560. Only run full renders after reviewing stills.
5. Optional audio: add original/licensed audio as public/audio/<composition-id>.wav; video renders mux that file if present, padding/trimming to picture length. No narration is supplied by this scaffold.

Local setup (optional): Node 22, Python 3, FFmpeg, npm install, npm run studio. All Remotion packages are pinned to the same release. Dependency resolution currently generates a lockfile in CI; download the lockfile artifact and commit it after the initial successful install to enable npm ci in future runs. Standard Linux runners use software WebGL (swangle) and may be slow or fail on the full bridge. The original optional Kenney GLB models are not included; bridge previews will not exactly match the source. The upstream Python audio scripts require a separate voice/timing setup and have not been ported yet. No GPU or external TTS is configured.
