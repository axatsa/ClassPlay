import React from "react";
import { useTranslation } from "react-i18next";
import { 
  Zap, DollarSign, Users, AlertTriangle, Wifi, WifiOff, Loader2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { MetricCard, StatusBadge, BarChart, ExportMenu } from "./shared/AdminShared";
import { Teacher } from "@/types/admin";
import { exportAiUsageCSV, exportAiUsageDOCX } from "@/lib/adminExport";

interface AiMonitoringProps {
  teachers: Teacher[];
  aiProvider: "gemini" | "openai";
  setAiProvider: (p: "gemini" | "openai") => void;
  toggleBlock: (id: number) => void;
  isLoading: boolean;
}

const generateDailyTokens = () => {
  const today = new Date();
  const days = Array.from({length: 7}, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { weekday: "short" });
  });

  return [
    { day: days[0], tokens: 2400, cost: 0.024 },
    { day: days[1], tokens: 1398, cost: 0.014 },
    { day: days[2], tokens: 9800, cost: 0.098 },
    { day: days[3], tokens: 3908, cost: 0.039 },
    { day: days[4], tokens: 4800, cost: 0.048 },
    { day: days[5], tokens: 3800, cost: 0.038 },
    { day: days[6], tokens: 4300, cost: 0.043 },
  ];
};

export const AiMonitoring: React.FC<AiMonitoringProps> = ({
  teachers, aiProvider, setAiProvider, toggleBlock, isLoading
}) => {
  const { t } = useTranslation();
  const dailyTokens = generateDailyTokens();
  const totalTokens = dailyTokens.reduce((s, d) => s + d.tokens, 0);
  const totalCost = dailyTokens.reduce((s, d) => s + d.cost, 0);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Zap} label="Токенов за неделю" value={totalTokens.toLocaleString()} sub="все учителя" color="bg-violet-500/10 text-violet-600" />
        <MetricCard icon={DollarSign} label="Расходы за неделю" value={`$${totalCost.toFixed(2)}`} sub={`≈ $${(totalCost / 7).toFixed(2)}/день`} color="bg-success/10 text-success" />
        <MetricCard icon={Users} label="Активных сессий" value="-" sub="недоступно" color="bg-primary/10 text-primary" />
        <MetricCard icon={AlertTriangle} label="Аномалий" value={String(teachers.filter(t_ => t_.tokenUsage > 10000).length)} sub="> 10k токенов" color="bg-destructive/10 text-destructive" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground mb-1">{t("admin_ai_switch")}</h3>
            <p className="text-sm text-muted-foreground font-sans">{t("admin_ai_switch_sub")}</p>
          </div>
          <div className="flex gap-3">
            {(["gemini", "openai"] as const).map(p => (
              <button
                key={p}
                onClick={() => setAiProvider(p)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 transition-all font-sans text-sm font-medium ${aiProvider === p
                  ? p === "gemini" ? "border-violet-500 bg-violet-500/10 text-violet-700" : "border-success bg-success/10 text-success"
                  : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
              >
                {aiProvider === p ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                {p === "gemini" ? "🟣 Gemini" : "🟢 OpenAI"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-4">График потребления токенов</h3>
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <BarChart data={dailyTokens} />
        )}
        <div className="mt-3 pt-3 border-t border-border flex gap-6">
          {dailyTokens.map(d => (
            <div key={d.day} className="text-center">
              <p className="text-xs text-muted-foreground font-sans">{d.day}</p>
              <p className="text-xs font-semibold text-foreground font-sans">${d.cost.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">{t("admin_top_ai")}</h3>
            <Badge className="bg-destructive/10 text-destructive border-0 font-sans">1 {t("admin_anomaly")}</Badge>
          </div>
          <ExportMenu
            onCSV={() => exportAiUsageCSV(teachers, t)}
            onPDF={() => exportAiUsageDOCX(teachers, t)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["#", "Учитель", "Школа", "IP", "Токены", "Статус", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-4">
                    <TableSkeleton rows={10} columns={7} />
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={Users} title={t("adminNoTeachers", "Нет учителей")} description={t("adminNoTeachersDesc", "Список учителей пуст")} />
                  </td>
                </tr>
              ) : (
                [...teachers].sort((a, b) => b.tokenUsage - a.tokenUsage).map((t_, i) => (
                  <tr key={t_.id} className={`border-b border-border last:border-0 ${t_.tokenUsage > 5000 ? "bg-destructive/5" : ""}`}>
                    <td className="px-5 py-3 text-sm font-bold text-muted-foreground font-sans">#{i + 1}</td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground font-sans">{t_.name}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground font-sans">{t_.school}</td>
                    <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{t_.ip}</td>
                    <td className={`px-5 py-3 text-sm font-bold font-sans ${t_.tokenUsage > 5000 ? "text-destructive" : "text-foreground"}`}>
                      {t_.tokenUsage.toLocaleString()}
                      {t_.tokenUsage > 5000 && <AlertTriangle className="inline w-3 h-3 ml-1" />}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={t_.status} /></td>
                    <td className="px-5 py-3">
                      {t_.tokenUsage > 5000 && (
                        <button onClick={() => toggleBlock(t_.id)} className="text-xs text-destructive hover:underline font-sans">
                          {t_.status === "blocked" ? "Разблокировать" : "Заблокировать"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
