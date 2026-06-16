import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { Principles } from "@/components/Principles";
import { Work } from "@/components/Work";
import { Writing } from "@/components/Writing";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollReveals } from "@/components/ScrollReveals";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <Principles />
        <Work />
        <Writing />
        <About />
        <Contact />
      </main>
      <SiteFooter />
      <ScrollReveals />
    </>
  );
}
