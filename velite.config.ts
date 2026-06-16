import { defineConfig, s } from "velite";

export default defineConfig({
  root: "content",
  // assets must NOT default to public/static (Velite wipes it on clean, which
  // would delete our own public/static/profile.png). Use a Velite-owned dir.
  output: {
    data: ".velite",
    assets: "public/velite",
    base: "/velite/",
    clean: true,
  },
  collections: {
    posts: {
      name: "Post",
      pattern: "escrita/**/*.mdx",
      schema: s
        .object({
          title: s.string().max(140),
          description: s.string().max(320),
          date: s.isodate(),
          lang: s.enum(["pt", "en"]).default("pt"),
          path: s.path(),
          body: s.mdx(),
        })
        .transform((data) => {
          // path like "escrita/contexto-e-tudo" (PT) or "escrita/contexto-e-tudo.en"
          // (EN) -> same slug "contexto-e-tudo", lang from the .pt/.en suffix.
          const rel = data.path.replace(/^escrita\//, "");
          const m = rel.match(/^(.+)\.(pt|en)$/);
          return {
            ...data,
            slug: m ? m[1] : rel,
            lang: m ? (m[2] as "pt" | "en") : data.lang,
          };
        }),
    },
  },
});
