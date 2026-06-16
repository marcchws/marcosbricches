import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";

export async function EscritaHeader() {
  const t = await getTranslations("escrita");
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="Marcos Bricches">
          <Logo size={22} />
          <span className="brand-name">marcos bricches</span>
        </Link>
        <Link className="escrita-back" href="/">
          {t("back")}
        </Link>
      </div>
    </header>
  );
}
