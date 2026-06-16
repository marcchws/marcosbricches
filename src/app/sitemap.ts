import type { MetadataRoute } from "next";
import { posts } from "@velite";
import { SITE_URL } from "@/lib/site";

const abs = (path: string) => `${SITE_URL}${path}`;

// pt served at "/", en at "/en". Each entry lists both language versions.
export default function sitemap(): MetadataRoute.Sitemap {
  const home = {
    "pt-BR": abs("/"),
    en: abs("/en"),
  };
  const writing = {
    "pt-BR": abs("/escrita"),
    en: abs("/en/escrita"),
  };

  const entries: MetadataRoute.Sitemap = [
    { url: abs("/"), changeFrequency: "monthly", priority: 1, alternates: { languages: home } },
    { url: abs("/en"), changeFrequency: "monthly", priority: 0.9, alternates: { languages: home } },
    { url: abs("/escrita"), changeFrequency: "weekly", priority: 0.8, alternates: { languages: writing } },
    { url: abs("/en/escrita"), changeFrequency: "weekly", priority: 0.7, alternates: { languages: writing } },
  ];

  // One entry per (post, locale), each linking its language counterparts.
  const slugs = Array.from(new Set(posts.map((p) => p.slug)));
  for (const slug of slugs) {
    const langs = posts.filter((p) => p.slug === slug);
    const languages: Record<string, string> = {};
    for (const p of langs) {
      languages[p.lang === "pt" ? "pt-BR" : "en"] = abs(
        `${p.lang === "pt" ? "" : "/en"}/escrita/${slug}`,
      );
    }
    for (const p of langs) {
      entries.push({
        url: abs(`${p.lang === "pt" ? "" : "/en"}/escrita/${slug}`),
        lastModified: p.date,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages },
      });
    }
  }

  return entries;
}
