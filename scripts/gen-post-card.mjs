// Generates a 1080x1080 branded "quote card" for a post, to attach to the
// LinkedIn post. Same Chrome pipeline as gen-assets (brand fonts + tokens, pixel
// faithful). Parameterized so the post-kit skill can drive it.
//
// Usage:
//   node scripts/gen-post-card.mjs
//   node scripts/gen-post-card.mjs '{"slug":"x","quoteTop":"...","quoteAmber":"...","eyebrow":"ESCRITA"}'
import puppeteer from "puppeteer-core";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const BG = "#100908";
const FG = "#e9e4de";
const MUTED = "#aaa39d";
const ACCENT = "#e5a14b";
const LINE = "#2e2724";

// M+S monogram (de "Marcos"), espaço 451x451 — fonte: public/Vector.svg
const MARK =
  "M190.882 56.9214L78.309 170.967C56.7034 192.858 44.5634 222.554 44.5634 253.513C44.5634 300.6 82.238 338.771 128.717 338.771C153.343 338.771 176.962 328.862 194.375 311.215L279.085 225.394C291.45 212.863 308.225 205.824 325.714 205.824C351.024 205.824 371.54 226.611 371.54 252.251C371.54 271.114 364.17 289.212 351.046 302.584L205.719 450.743L69.3468 450.743C31.0487 450.743 -1.35718e-06 419.694 -3.03124e-06 381.396L-1.54514e-05 97.2553C-1.77993e-05 43.5418 42.9783 5.34345e-05 95.9932 5.11171e-05C149.008 4.87998e-05 190.882 56.9214 190.882 56.9214ZM381.396 450.743C419.694 450.743 450.743 419.694 450.743 381.396L450.743 111.454C450.743 50.1452 401.687 0.450762 341.175 0.450765C317.541 0.450766 294.876 9.96145 278.161 26.8944L94.8814 212.578C85.2355 222.352 79.819 235.603 79.819 249.426C79.819 278.026 102.702 301.209 130.933 301.209C143.93 301.209 156.393 295.98 165.588 286.665L260.935 190.071C276.493 174.31 297.588 165.453 319.592 165.453C369.061 165.453 409.162 206.08 409.162 256.202C409.162 285.185 397.796 312.973 377.572 333.467L261.814 450.743L381.396 450.743Z";

const b64 = (p) => readFileSync(resolve(ROOT, p)).toString("base64");
const clash600 = b64("public/fonts/clash-600.woff2");
const general400 = b64("public/fonts/general-400.woff2");
const general500 = b64("public/fonts/general-500.woff2");

const fontFace = `
  @font-face{font-family:'Clash';src:url(data:font/woff2;base64,${clash600}) format('woff2');font-weight:600;}
  @font-face{font-family:'General';src:url(data:font/woff2;base64,${general400}) format('woff2');font-weight:400;}
  @font-face{font-family:'General';src:url(data:font/woff2;base64,${general500}) format('woff2');font-weight:500;}
`;

const DEFAULT = {
  slug: "contexto-e-tudo",
  eyebrow: "ESCRITA",
  // amber accent only on the payoff, via <span class="a">...</span>
  quoteHtml:
    'A diferença não estava no prompt. Estava no que chegou <span class="a">antes dele.</span>',
};

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

function cardHtml(c) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${fontFace}
    *{margin:0;box-sizing:border-box}
    body{width:1080px;height:1080px;overflow:hidden;color:${FG};position:relative;
      font-family:'General',system-ui,sans-serif;
      background:radial-gradient(125% 125% at 24% 14%, #18120d 0%, ${BG} 55%);}
    .grain{position:absolute;inset:0;opacity:.06;mix-blend-mode:overlay;background-image:url("${GRAIN}")}
    .wm{position:absolute;right:-130px;bottom:-150px;width:780px;height:780px;opacity:.045}
    .wrap{position:relative;width:100%;height:100%;padding:110px;display:flex;flex-direction:column;justify-content:space-between}
    .top{display:flex;align-items:center;justify-content:space-between}
    .mark{width:62px;height:62px}
    .eyebrow{font-weight:500;font-size:22px;letter-spacing:.26em;text-transform:uppercase;color:${MUTED}}
    .body{max-width:880px}
    .rule{width:54px;height:4px;background:${ACCENT};border-radius:2px;margin-bottom:40px}
    .quote{font-family:'Clash',system-ui,sans-serif;font-weight:600;font-size:76px;line-height:1.12;letter-spacing:-0.02em;color:${FG}}
    .quote .a{color:${ACCENT}}
  </style></head><body>
    <div class="grain"></div>
    <svg class="wm" viewBox="0 0 451 451" fill="${FG}"><path d="${MARK}"/></svg>
    <div class="wrap">
      <div class="top">
        <svg class="mark" viewBox="0 0 451 451" fill="${ACCENT}"><path d="${MARK}"/></svg>
        <span class="eyebrow">${c.eyebrow}</span>
      </div>
      <div class="body">
        <div class="rule"></div>
        <h1 class="quote">${c.quoteHtml}</h1>
      </div>
    </div>
  </body></html>`;
}

async function run() {
  const cfg = { ...DEFAULT, ...(process.argv[2] ? JSON.parse(process.argv[2]) : {}) };
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });
  await page.setContent(cardHtml(cfg), { waitUntil: "load", timeout: 15000 });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
  const buf = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 1080, height: 1080 } });
  const outDir = resolve(ROOT, "public/post-cards");
  mkdirSync(outDir, { recursive: true });
  const out = resolve(outDir, `${cfg.slug}.png`);
  writeFileSync(out, buf);
  console.log("✓", `public/post-cards/${cfg.slug}.png`);
  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
