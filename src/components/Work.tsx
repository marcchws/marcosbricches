import { getTranslations } from "next-intl/server";

type Mechanic = {
  name: string;
  body: string;
};

export async function Work() {
  const t = await getTranslations("work");
  const items = t.raw("items") as Mechanic[];

  return (
    <section id="trabalho" className="section domains" aria-labelledby="work-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="work-title" className="section-title">
            <span className="title-lead">{t("titleLead")}</span>{" "}
            <span className="title-key">{t("titleKey")}</span>
          </h2>
          <p className="section-lead">{t("lead")}</p>
        </div>
        <div className="domains-grid">
          {items.map((item) => (
            <article key={item.name} className="domain-card">
              <h3 className="domain-name">{item.name}</h3>
              <p className="domain-body">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
