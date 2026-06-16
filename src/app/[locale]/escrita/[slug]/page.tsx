import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { posts } from "@velite";
import { Link } from "@/i18n/navigation";
import { EscritaHeader } from "@/components/EscritaHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MDXContent } from "@/components/MDXContent";
import { SITE, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ locale: string; slug: string }> };

const postPath = (locale: string, slug: string) =>
  `${locale === "pt" ? "" : "/en"}/escrita/${slug}`;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = posts.find((p) => p.slug === slug && p.lang === locale);
  if (!post) return {};
  const path = postPath(locale, slug);

  // Link only the language versions that actually exist for this slug.
  const langs = posts.filter((p) => p.slug === slug);
  const languages: Record<string, string> = {};
  for (const p of langs) {
    languages[p.lang === "pt" ? "pt-BR" : "en"] = postPath(p.lang, slug);
  }
  if (languages["pt-BR"]) languages["x-default"] = languages["pt-BR"];

  // Per-post brand card pre-rendered via scripts/gen-og.mjs (real Clash fonts).
  const ogImage = `/og/${slug}${locale === "en" ? ".en" : ""}.png?v=2`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: path, languages },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: path,
      publishedTime: post.date,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = posts.find((p) => p.slug === slug && p.lang === locale);
  if (!post) notFound();
  const t = await getTranslations("escrita");
  const fmt = new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const url = `${SITE_URL}${postPath(locale, slug)}`;
  const ogImage = `${SITE_URL}${locale === "pt" ? "/og.png" : "/og-en.png"}`;
  const postSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: locale === "pt" ? "pt-BR" : "en",
    image: ogImage,
    mainEntityOfPage: url,
    author: { "@type": "Person", name: SITE.name, url: SITE_URL },
    publisher: { "@type": "Person", name: SITE.name, url: SITE_URL },
  };
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
        item: `${SITE_URL}${locale === "pt" ? "/escrita" : "/en/escrita"}`,
      },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <EscritaHeader />
      <main id="main-content" className="escrita-main">
        <article className="container post">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="post-title">{post.title}</h1>
          <time className="post-meta" dateTime={post.date}>
            {fmt.format(new Date(post.date))}
          </time>
          <div className="prose">
            <MDXContent code={post.body} />
          </div>
          <Link href="/escrita" className="post-back">
            ← {t("all")}
          </Link>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
