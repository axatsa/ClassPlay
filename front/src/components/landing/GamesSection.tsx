import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Gamepad2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const GAMES_NAMES = [
  { name: "Jeopardy", emoji: "🎯" },
  { name: "Memory Matrix", emoji: "🧠" },
  { name: "Word Search", emoji: "🔍" },
  { name: "Tug of War", emoji: "🏆" },
  { name: "Balance Scales", emoji: "⚖️" },
  { name: "Crossword", emoji: "✏️" },
];

export default function GamesSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const GAMES = GAMES_NAMES.map((game, idx) => ({
    ...game,
    desc: t(`land_games_${idx}_desc`),
    tag: t(`land_games_${idx}_tag`),
  }));

  return (
    <section id="games" className="bg-muted/30 border-y border-border py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Gamepad2 className="w-3.5 h-3.5" />
            {t("land_games_badge")}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
            {t("land_games_section_title")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t("land_games_section_sub")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {GAMES.map((game, i) => (
            <motion.button
              key={game.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              onClick={() => navigate("/login")}
              className="bg-card rounded-3xl border border-border p-5 flex flex-col items-center gap-3 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer text-center group"
            >
              <span className="text-4xl">{game.emoji}</span>
              <div>
                <p className="font-bold text-sm text-foreground">{game.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{game.desc}</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {game.tag}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="rounded-2xl px-8 gap-2" onClick={() => navigate("/login")}>
            {t("land_games_cta")} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
