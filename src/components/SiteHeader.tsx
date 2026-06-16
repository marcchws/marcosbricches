"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Logo } from "./Logo";

export function SiteHeader() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const links: Array<[string, string]> = [
    ["#como-penso", t("think")],
    ["#trabalho", t("work")],
    ["#escrita", t("writing")],
    ["#sobre", t("about")],
  ];

  const close = () => setOpen(false);

  // Mobile menu: move focus in, trap Tab within [toggle + overlay links], close
  // on Esc, make the rest of the page (and the brand link behind) inert so
  // keyboard/AT focus can't leak, and return focus to the toggle on close.
  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();

    const overlay = document.getElementById("mobile-menu");
    const toggle = document.querySelector<HTMLElement>(".nav-toggle");
    const focusables = (): HTMLElement[] =>
      [toggle, ...Array.from(overlay?.querySelectorAll<HTMLElement>("a") ?? [])].filter(
        (el): el is HTMLElement => el !== null,
      );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    const behind = Array.from(document.querySelectorAll("main, footer"));
    const brand = document.querySelector(".site-header .brand");
    behind.forEach((el) => el.setAttribute("inert", ""));
    brand?.setAttribute("inert", "");

    return () => {
      document.removeEventListener("keydown", onKey);
      behind.forEach((el) => el.removeAttribute("inert"));
      brand?.removeAttribute("inert");
      toggle?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
        <a className="brand" href="#top" aria-label="Marcos Bricches" onClick={close}>
          <Logo size={22} />
          <span className="brand-name">marcos bricches</span>
        </a>

        <nav className="nav-desktop" aria-label={t("navPrimary")}>
          {links.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
          <a className="nav-cta" href="#contato">
            {t("cta")}
          </a>
        </nav>

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`nav-overlay${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
        onClick={close}
      >
        <nav className="nav-mobile" aria-label={t("navPrimary")}>
          {links.map(([href, label], idx) => (
            <a
              key={href}
              href={href}
              onClick={close}
              ref={idx === 0 ? firstLinkRef : undefined}
            >
              {label}
            </a>
          ))}
          <a className="nav-cta" href="#contato" onClick={close}>
            {t("cta")}
          </a>
        </nav>
      </div>
    </>
  );
}
