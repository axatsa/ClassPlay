import { motion } from "framer-motion";
import { Sparkles, Gamepad2, BookOpen, BarChart3, Trophy, Shield, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const FEATURES_CONFIG = [
  { icon: Sparkles, colorClass: "text-primary", bg: "bg-primary/5 border-primary/10", iconBg: "bg-primary/10", key: 0 },
  { icon: Gamepad2, colorClass: "text-accent", bg: "bg-accent/5 border-accent/10", iconBg: "bg-accent/10", key: 1 },
  { icon: BookOpen, colorClass: "text-secondary", bg: "bg-secondary/10 border-secondary/20", iconBg: "bg-secondary/20", key: 2 },
  { icon: BarChart3, colorClass: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", iconBg: "bg-emerald-100", key: 3 },
  { icon: Trophy, colorClass: "text-primary", bg: "bg-primary/5 border-primary/10", iconBg: "bg-primary/10", key: 4 },
  { icon: Shield, colorClass: "text-sky-500", bg: "bg-sky-50 border-sky-100", iconBg: "bg-sky-100", key: 5 },
];

export default function FeaturesSection() {
  const { t } = useTranslation();
  const FEATURES = FEATURES_CONFIG.map(config => ({
    ...config,
    title: t(`land_features_${config.key}_title`),
    desc: t(`land_features_${config.key}_desc`),
  }));

  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-24">
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <Star className="w-3.5 h-3.5 fill-current" />
          {t("land_features_badge")}
        </div>
        <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4 max-w-lg">
          {t("land_features_section_title")}
        </h2>
        <p className="text-muted-foreground max-w-xl">
          {t("land_features_section_sub")}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-3xl border p-6 space-y-4 ${f.bg}`}
          >
            <div className={`w-11 h-11 rounded-2xl ${f.iconBg} flex items-center justify-center`}>
              <f.icon className={`w-5 h-5 ${f.colorClass}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
