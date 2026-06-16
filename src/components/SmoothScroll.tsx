"use client";

import { useEffect } from "react";
import type Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollProps = {
  children: React.ReactNode;
};

export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // No smooth scroll, but ScrollTrigger still drives reveals off native scroll.
      ScrollTrigger.refresh();
      return;
    }

    let lenis: Lenis | null = null;
    let cancelled = false;
    const update = (time: number) => lenis?.raf(time * 1000);

    // Defer the Lenis chunk off the critical path; children still SSR normally.
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(update);
      gsap.ticker.lagSmoothing(0);
    });

    return () => {
      cancelled = true;
      gsap.ticker.remove(update);
      gsap.ticker.lagSmoothing(500, 33);
      if (lenis) {
        lenis.off("scroll", ScrollTrigger.update);
        lenis.destroy();
      }
    };
  }, []);

  return <>{children}</>;
}
