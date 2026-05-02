import { motion } from "framer-motion";
import { Zap, Brain, Rocket, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

const STEPS_CONFIG = [
  { step: "01", icon: Zap, colorClass: "text-secondary", iconBg: "bg-secondary/20", key: 0 },
  { step: "02", icon: Brain, colorClass: "text-primary", iconBg: "bg-primary/10", key: 1 },
  { step: "03", icon: Rocket, colorClass: "text-accent", iconBg: "bg-accent/10", key: 2 },
];

export default function HowItWorksSection() {
  const { t } = useTranslation();
  const STEPS = STEPS_CONFIG.map(config => ({
    ...config,
    title: t(`land_steps_${config.key}_title`),
    desc: t(`land_steps_${config.key}_desc`),
  }));

  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-secondary/20 text-amber-700 border border-secondary/30 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          {t("land_how_badge")}
        </div>
        <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
          {t("land_how_title")}
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {t("land_how_sub")}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-3xl border border-border p-8 space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-4 right-6 text-6xl font-black font-serif text-muted/30 leading-none select-none">
              {s.step}
            </div>
            <div className={`w-12 h-12 rounded-2xl ${s.iconBg} flex items-center justify-center`}>
              <s.icon className={`w-6 h-6 ${s.colorClass}`} />
            </div>
            <h3 className="text-xl font-bold font-serif text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
