import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { 
  Bell, Cpu, Globe, Shield, Download, X, Activity, 
  ToggleRight, ToggleLeft 
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { AuditLog } from "@/types/admin";
import { adminService } from "@/api/adminService";
import { exportAuditLogDOCX } from "@/lib/adminExport";

interface SystemSettingsProps {
  aiProvider: string;
  setAiProvider: (v: "gemini" | "openai") => void;
  systemAlert: string;
  setSystemAlert: (v: string) => void;
  alertEnabled: boolean;
  setAlertEnabled: (v: boolean) => void;
  auditLogs: AuditLog[];
  isLoading: boolean;
  adminTelegram: string;
  setAdminTelegram: (v: string) => void;
}

const LOG_TYPE_STYLES: Record<string, string> = {
  success: "bg-green-500/10 text-green-700 border-green-500/20",
  warning: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  danger: "bg-red-500/10 text-red-700 border-red-500/20",
  info: "bg-primary/10 text-primary border-primary/20",
};

function getLogCategory(action: string): "user" | "org" | "system" {
  const lower = action.toLowerCase();
  if (lower.includes("org") || lower.includes("csv import") || lower.includes("invite")) return "org";
  if (lower.includes("teacher") || lower.includes("block") || lower.includes("unblock") || lower.includes("plan") || lower.includes("extend") || lower.includes("password") || lower.includes("bulk")) return "user";
  return "system";
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  aiProvider, setAiProvider, systemAlert, setSystemAlert, alertEnabled, setAlertEnabled, auditLogs, isLoading,
  adminTelegram, setAdminTelegram,
}) => {
  const { t } = useTranslation();
  const [logFilter, setLogFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [targetFilter, setTargetFilter] = useState<"all" | "user" | "org" | "system">("all");
  const [detailLog, setDetailLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter(log => {
    const logDate = new Date(log.time);
    const now = new Date();

    if (logFilter === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (logDate < today) return false;
    } else if (logFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (logDate < weekAgo) return false;
    } else if (logFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (logDate < monthAgo) return false;
    }

    if (actionFilter && !log.action.toLowerCase().includes(actionFilter.toLowerCase())) return false;
    if (targetFilter !== "all" && getLogCategory(log.action) !== targetFilter) return false;

    return true;
  });

  const actionCounts = filteredLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});
  const topActions = Object.entries(actionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4 font-sans">{t("adminSystemSettings")}</h3>
        <div className="space-y-6">
          <div className="p-4 bg-muted/30 rounded-2xl border border-border">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> {t("adminSystemAlert")}
            </h4>
            <p className="text-xs text-muted-foreground mb-4 font-sans">{t("adminSystemAlertDesc")}</p>
            <div className="space-y-4">
              <textarea
                value={systemAlert}
                onChange={e => setSystemAlert(e.target.value)}
                className="w-full h-24 bg-card border border-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-sans"
              />
              <div className="flex items-center gap-3">
                <Button
                  variant={alertEnabled ? "default" : "outline"}
                  onClick={() => setAlertEnabled(!alertEnabled)}
                  className="rounded-xl font-sans text-sm"
                >
                  {alertEnabled ? <ToggleRight className="w-4 h-4 mr-2" /> : <ToggleLeft className="w-4 h-4 mr-2" />}
                  {alertEnabled ? "Активно" : "Выключено"}
                </Button>
                {alertEnabled && <Badge className="bg-success/10 text-success border-0 font-sans">Показывается</Badge>}
                <Button 
                  onClick={() => {
                    adminService.setSetting("system_alert", systemAlert);
                    adminService.setSetting("alert_enabled", String(alertEnabled));
                    toast.success("Объявление сохранено");
                  }}
                  className="ml-auto rounded-xl font-sans h-9 bg-primary/10 text-primary hover:bg-primary/20"
                >
                   Сохранить изменения
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-2xl border border-border">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Telegram для связи с организациями
            </h4>
            <p className="text-xs text-muted-foreground mb-4 font-sans">
              Ваш Telegram username (без @). Org-admin видят кнопку «Написать» и попадают напрямую к вам.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="your_telegram_username"
                value={adminTelegram}
                onChange={e => setAdminTelegram(e.target.value.replace(/^@/, ""))}
                className="rounded-xl font-mono text-sm max-w-xs"
              />
              <Button
                onClick={() => {
                  adminService.setSetting("admin_telegram", adminTelegram);
                  toast.success("Telegram сохранён");
                }}
                className="rounded-xl font-sans"
              >
                Сохранить
              </Button>
            </div>
            {adminTelegram && (
              <p className="text-xs text-muted-foreground mt-2 font-sans">
                Ссылка: <span className="text-primary font-mono">t.me/{adminTelegram}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> {t("adminAuditLogs")}
            </h3>
            <Button variant="outline" size="sm" className="rounded-xl h-8 px-3 text-xs gap-1.5" onClick={() => exportAuditLogDOCX(filteredLogs, t)}>
              <Download className="w-3.5 h-3.5" /> {t("admin_export")}
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {(["all", "today", "week", "month"] as const).map(f => (
                <Button key={f} variant={logFilter === f ? "default" : "outline"} size="sm" className="rounded-lg h-8 text-xs font-sans" onClick={() => setLogFilter(f)}>
                  {f === "all" ? "Все даты" : f === "today" ? "Сегодня" : f === "week" ? "Неделя" : "Месяц"}
                </Button>
              ))}
              <div className="h-6 w-px bg-border self-center" />
              {(["all", "user", "org", "system"] as const).map(c => (
                <Button key={c} variant={targetFilter === c ? "default" : "outline"} size="sm" className="rounded-lg h-8 text-xs font-sans" onClick={() => setTargetFilter(c)}>
                  {c === "all" ? "Все типы" : c === "user" ? "👤 Учителя" : c === "org" ? "🏢 Орг" : "⚙️ Система"}
                </Button>
              ))}
            </div>
            <Input placeholder="Поиск по действию..." value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="h-8 text-xs rounded-lg font-sans" />
            {topActions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topActions.map(([action, count]) => (
                  <span key={action} className="inline-flex items-center gap-1 text-[10px] font-sans bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    {action} <strong className="text-foreground">{count}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {[t("exp_time"), t("exp_action"), t("exp_target"), "Тип"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-sans">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="p-4">
                    <TableSkeleton rows={5} columns={3} />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center">
                    <EmptyState icon={Activity} title={t("adminNoLogs", "Нет логов")} description={t("adminNoLogsDesc", "История действий пуста")} />
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, i) => (
                  <tr
                    key={log.id}
                    className={`border-b border-border last:border-0 cursor-pointer hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                    onClick={() => setDetailLog(log)}
                  >
                    <td className="px-6 py-3 text-sm text-muted-foreground font-sans">{log.time}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${LOG_TYPE_STYLES[log.type] ?? LOG_TYPE_STYLES.info}`}>{log.action}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-muted-foreground font-sans">{log.target}</td>
                    <td className="px-6 py-3">
                      <span className="text-[10px] text-muted-foreground font-sans bg-muted px-1.5 py-0.5 rounded">{getLogCategory(log.action)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log detail modal */}
      <AnimatePresence>
        {detailLog && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4"
            onClick={() => setDetailLog(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Детали записи</h3>
                <button onClick={() => setDetailLog(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">Действие</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${LOG_TYPE_STYLES[detailLog.type] ?? LOG_TYPE_STYLES.info}`}>{detailLog.action}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">Цель</span>
                  <span className="text-sm font-medium text-foreground font-sans">{detailLog.target}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">Время</span>
                  <span className="text-sm text-muted-foreground font-sans">{detailLog.time}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">Тип</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded font-sans">{getLogCategory(detailLog.action)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">ID записи</span>
                  <span className="text-xs text-muted-foreground font-mono">#{detailLog.id}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
