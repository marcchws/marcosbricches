// Generates all brand raster assets from the B+S monogram + brand tokens,
// rendered through real Chrome so woff2 fonts and oklch colors are pixel-faithful.
//   Icons  -> app/apple-icon.png, app/favicon.ico, public/icon-{192,512}.png, public/icon-maskable-512.png
//   OG     -> public/og.png (PT), public/og-en.png (EN)
// Run: node scripts/gen-assets.mjs
import puppeteer from "puppeteer-core";
import { readFileSync, writeFileSync } from "node:fs";
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

// Brand mark for icons + share image: white symbol on amber.
const WHITE = "#ffffff";
const INK_DARK = "#2e2008"; // deep warm ink for text on amber (high contrast)
const AMBER_LIGHT = "#f0b566";
const AMBER_DEEP = "#cf8a39";

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

function iconSvg(size, { rx = 0, scale = 0.6, bg = ACCENT, fg = FG }) {
  const target = size * scale;
  const s = target / 451;
  const off = (size - target) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${rx}" fill="${bg}"/>
    <g transform="translate(${off},${off}) scale(${s})" fill="${fg}"><path d="${MARK}"/></g>
  </svg>`;
}

// Just the white symbol centered on amber. No frame, no text — crops cleanly
// to a square thumbnail anywhere.
function ogHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;box-sizing:border-box}
    body{width:1200px;height:630px;overflow:hidden;display:flex;
      align-items:center;justify-content:center;
      background:radial-gradient(120% 130% at 50% 30%, ${AMBER_LIGHT} 0%, ${ACCENT} 50%, ${AMBER_DEEP} 100%);}
    .sym{width:260px;height:260px;filter:drop-shadow(0 12px 34px rgba(46,32,8,0.32))}
  </style></head><body>
    <svg class="sym" viewBox="0 0 451 451" fill="${FG}"><path d="${MARK}"/></svg>
  </body></html>`;
}

// Minimal ICO encoder wrapping PNG frames (Vista+ format).
function buildIco(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6 + 16 * count);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  let offset = 6 + 16 * count;
  const body = [];
  pngs.forEach((png, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(png.size >= 256 ? 0 : png.size, e);
    header.writeUInt8(png.size >= 256 ? 0 : png.size, e + 1);
    header.writeUInt8(0, e + 2);
    header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(png.buf.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += png.buf.length;
    body.push(png.buf);
  });
  return Buffer.concat([header, ...body]);
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();

  async function shot(html, w, h, transparent = false) {
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load", timeout: 15000 });
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
    });
    return page.screenshot({
      type: "png",
      omitBackground: transparent,
      clip: { x: 0, y: 0, width: w, height: h },
    });
  }
  const wrap = (svg, size) =>
    `<!doctype html><html><head><style>*{margin:0}body{width:${size}px;height:${size}px}</style></head><body>${svg}</body></html>`;

  const iconJob = async (svg, size, out) => {
    const buf = await shot(wrap(svg, size), size, size);
    writeFileSync(resolve(ROOT, out), buf);
    console.log("✓", out);
    return buf;
  };

  // Favicon.ico (16/32/48) — slightly rounded
  const icoFrames = [];
  for (const size of [16, 32, 48]) {
    const svg = iconSvg(size, { rx: Math.round(size * 0.22), scale: 0.62 });
    // transparent => RGBA PNG (Next's .ico decoder requires RGBA frames)
    const buf = await shot(wrap(svg, size), size, size, true);
    icoFrames.push({ size, buf });
  }
  writeFileSync(resolve(ROOT, "src/app/favicon.ico"), buildIco(icoFrames));
  console.log("✓ src/app/favicon.ico");

  // App + PWA icons (full-bleed square; launchers apply their own mask)
  await iconJob(iconSvg(180, { rx: 0, scale: 0.6 }), 180, "src/app/apple-icon.png");
  await iconJob(iconSvg(192, { rx: 0, scale: 0.62 }), 192, "public/icon-192.png");
  await iconJob(iconSvg(512, { rx: 0, scale: 0.62 }), 512, "public/icon-512.png");
  await iconJob(iconSvg(512, { rx: 0, scale: 0.42 }), 512, "public/icon-maskable-512.png");

  // OG / link preview — DESLIGADO de propósito.
  // Os OGs (public/og.png, og-en.png) são desenhados à mão (símbolo + marca-d'água de
  // fundo) e ficam fora deste gerador pra não serem sobrescritos por uma versão mais
  // simples. Reativar só se for substituir o design do OG por completo.
  // const og = await shot(ogHtml(), 1200, 630);
  // writeFileSync(resolve(ROOT, "public/og.png"), og);
  // writeFileSync(resolve(ROOT, "public/og-en.png"), og);

  await browser.close();
  console.log("\nAll brand assets generated.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
