import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface MathFormProps {
  topic: string;
  setTopic: (v: string) => void;
  count: string;
  setCount: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
}

export const MathForm = ({
  topic,
  setTopic,
  count,
  setCount,
  difficulty,
  setDifficulty,
}: MathFormProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      key="math"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="space-y-5"
    >
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
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("genCount")} (10–30)</Label>
        <Input
          type="number"
          min="10"
          max="30"
          placeholder="15"
          value={count}
          onChange={(e) => {
            const v = Math.min(30, Math.max(10, parseInt(e.target.value) || 10));
            setCount(String(v));
          }}
          className="h-11 rounded-xl font-sans"
        />
      </div>

      <SegmentedControl
        label={t("genDiff")}
        options={[t("genDiffEasy"), t("genDiffMed"), t("genDiffHard")]}
        value={difficulty === "Easy" ? t("genDiffEasy") : difficulty === "Hard" ? t("genDiffHard") : t("genDiffMed")}
        onChange={(v) => {
          const diffMap: any = { [t("genDiffEasy")]: "Easy", [t("genDiffMed")]: "Medium", [t("genDiffHard")]: "Hard" };
          setDifficulty(diffMap[v]);
        }}
        segId="difficulty"
      />
    </motion.div>
  );
};
