import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play, Coins, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function HeroSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const previewStats = [
    { label: t("land_preview_daily_xp"), value: "320 / 500", icon: Sparkles, color: "text-primary" },
    { label: t("land_preview_coins_stat"), value: "60 / 100", icon: Coins, color: "text-secondary" },
    { label: t("land_preview_streak_stat"), value: `7 ${t("land_preview_days")}`, icon: Zap, color: "text-yellow-500" },
    { label: t("land_preview_rank_stat"), value: `#3 ${t("land_preview_in_class")}`, icon: Trophy, color: "text-primary" },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {t("land_platform_badge")}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-foreground font-serif leading-tight tracking-tight mb-6 max-w-4xl mx-auto"
        >
          {t("land_hero_title1")}{" "}
          <span className="text-primary relative inline-block">
            {t("land_hero_title2")}
            <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 400 12" fill="none" preserveAspectRatio="none">
              <path d="M2 9 Q100 2 200 9 Q300 16 398 9" stroke="hsl(217 91% 60%)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
            </svg>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t("land_hero_sub")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" className="rounded-2xl px-8 gap-2 text-base" onClick={() => navigate("/login")}>
            {t("land_hero_cta")} <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" className="rounded-2xl px-8 gap-2 text-base border-border" onClick={() => navigate("/demo")}>
            <Play className="w-4 h-4 fill-current" /> {t("land_hero_demo")}
          </Button>
        </motion.div>

        <p className="mt-4 text-xs text-muted-foreground">{t("land_hero_note")}</p>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-16 bg-card rounded-3xl border border-border shadow-xl p-6 md:p-8 text-left max-w-4xl mx-auto relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-10 opacity-[0.04]">
            <Trophy className="w-64 h-64 text-primary" />
          </div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h2 className="text-2xl font-bold font-serif text-foreground">{t("land_preview_welcome")}</h2>
              <p className="text-muted-foreground text-sm mt-0.5">{t("land_preview_streak_msg")}</p>
            </div>
            <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2 flex items-center gap-2 text-sm font-semibold shrink-0">
              <Coins className="w-4 h-4" /> 480 {t("land_preview_coins_label")}
            </div>
          </div>

          <div className="flex items-center gap-6 mb-6 relative z-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center shrink-0 relative">
              <span className="text-2xl font-black text-primary font-serif">8</span>
              <div className="absolute -bottom-2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                {t("land_preview_level_abbr")}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-primary">1 840 XP</span>
                <span className="text-muted-foreground">240 XP {t("land_preview_xp_to")} 9</span>
              </div>
              <div className="h-4 rounded-full bg-secondary/20 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: "76%" }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
            {previewStats.map((s) => (
              <div key={s.label} className="bg-muted/50 rounded-2xl border border-border p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                </div>
                <p className="font-black font-serif text-lg text-foreground">{s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
