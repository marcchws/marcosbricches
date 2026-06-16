import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Marcos Bricches — engenharia de sistemas de IA",
    short_name: "Marcos Bricches",
    description:
      "Como eu penso e trabalho com IA: de design a engenharia de sistemas.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: BRAND.bg,
    theme_color: BRAND.bg,
    lang: "pt-BR",
    dir: "ltr",
    categories: ["portfolio", "technology", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
