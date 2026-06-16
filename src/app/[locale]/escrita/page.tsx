import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { posts } from "@velite";
import { Link } from "@/i18n/navigation";
import { EscritaHeader } from "@/components/EscritaHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

const pathFor = (locale: string) => (locale === "pt" ? "/escrita" : "/en/escrita");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "escrita" });
  return {
    title: t("metaTitle"),
    description: t("lead"),
    alternates: {
      canonical: pathFor(locale),
      languages: {
        "pt-BR": "/escrita",
        en: "/en/escrita",
        "x-default": "/escrita",
      },
    },
  };
}

export default async function WritingIndex({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("escrita");
  const list = posts
    .filter((p) => p.lang === locale)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const fmt = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE.name,
        item: `${SITE_URL}${locale === "pt" ? "/" : "/en"}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("eyebrow"),
        item: `${SITE_URL}${pathFor(locale)}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <EscritaHeader />
      <main id="main-content" className="escrita-main">
        <div className="container">
          <header className="section-head escrita-head">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1 className="section-title title-stack">
              <span className="title-lead">{t("titleLead")}</span>{" "}
              <span className="title-key">{t("titleKey")}</span>
            </h1>
            <p className="section-lead">{t("lead")}</p>
          </header>

          {list.length === 0 ? (
            <p className="writing-empty">{t("empty")}</p>
          ) : (
            <ul className="post-list">
              {list.map((post) => (
                <li key={post.slug}>
                  <article className="post-row">
                    <time className="post-date" dateTime={post.date}>
                      {fmt.format(new Date(post.date))}
                    </time>
                    <h2 className="post-row-title">
                      <Link href={`/escrita/${post.slug}`} className="post-row-link">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="post-row-desc">{post.description}</p>
                    <span className="post-more">{t("readMore")} →</span>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
