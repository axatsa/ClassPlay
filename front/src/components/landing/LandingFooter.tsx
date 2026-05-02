import { useTranslation } from "react-i18next";

export default function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center overflow-hidden shrink-0">
            <img src="/logo_sticker.webp" alt="ClassPlay" className="w-full h-full object-contain" loading="lazy" />
          </div>
          <span className="font-bold font-serif text-foreground">ClassPlay</span>
        </div>
        <p className="text-sm text-muted-foreground">{t("land_foot_tagline")}</p>
        <div className="flex gap-5 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">{t("land_foot_comp3")}</a>
          <a href="#" className="hover:text-foreground transition-colors">{t("land_foot_comp4")}</a>
          <a href="#" className="hover:text-foreground transition-colors">{t("land_foot_contact")}</a>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="text-center text-xs text-muted-foreground py-4">{t("land_copy")}</p>
      </div>
    </footer>
  );
}
