import { getTranslations } from "next-intl/server";

const LINKS = [
  { key: "linkedin", href: "https://www.linkedin.com/in/marcosbricches/" },
  { key: "github", href: "https://github.com/marcchws" },
  { key: "behance", href: "https://www.behance.net/marcosbricches" },
] as const;

export async function Contact() {
  const t = await getTranslations("contact");
  return (
    <section id="contato" className="section contact" aria-labelledby="contact-title">
      <div className="container contact-inner">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 id="contact-title" className="contact-title">
          <span className="title-lead">{t("titleLead")}</span>{" "}
          <span className="title-key">{t("titleKey")}</span>
        </h2>
        <p className="contact-body">{t("body")}</p>
        <ul className="contact-links">
          {LINKS.map(({ key, href }) => (
            <li key={key}>
              <a
                className="contact-link"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t(key)} (${t("newTab")})`}
              >
                {t(key)} <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
