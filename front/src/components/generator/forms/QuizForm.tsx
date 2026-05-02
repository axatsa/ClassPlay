import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface QuizFormProps {
  topic: string;
  setTopic: (v: string) => void;
  count: string;
  setCount: (v: string) => void;
}

export const QuizForm = ({
  topic,
  setTopic,
  count,
  setCount,
}: QuizFormProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      key="quiz"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
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
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("genCount")}</Label>
        <Input
          type="number"
          min="1"
          max="15"
          placeholder="5"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="h-11 rounded-xl font-sans"
        />
      </div>
    </motion.div>
  );
};
