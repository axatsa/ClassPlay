import { useNavigate } from "react-router-dom";
import { Trophy, Users, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function CtaSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="bg-primary rounded-3xl p-12 md:p-16 text-center text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.08]">
          <Trophy className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Users className="w-3.5 h-3.5" />
            {t("land_cta_users_badge")}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-serif mb-5 leading-tight">
            {t("land_cta_title")}
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
            {t("land_cta_sub")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="rounded-2xl px-10 bg-white text-primary hover:bg-white/90 font-semibold gap-2"
              onClick={() => navigate("/login")}
            >
              {t("land_cta_register")} <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-2xl px-10 text-primary-foreground hover:bg-white/10 border border-white/20"
              onClick={() => navigate("/demo")}
            >
              <Play className="w-4 h-4 fill-current" /> {t("land_hero_demo")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-6 justify-center">
            {[t("land_trust_1"), t("land_trust_2"), t("land_trust_3")].map((item) => (
              <span key={item} className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <CheckCircle2 className="w-4 h-4 text-primary-foreground/40" /> {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
