// Single source of truth for site URL + brand constants used across
// metadata, manifest, sitemap, robots, and OG generation.

/**
 * Absolute production origin (no trailing slash).
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL — set this to the custom domain once it's live.
 *  2. VERCEL_PROJECT_PRODUCTION_URL — auto-injected by Vercel for the prod deploy.
 *  3. localhost — local dev fallback.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SITE = {
  name: "Marcos Bricches",
  twitter: "@marcosbricches",
  locales: { pt: "pt-BR", en: "en" },
} as const;

// Brand tokens (hex equivalents of the oklch tokens in globals.css).
export const BRAND = {
  bg: "#100908",
  bg2: "#17100c",
  bg3: "#1e1613",
  ink: "#e9e4de",
  muted: "#aaa39d",
  accent: "#e5a14b",
  line: "#2e2724",
} as const;
