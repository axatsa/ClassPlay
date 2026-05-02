import { Users, Gamepad2, BrainCircuit, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";

const STATS_CONFIG = [
  { icon: Users, key: 0 },
  { icon: Gamepad2, key: 1 },
  { icon: BrainCircuit, key: 2 },
  { icon: Layers, key: 3 },
];

export default function StatsSection() {
  const { t } = useTranslation();
  const STATS = STATS_CONFIG.map(config => ({
    ...config,
    value: t(`land_stats_${config.key}_value`),
    label: t(`land_stats_${config.key}_label`),
  }));

  return (
    <div className="border-y border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 py-2">
            <span className="text-3xl font-black font-serif text-primary">{s.value}</span>
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <s.icon className="w-3 h-3" /> {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
