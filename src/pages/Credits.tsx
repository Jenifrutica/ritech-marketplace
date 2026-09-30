import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { PageHeader, Photo } from "@/components/common/Page";
import { imageCredits } from "@/data/imageCredits";
import { useI18n } from "@/i18n/I18nProvider";

export function Credits() {
  const { t, lang } = useI18n();
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
      <PageHeader title={t("credits.title")} lead={t("credits.lead")} />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {imageCredits.map((c) => (
          <li key={c.id}>
            <Card className="h-full p-0">
              <Photo id={c.id} className="aspect-[4/3] w-full" />
              <div className="grid gap-1 p-4 text-[length:var(--fs-control)]">
                <p className="font-semibold">{c.alt[lang]}</p>
                <p className="text-[color:var(--v-text-2)]">
                  {t("credits.author")}: {c.author}
                </p>
                <p className="text-[color:var(--v-text-2)]">
                  {t("credits.license")}:{" "}
                  {c.licenseUrl ? (
                    <a className="rt-link rt-focus" href={c.licenseUrl} target="_blank" rel="noreferrer">
                      {c.license}
                    </a>
                  ) : (
                    c.license
                  )}
                </p>
                <a className="rt-link rt-focus mt-1 w-fit" href={c.source} target="_blank" rel="noreferrer">
                  {t("credits.source")} <span className="sr-only">: {c.file}</span>
                </a>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <Link to="/" className="rt-link rt-focus mt-10 inline-block font-medium">
        {t("credits.back")}
      </Link>
    </div>
  );
}

export function NotFound() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
      <PageHeader title={t("notFound.title")} lead={t("notFound.text")} />
      <Link to="/" className="rt-link rt-focus font-medium">
        {t("credits.back")}
      </Link>
    </div>
  );
}
