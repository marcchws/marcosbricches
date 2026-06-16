import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { clashDisplay, generalSans } from "@/lib/fonts";
import { SITE, SITE_URL, BRAND } from "@/lib/site";
import { SmoothScroll } from "@/components/SmoothScroll";
import "../globals.css";
import "../sections.css";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: BRAND.bg,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const isPt = locale === "pt";

  const title = t("title");
  const description = t("description");
  const path = isPt ? "/" : "/en";
  // ?v bumps when the OG art changes — forces social platforms to refetch
  const ogImage = isPt ? "/og.png?v=3" : "/og-en.png?v=3";

  const keywords = isPt
    ? [
        "Marcos Bricches",
        "harness engineering",
        "Claude Code",
        "engenharia de contexto",
        "agentes de IA",
        "design de produto",
        "Devio",
      ]
    : [
        "Marcos Bricches",
        "harness engineering",
        "Claude Code",
        "context engineering",
        "AI agents",
        "product design",
        "Devio",
      ];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s — ${SITE.name}`,
    },
    description,
    applicationName: SITE.name,
    authors: [{ name: SITE.name, url: "https://www.linkedin.com/in/marcosbricches/" }],
    creator: SITE.name,
    publisher: SITE.name,
    keywords,
    alternates: {
      canonical: path,
      languages: {
        "pt-BR": "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title,
      description,
      url: path,
      locale: isPt ? "pt_BR" : "en_US",
      alternateLocale: isPt ? "en_US" : "pt_BR",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: SITE.twitter,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "a11y" });

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: SITE_URL,
    jobTitle: "AI Engineer",
    sameAs: [
      "https://www.linkedin.com/in/marcosbricches/",
      "https://github.com/marcchws",
      "https://www.behance.net/marcosbricches",
    ],
  };

  return (
    <html
      lang={locale === "pt" ? "pt-BR" : "en"}
      className={`${clashDisplay.variable} ${generalSans.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
        />
        <a className="skip-link" href="#main-content">
          {t("skip")}
        </a>
        <svg className="grain" aria-hidden="true">
          <filter id="grain-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="2"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-noise)" />
        </svg>
        <NextIntlClientProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
