import { getLocale, getTranslations } from "next-intl/server";
import { posts } from "@velite";
import { Link } from "@/i18n/navigation";

export async function Writing() {
  const t = await getTranslations("writing");
  const tb = await getTranslations("escrita");
  const locale = await getLocale();
  const list = posts
    .filter((p) => p.lang === locale)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);

  return (
    <section id="escrita" className="section writing" aria-labelledby="writing-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="writing-title" className="section-title title-stack">
            <span className="title-lead">{t("titleLead")}</span>{" "}
            <span className="title-key">{t("titleKey")}</span>
          </h2>
          <p className="section-lead">{t("lead")}</p>
        </div>

        {list.length === 0 ? (
          <p className="writing-empty">{t("empty")}</p>
        ) : (
          <>
            <ul className="post-list">
              {list.map((post) => (
                <li key={post.slug}>
                  <article className="post-row">
                    <h3 className="post-row-title">
                      <Link href={`/escrita/${post.slug}`} className="post-row-link">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="post-row-desc">{post.description}</p>
                    <span className="post-more">{tb("readMore")} →</span>
                  </article>
                </li>
              ))}
            </ul>
            <Link href="/escrita" className="writing-all">
              {tb("all")} →
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
