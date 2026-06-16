import localFont from "next/font/local";

// Clash Display + General Sans — Fontshare (free for commercial use), self-hosted.
export const clashDisplay = localFont({
  src: [
    { path: "../../public/fonts/clash-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/clash-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/clash-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

export const generalSans = localFont({
  src: [
    { path: "../../public/fonts/general-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/general-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/general-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});
