"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Grid items reveal together with a stagger; everything else reveals per-element.
const GRID = ".method-item, .domain-card";
const SINGLES =
  ".section-head, .about-body p, .writing-empty, .contact-inner > *";
const EASE = "power3.out";

export function ScrollReveals() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const grid = gsap.utils.toArray<HTMLElement>(GRID);
    const singles = gsap.utils.toArray<HTMLElement>(SINGLES);

    if (reduce) {
      gsap.set([...grid, ...singles], { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set([...grid, ...singles], { opacity: 0, y: 26 });

      ScrollTrigger.batch(GRID, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: EASE,
            stagger: 0.09,
            overwrite: true,
          }),
      });

      singles.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: EASE,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return null;
}
