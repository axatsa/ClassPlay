import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface CrosswordFormProps {
  mode: "ai" | "custom";
  setMode: (v: "ai" | "custom") => void;
  topic: string;
  setTopic: (v: string) => void;
  count: string;
  setCount: (v: string) => void;
  customWordsText: string;
  setCustomWordsText: (v: string) => void;
}

export const CrosswordForm = ({
  mode,
  setMode,
  topic,
  setTopic,
  count,
  setCount,
  customWordsText,
  setCustomWordsText,
}: CrosswordFormProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      key="crossword"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-5"
    >
      <SegmentedControl
        label={t("genCrosswordMode")}
        options={["AI", t("custom_words") || "Свои слова"]}
        value={mode === "ai" ? "AI" : (t("custom_words") || "Свои слова")}
        onChange={(v) => setMode(v === "AI" ? "ai" : "custom")}
        segId="crossword-mode"
      />

      {mode === "ai" && (
        <>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("genTopic")}</Label>
            <Input
              placeholder={t("genTopicPlaceholder")}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="h-11 rounded-xl font-sans"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("genCount")}</Label>
            <Input
              type="number"
              min="5"
              max="20"
              placeholder="10"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="h-11 rounded-xl font-sans"
            />
          </div>
        </>
      )}

      {mode === "custom" && (
        <div className="space-y-2">
          <Textarea
            placeholder={"кот:домашнее животное\nсобака:друг человека\nрыба"}
            value={customWordsText}
            onChange={(e) => setCustomWordsText(e.target.value)}
            className="rounded-xl font-sans min-h-[140px] resize-y"
          />
          <p className="text-xs text-muted-foreground">{t("genCustomWordsHint")}</p>
        </div>
      )}
    </motion.div>
  );
};
