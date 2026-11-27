import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  selectComposition,
  renderStill,
  renderMedia,
} from "@remotion/renderer";
import fs from "node:fs";
const url = await bundle({ entryPoint: "src/index.ts" });
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.RENDER_BROWSER,
  chromiumOptions: { gl: "swangle" },
});
const inputProps = { draft: true };
const comp = await selectComposition({
  serveUrl: url,
  id: "AccessoriesDontCount",
  puppeteerInstance: browser,
  inputProps,
});
const dir = "out/accessories";
fs.mkdirSync(dir, { recursive: true });
const frames = process.env.REVIEW_FRAMES
  ? process.env.REVIEW_FRAMES.split(",").map(Number)
  : [0, 35, 85, 145, 169, 188, 219, 245, 285, 320, 365, 407, 440, 479];
for (const frame of frames) {
  await renderStill({
    serveUrl: url,
    composition: comp,
    puppeteerInstance: browser,
    output: `${dir}/frame-${frame}.png`,
    frame,
    scale: 0.5,
    inputProps,
    chromiumOptions: { gl: "swangle" },
  });
  console.log(`Still ${frame}`);
}
if (process.env.REVIEW_STILLS_ONLY === "1") {
  await browser.close({silent:true});
  process.exit(0);
}
await renderMedia({
  serveUrl: url,
  composition: comp,
  puppeteerInstance: browser,
  outputLocation: `${dir}/${process.env.REVIEW_RANGE ? "mechanism-review" : "draft"}.mp4`,
  ...(process.env.REVIEW_RANGE
    ? { frameRange: process.env.REVIEW_RANGE.split("-").map(Number) }
    : {}),
  codec: "h264",
  scale: 0.5,
  inputProps,
  concurrency: 1,
  chromiumOptions: { gl: "swangle" },
  onProgress: ({ progress, renderedFrames }) => {
    if (renderedFrames % 30 === 0)
      console.log(
        `Draft ${renderedFrames}/480 (${Math.floor(progress * 100)}%)`,
      );
  },
});
await browser.close({silent:true});
console.log("\nDraft complete");
