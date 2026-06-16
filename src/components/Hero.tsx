"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Decorative WebGL background: not on the LCP path, so load it after hydration
// (OGL is ~48KB gz). ssr:false keeps it out of the server bundle entirely.
const ShaderBackground = dynamic(
  () => import("./ShaderBackground").then((m) => m.ShaderBackground),
  { ssr: false },
);

gsap.registerPlugin(SplitText);

export function Hero() {
  const t = useTranslations("hero");
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      const split = new SplitText(".hero-title", { type: "lines", mask: "lines" });
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(split.lines, { yPercent: 115, duration: 1.1, stagger: 0.1 })
        .from(".hero-sub", { opacity: 0, y: 24, duration: 0.8 }, "-=0.6")
        .from(".hero-actions", { opacity: 0, y: 20, duration: 0.6 }, "-=0.5");

      // Single revert path: cleanup handles both unmount and StrictMode re-run.
      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section className="hero" id="top" ref={root}>
      <ShaderBackground />
      <div className="container hero-inner">
        <h1 className="hero-title">
          <span className="hl">{t("titleLead")}</span>
          <span className="hl hl-amber">{t("titleEm")}</span>
        </h1>
        <p className="hero-sub">{t("sub")}</p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#como-penso">
            {t("ctaPrimary")} <span aria-hidden="true">→</span>
          </a>
          <a className="btn btn-ghost" href="#escrita">
            {t("ctaGhost")}
          </a>
        </div>
      </div>
    </section>
  );
}
