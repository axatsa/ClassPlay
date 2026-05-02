import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { 
  Download, FileText, ArrowUpRight, ArrowDownRight, 
  ChevronDown, ChevronUp 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: `🟢 ${t("admin_status_active")}`, cls: "bg-success/15 text-success border-0" },
    expiring: { label: `🟡 ${t("admin_status_expiring")}`, cls: "bg-yellow-500/15 text-yellow-600 border-0" },
    expired: { label: `🔴 ${t("admin_status_expired")}`, cls: "bg-destructive/15 text-destructive border-0" },
    blocked: { label: `⛔ ${t("admin_status_blocked")}`, cls: "bg-foreground/10 text-muted-foreground border-0" },
    paid: { label: `✅ ${t("adminStatusPaid")}`, cls: "bg-success/15 text-success border-0" },
    pending: { label: `⏳ ${t("adminStatusPending")}`, cls: "bg-yellow-500/15 text-yellow-600 border-0" },
    failed: { label: `❌ ${t("adminStatusFailed")}`, cls: "bg-destructive/15 text-destructive border-0" },
  };
  const s = map[status] ?? { label: status, cls: "" };
  return <Badge className={`font-sans rounded-full px-3 ${s.cls}`}>{s.label}</Badge>;
};

export const PlanBadge = ({ plan, expiresAt }: { plan: string; expiresAt: string | null }) => {
  const colors: Record<string, string> = {
    FREE: "bg-muted text-muted-foreground",
    PRO: "bg-blue-500/10 text-blue-600",
    SCHOOL: "bg-purple-500/10 text-purple-600"
  };
  const daysLeft = expiresAt ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000) : null;
  return (
    <div className="flex flex-col gap-1">
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${colors[plan] || colors.FREE}`}>
        {plan}
      </span>
      {daysLeft !== null && (
        <span className={`text-[10px] ${daysLeft < 7 ? "text-destructive" : "text-muted-foreground"}`}>
          {daysLeft > 0 ? `${daysLeft}д.` : "Истёк"}
        </span>
      )}
    </div>
  );
};

export const PieChart = ({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="text-center text-muted-foreground text-sm">Нет данных</div>;

  let currentAngle = -90;
  const slices = data.map((d, i) => {
    const percentage = (d.value / total) * 100;
    const sliceAngle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 50 + 45 * Math.cos(startRad);
    const y1 = 50 + 45 * Math.sin(startRad);
    const x2 = 50 + 45 * Math.cos(endRad);
    const y2 = 50 + 45 * Math.sin(endRad);
    const largeArc = sliceAngle > 180 ? 1 : 0;

    return (
      <path
        key={i}
        d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={colors[i]}
        stroke="white"
        strokeWidth="2"
      />
    );
  });

  return (
    <div className="flex gap-6 items-center">
      <svg width="200" height="200" viewBox="0 0 100 100">
        {slices}
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i] }} />
            <span className="text-muted-foreground">{d.label}: <span className="font-bold text-foreground">{d.value}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MetricCard = ({
  icon: Icon, label, value, sub,
  trend, color,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string;
  trend?: "up" | "down"; color: string;
}) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-sans uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {sub && (
          <p className="text-xs text-muted-foreground font-sans mt-0.5 flex items-center gap-1">
            {trend === "up"
              ? <ArrowUpRight className="w-3 h-3 text-success" />
              : trend === "down"
                ? <ArrowDownRight className="w-3 h-3 text-destructive" />
                : null}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
};

export interface ChartDatum { day: string; tokens: number; cost?: number }
export const BarChart = ({ data }: { data: ChartDatum[] }) => {
  const max = Math.max(...data.map(d => d.tokens || 0)) || 1;
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground font-sans">{d.tokens?.toLocaleString()}</span>
          <div
            className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-all cursor-default"
            style={{ height: `${((d.tokens || 0) / max) * 100}%` }}
          />
          <span className="text-xs text-muted-foreground font-sans">{d.day}</span>
        </div>
      ))}
    </div>
  );
};

export const MrrChart = ({ data }: { data: { month: string; mrr: number }[] }) => {
  const max = Math.max(...data.map(d => d.mrr)) || 1;
  return (
    <div className="flex items-end gap-3 h-36">
      {data.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground font-sans">${d.mrr}</span>
          <div
            className={`w-full rounded-t-lg transition-all cursor-default ${i === data.length - 1 ? "bg-success" : "bg-success/40 hover:bg-success/70"
              }`}
            style={{ height: `${(d.mrr / max) * 100}%` }}
          />
          <span className="text-xs text-muted-foreground font-sans">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

export const ExportMenu = ({ onCSV, onPDF }: { onCSV: () => void; onPDF: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 font-sans rounded-xl h-8 text-xs"
        onClick={() => setOpen(o => !o)}
      >
        <Download className="w-3 h-3" /> Экспорт
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-9 z-50 bg-card border border-border rounded-xl shadow-lg p-1.5 min-w-[140px]"
          >
            <button
              onClick={() => { onCSV(); setOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-sans hover:bg-muted transition-colors flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-success" /> Скачать CSV
            </button>
            <button
              onClick={() => { onPDF(); setOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-sans hover:bg-muted transition-colors flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-destructive" /> Скачать DOCX
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
