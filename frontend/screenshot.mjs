// Screenshot helper for the design feedback loop.
//   node screenshot.mjs [url] [label]
// Saves auto-incremented PNGs to "temporary screenshots/" (never overwritten).
import puppeteer from "puppeteer";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || "http://localhost:3000";
const label = process.argv[3] || "";

const outDir = join(__dirname, "temporary screenshots");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const nums = readdirSync(outDir)
  .map((f) => /^screenshot-(\d+)/.exec(f))
  .filter(Boolean)
  .map((m) => parseInt(m[1], 10));
const next = (nums.length ? Math.max(...nums) : 0) + 1;
const name = `screenshot-${next}${label ? "-" + label : ""}.png`;
const outPath = join(outDir, name);

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
// Let fonts, gradients and entrance animations settle.
await new Promise((r) => setTimeout(r, 1400));
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log("Saved", outPath);
