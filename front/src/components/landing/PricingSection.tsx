import { useNavigate } from "react-router-dom";
import { Coins, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function PricingSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-secondary/20 text-amber-700 border border-secondary/30 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <Coins className="w-3.5 h-3.5" />
          {t("land_pricing_badge")}
        </div>
        <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
          {t("land_pricing_title")}
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {t("land_pricing_sub")}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 items-start">
        {/* Free */}
        <div className="bg-card rounded-3xl border border-border p-8 space-y-6">
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">{t("land_p1_title")}</div>
            <div className="flex items-end gap-1.5">
              <span className="text-5xl font-black font-serif text-foreground">{t("land_p1_price")}</span>
              <span className="text-sm text-muted-foreground pb-2">{t("land_per_month")}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{t("land_p1_tagline")}</p>
          </div>
          <ul className="space-y-3">
            {[t("land_p1_fi1"), t("land_p1_fi2"), t("land_p1_fi3"), t("land_p1_fi4")].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground/80">{f}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full rounded-2xl" onClick={() => navigate("/checkout?plan=free")}>
            {t("land_p1_cta")}
          </Button>
        </div>

        {/* Pro */}
        <div className="bg-sidebar rounded-3xl border border-sidebar-primary/30 p-8 space-y-6 shadow-2xl scale-[1.02] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
          <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            {t("land_popular")}
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-sidebar-primary mb-1">{t("land_p2_title")}</div>
            <div className="flex items-end gap-1.5">
              <span className="text-5xl font-black font-serif text-sidebar-foreground">{t("land_p2_price")}</span>
              <span className="text-sm text-sidebar-foreground/50 pb-2">{t("land_per_month")}</span>
            </div>
            <p className="text-sm text-sidebar-foreground/60 mt-2">{t("land_p2_tagline")}</p>
          </div>
          <ul className="space-y-3">
            {[t("land_p2_fi1"), t("land_p2_fi2"), t("land_p2_fi3"), t("land_p2_fi4"), t("land_p2_fi5")].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-sidebar-primary" />
                </div>
                <span className="text-sidebar-foreground/80">{f}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full rounded-2xl bg-sidebar-primary hover:bg-sidebar-primary/90" onClick={() => navigate("/checkout?plan=pro")}>
            {t("land_p2_cta")}
          </Button>
        </div>

        {/* School */}
        <div className="bg-card rounded-3xl border border-border p-8 space-y-6">
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">{t("land_p3_title")}</div>
            <div className="flex items-end gap-1.5">
              <span className="text-5xl font-black font-serif text-foreground">{t("land_p3_price")}</span>
              <span className="text-sm text-muted-foreground pb-2">{t("land_per_month")}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{t("land_p3_tagline")}</p>
          </div>
          <ul className="space-y-3">
            {[t("land_p3_fi1"), t("land_p3_fi2"), t("land_p3_fi3"), t("land_p3_fi4"), t("land_p3_fi5")].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground/80">{f}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full rounded-2xl border-primary/30 text-primary hover:bg-primary/5" onClick={() => navigate("/checkout?plan=school")}>
            {t("land_p3_cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
