import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  selectComposition,
  renderMedia,
  renderStill,
} from "@remotion/renderer";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
const mode = process.argv[2] || "draft";
if (!["draft", "production"].includes(mode))
  throw Error("Use draft or production");
if (mode === "production") {
  const gate = JSON.parse(
    fs.readFileSync("production/accessories/preview-review.json", "utf8"),
  );
  for (const file of Object.keys(gate.sources)) {
    const hash = crypto
      .createHash("sha256")
      .update(fs.readFileSync(file))
      .digest("hex");
    if (gate.sources[file] !== hash) throw Error(`Review stale: ${file}`);
  }
  if (gate.status !== "approved") throw Error("Preview review required");
}
const browserExecutable = process.env.RENDER_BROWSER;
const browser = await openBrowser("chrome", {
  browserExecutable,
  chromiumOptions: { gl: "swangle" },
});
try {
  const serveUrl = await bundle({ entryPoint: "src/index.ts" });
  const dir = "out/accessories";
  fs.mkdirSync(dir, { recursive: true });
  const ids =
    mode === "production"
      ? ["AccessoriesDontCountClean"]
      : ["AccessoriesDontCount"];
  for (const id of ids) {
    const inputProps = { draft: mode === "draft" };
    const composition = await selectComposition({
      serveUrl,
      id,
      puppeteerInstance: browser,
      inputProps,
    });
    let last = -1;
    await renderMedia({
      serveUrl,
      composition,
      puppeteerInstance: browser,
      inputProps,
      outputLocation: `${dir}/${mode === "draft" ? "draft" : id}.mp4`,
      codec: "h264",
      crf: 18,
      audioCodec: "aac",
      audioBitrate: "256k",
      sampleRate: 48000,
      colorSpace: "bt709",
      scale: mode === "draft" ? 0.5 : 1,
      concurrency: 2,
      chromiumOptions: { gl: "swangle" },
      onProgress: ({ progress }) => {
        const p = Math.floor(progress * 20) * 5;
        if (p !== last) {
          last = p;
          console.log(`${id}: ${p}%`);
        }
      },
    });
  }
  if (mode === "production") {
    const composition = await selectComposition({
      serveUrl,
      id: "AccessoriesText",
      puppeteerInstance: browser,
      inputProps: {},
    });
    for (const [name, frame] of [
      ["opening", 0],
      ["ending", 408],
    ]) {
      await renderStill({
        serveUrl,
        composition,
        puppeteerInstance: browser,
        output: `${dir}/${name}.png`,
        frame,
        imageFormat: "png",
        inputProps: {},
      });
    }
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-v",
        "error",
        "-i",
        `${dir}/AccessoriesDontCountClean.mp4`,
        "-i",
        `${dir}/opening.png`,
        "-i",
        `${dir}/ending.png`,
        "-filter_complex",
        "[0:v][1:v]overlay=enable='lt(t,3.8)'[base];[base][2:v]overlay=enable='gte(t,13.6)'[video]",
        "-map",
        "[video]",
        "-map",
        "0:a:0",
        "-c:v",
        "libx264",
        "-profile:v",
        "high",
        "-pix_fmt",
        "yuv420p",
        "-b:v",
        "14M",
        "-maxrate",
        "20M",
        "-bufsize",
        "28M",
        "-c:a",
        "copy",
        "-r",
        "30",
        "-color_primaries",
        "bt709",
        "-color_trc",
        "bt709",
        "-colorspace",
        "bt709",
        "-movflags",
        "+faststart",
        `${dir}/AccessoriesDontCount.mp4`,
      ],
      { stdio: "inherit" },
    );
    console.log("Matched clean and captioned masters complete");
  }
} finally {
  await browser.close({silent:true});
}
