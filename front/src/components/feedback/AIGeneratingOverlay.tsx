import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  isGenerating: boolean;
  message?: string;
}

export function AIGeneratingOverlay({ isGenerating, message }: Props) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          key="ai-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full opacity-20"
                style={{
                  width: `${80 + i * 40}px`,
                  height: `${80 + i * 40}px`,
                  background: `hsl(${260 + i * 20}, 80%, 65%)`,
                  left: `${10 + (i * 17) % 80}%`,
                  top: `${15 + (i * 23) % 70}%`,
                }}
                animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], scale: [1, 1.15, 0.9, 1] }}
                transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6 text-center px-8">
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.15, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-violet-500 blur-xl"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
            </div>

            <div>
              <motion.h2
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl font-display font-bold text-foreground tracking-tight mb-2"
              >
                {message ?? t("ai_generating")}
              </motion.h2>
              <p className="text-muted-foreground font-sans text-base">{t("take_few_seconds")}</p>
            </div>

            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-violet-500"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
