import { getTranslations } from "next-intl/server";

type Thesis = {
  title: string;
  body: string;
};

export async function Principles() {
  const t = await getTranslations("think");
  const items = t.raw("items") as Thesis[];

  return (
    <section id="como-penso" className="section method" aria-labelledby="think-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="think-title" className="section-title title-stack">
            <span className="title-lead">{t("titleLead")}</span>{" "}
            <span className="title-key">{t("titleKey")}</span>
          </h2>
          <p className="section-lead">{t("lead")}</p>
        </div>
        <ol className="method-grid">
          {items.map((item, i) => (
            <li key={item.title} className="method-item">
              <span className="method-num">{`0${i + 1}`}</span>
              <h3 className="method-item-title">{item.title}</h3>
              <p className="method-item-body">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
