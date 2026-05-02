import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface AssignmentFormProps {
  subject: string;
  setSubject: (v: string) => void;
  topic: string;
  setTopic: (v: string) => void;
  count: string;
  setCount: (v: string) => void;
}

export const AssignmentForm = ({
  subject,
  setSubject,
  topic,
  setTopic,
  count,
  setCount,
}: AssignmentFormProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      key="assignment"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("subject_label")}</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { key: "Math", label: t("subject_math") },
            { key: "Biology", label: t("subject_biology") },
            { key: "History", label: t("subject_history") },
            { key: "Physics", label: t("subject_physics") },
            { key: "Chemistry", label: t("subject_chemistry") },
            { key: "English", label: t("subject_english") },
            { key: "Geography", label: t("subject_geography") },
            { key: "Literature", label: t("subject_literature") },
            { key: "General", label: t("subject_general") }
          ].map((s) => (
            <button key={s.key} onClick={() => setSubject(s.key)}
              className={`py-2 px-2 text-xs font-sans rounded-lg border transition-all ${subject === s.key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"}`}>
              {s.label}
            </button>
          ))}
        </div>
        <Input
          placeholder={t("subject_placeholder")}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-10 rounded-xl font-sans mt-1"
        />
      </div>
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
          max="20"
          placeholder="5"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="h-11 rounded-xl font-sans"
        />
      </div>
    </motion.div>
  );
};
