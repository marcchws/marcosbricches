import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function About() {
  const t = await getTranslations("about");
  const paragraphs = t.raw("body") as string[];

  return (
    <section id="sobre" className="section about" aria-labelledby="about-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="about-title" className="section-title title-stack">
            <span className="title-lead">{t("titleLead")}</span>{" "}
            <span className="title-key">{t("titleKey")}</span>
          </h2>
        </div>
        <div className="about-grid">
          <figure className="about-portrait">
            <Image
              src="/static/profile.webp"
              alt={t("photoAlt")}
              width={1000}
              height={1000}
              sizes="(max-width: 820px) 70vw, 22rem"
            />
          </figure>
          <div className="about-body">
            {paragraphs.map((p, i) => (
              <p
                key={p.slice(0, 40)}
                className={i === paragraphs.length - 1 ? "about-kicker" : undefined}
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
