// Per-post OG cards (1200x630) rendered through real Chrome, so the brand fonts
// (Clash Display + General Sans, woff2) and the M+S monogram are pixel-faithful.
// Satori (next/og) can't load woff2, hence this pre-render step instead.
//
// Layout is a CENTERED SQUARE CORE: the full 1200x630 unfurl shows everything,
// and a center-square crop (small previews) still lands on the monogram + title.
//   Output: public/og/<slug>.png (PT), public/og/<slug>.en.png (EN)
// Run: node scripts/gen-og.mjs
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

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function ogHtml(title, kicker) {
  // Centered core ~620px wide so a center-square crop captures the whole stack.
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  ${fontFace}
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;overflow:hidden;background:${BG};
    display:flex;align-items:center;justify-content:center;
    font-family:'General',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  /* warm vignette, calm center for the type */
  .bg{position:absolute;inset:0;background:
    radial-gradient(120% 130% at 50% 18%, rgba(229,161,75,0.10) 0%, rgba(16,9,8,0) 55%);}
  .core{position:relative;width:660px;display:flex;flex-direction:column;
    align-items:center;text-align:center;gap:30px;padding:0 20px}
  .mark{width:86px;height:86px;filter:drop-shadow(0 8px 24px rgba(0,0,0,0.45))}
  .kicker{font-family:'General';font-weight:500;font-size:22px;letter-spacing:.34em;
    text-transform:uppercase;color:${ACCENT}}
  .title{font-family:'Clash';font-weight:600;font-size:54px;line-height:1.12;
    letter-spacing:-0.02em;color:${FG};max-width:620px}
  .name{display:flex;align-items:center;gap:14px;font-size:24px;color:${MUTED};margin-top:6px}
  .tick{width:12px;height:12px;background:${ACCENT}}
  </style></head><body>
    <div class="bg"></div>
    <div class="core">
      <svg class="mark" viewBox="0 0 451 451" fill="${ACCENT}"><path d="${MARK}"/></svg>
      <div class="kicker">${esc(kicker)}</div>
      <div class="title">${esc(title)}</div>
      <div class="name"><span class="tick"></span>Marcos Bricches</div>
    </div>
  </body></html>`;
}

async function run() {
  const posts = JSON.parse(readFileSync(resolve(ROOT, ".velite/posts.json"), "utf8"));
  mkdirSync(resolve(ROOT, "public/og"), { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  for (const post of posts) {
    const kicker = post.lang === "en" ? "WRITING" : "ESCRITA";
    await page.setContent(ogHtml(post.title, kicker), { waitUntil: "load" });
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
    });
    const buf = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });
    const out = `public/og/${post.slug}${post.lang === "en" ? ".en" : ""}.png`;
    writeFileSync(resolve(ROOT, out), buf);
    console.log("✓", out, `(${(buf.length / 1024).toFixed(0)}KB)`);
  }

  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
