import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";

const NAV: Array<[string, string]> = [
  ["/#como-penso", "think"],
  ["/#trabalho", "work"],
  ["/#escrita", "writing"],
  ["/#sobre", "about"],
  ["/#contato", "cta"],
];

const SOCIAL: Array<[string, string]> = [
  ["https://www.linkedin.com/in/marcosbricches/", "LinkedIn"],
  ["https://github.com/marcchws", "GitHub"],
  ["https://www.behance.net/marcosbricches", "Behance"],
];

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-col">
          <Link href="/" className="footer-brandmark" aria-label="Marcos Bricches">
            <Logo size={26} />
            <span className="footer-name">marcos bricches</span>
          </Link>
          <p className="footer-tagline">{t("tagline")}</p>
        </div>

        <nav className="footer-col" aria-label={t("navTitle")}>
          <p className="footer-col-title">{t("navTitle")}</p>
          <ul>
            {NAV.map(([href, key]) => (
              <li key={href}>
                <Link href={href}>{tn(key)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-col">
          <p className="footer-col-title">{t("socialTitle")}</p>
          <ul>
            {SOCIAL.map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} (${t("newTab")})`}
                >
                  {label} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>{t("rights")}</span>
        <span>{t("location")}</span>
      </div>
    </footer>
  );
}
