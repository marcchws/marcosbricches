import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE || "http://localhost:3216";
const OUT = "_vis";
mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: "320", width: 320, height: 640, mobile: true },
  { name: "375", width: 375, height: 812, mobile: true },
  { name: "768", width: 768, height: 1024, mobile: true },
  { name: "1024", width: 1024, height: 768, mobile: false },
  { name: "1366x600", width: 1366, height: 600, mobile: false },
  { name: "1440x720", width: 1440, height: 720, mobile: false },
  { name: "1920", width: 1920, height: 1080, mobile: false },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});

for (const vp of viewports) {
  const page = await browser.newPage();
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: 2,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
  });
  await page.goto(BASE, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1200));

  const report = await page.evaluate(() => {
    const iw = window.innerWidth;
    const de = document.documentElement;
    const overflow = de.scrollWidth - iw;
    // find elements that extend past the viewport right edge
    const culprits = [];
    for (const el of document.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.right > iw + 1 && r.width > 0) {
        culprits.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 40),
          right: Math.round(r.right),
          width: Math.round(r.width),
        });
      }
    }
    const ih = window.innerHeight;
    const title = document.querySelector(".hero-title");
    const tr = title?.getBoundingClientRect();
    const titleFont = title
      ? Math.round(parseFloat(getComputedStyle(title).fontSize))
      : null;
    const bodyEl = document.querySelector(".hero-sub");
    const bodyFont = bodyEl
      ? Math.round(parseFloat(getComputedStyle(bodyEl).fontSize))
      : null;
    const toggle = document.querySelector(".nav-toggle");
    const td = toggle ? getComputedStyle(toggle).display : "n/a";
    // vertical fit: do the hero CTAs sit above the fold?
    const actions = document.querySelector(".hero-actions");
    const ar = actions?.getBoundingClientRect();
    const actionsBottom = ar ? Math.round(ar.bottom) : null;
    const heroFits = ar ? ar.bottom <= ih : null;
    return {
      innerWidth: iw,
      innerHeight: ih,
      scrollWidth: de.scrollWidth,
      overflowPx: overflow,
      titleWidth: tr ? Math.round(tr.width) : null,
      titleRight: tr ? Math.round(tr.right) : null,
      titleFont,
      bodyFont,
      navToggleDisplay: td,
      actionsBottom,
      heroFits,
      culprits: culprits.slice(0, 6),
    };
  });

  await page.screenshot({ path: `${OUT}/vp-${vp.name}.png` });
  console.log(
    `\n[${vp.name}] ${report.innerWidth}x${report.innerHeight} overflowX=${report.overflowPx}px ` +
      `titleFont=${report.titleFont}px bodyFont=${report.bodyFont}px navToggle=${report.navToggleDisplay} ` +
      `heroFits=${report.heroFits} (cta=${report.actionsBottom}/${report.innerHeight})`,
  );
  if (report.culprits.length) {
    console.log("  culprits:", JSON.stringify(report.culprits));
  }
  await page.close();
}

await browser.close();
console.log("\nDone. Screenshots in", OUT);
