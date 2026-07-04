// One-shot screenshotter for the design loop. Captures every page + key modals.
import puppeteer from "puppeteer";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || "http://localhost:3000";
const MODE = process.argv[3] || "developer"; // set so /developer is reachable

const outDir = join(__dirname, "temporary screenshots");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
let n = readdirSync(outDir)
  .map((f) => parseInt((/^screenshot-(\d+)/.exec(f) || [])[1], 10))
  .filter((x) => !isNaN(x))
  .reduce((a, b) => Math.max(a, b), 0);

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.evaluateOnNewDocument((mode) => {
  localStorage.setItem("signetix.mode", mode);
  localStorage.setItem("signetix.entered", "1");
}, MODE);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function shot(label, full = true) {
  n += 1;
  const p = join(outDir, `screenshot-${n}-${label}.png`);
  await page.screenshot({ path: p, fullPage: full });
  console.log("saved", p);
}
async function go(path) {
  await page.goto(BASE + path, { waitUntil: "networkidle2", timeout: 60000 });
  await wait(1300);
}

await go("/login");
await shot("login", false);

await go("/");
await shot("home");

// collapsed sidebar
await page.evaluate(() => {
  const b = document.querySelector('button[aria-label="Collapse sidebar"]');
  b && b.click();
});
await wait(700);
await shot("home-collapsed");
await page.evaluate(() => {
  const b = document.querySelector('button[aria-label="Expand sidebar"]');
  b && b.click();
});
await wait(500);

await go("/practice");
await shot("practice-categories");

await go("/practice/1");
await shot("practice-modules");

// open practice modal
const tryBtn = await page.$x ? null : null;
const clicked = await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Try now"));
  if (btn) { btn.click(); return true; }
  return false;
});
if (clicked) {
  await wait(900);
  await shot("practice-modal", false);
  // press start to show camera + begin
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Start");
    b && b.click();
  });
  await wait(2500);
  await shot("practice-modal-running", false);
}

await go("/developer");
await shot("developer-categories");

// open new category modal
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("New category"));
  b && b.click();
});
await wait(700);
await shot("developer-category-form", false);
await page.keyboard.press("Escape");
await wait(300);

// modules tab + new module modal
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "modules");
  b && b.click();
});
await wait(600);
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("New module"));
  b && b.click();
});
await wait(700);
// type a gloss query to reveal the autocomplete dropdown
const searchSel = 'input[placeholder^="Search glosses"]';
await page.focus(searchSel).catch(() => {});
await page.type(searchSel, "nasi", { delay: 60 }).catch(() => {});
await wait(700);
await shot("developer-module-form", false);

await go("/contact");
await shot("contact");

await go("/settings");
await shot("settings");

await browser.close();
console.log("done");
