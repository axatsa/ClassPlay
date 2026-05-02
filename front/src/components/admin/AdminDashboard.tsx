import React from "react";
import { useTranslation } from "react-i18next";
import { 
  Users, Building2, DollarSign, BrainCircuit, 
  AlertTriangle 
} from "lucide-react";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { MetricCard, StatusBadge, BarChart } from "./shared/AdminShared";
import { Teacher, Org, Payment, AuditLog } from "@/types/admin";

interface AdminDashboardProps {
  teachers: Teacher[];
  orgs: Org[];
  payments: Payment[];
  auditLogs: AuditLog[];
  isLoading: boolean;
}

const DAILY_TOKENS = [
  { day: "Mon", tokens: 2400 },
  { day: "Tue", tokens: 1398 },
  { day: "Wed", tokens: 9800 },
  { day: "Thu", tokens: 3908 },
  { day: "Fri", tokens: 4800 },
  { day: "Sat", tokens: 3800 },
  { day: "Sun", tokens: 4300 },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  teachers, orgs, payments, auditLogs, isLoading 
}) => {
  const { t } = useTranslation();
  
  const expiringTeachers = teachers.filter(t => {
    if (!t.expires_at) return false;
    const daysLeft = Math.ceil((new Date(t.expires_at).getTime() - Date.now()) / 86400000);
    return daysLeft > 0 && daysLeft <= 7;
  });
  
  const expiredTeachers = teachers.filter(t => {
    if (!t.expires_at) return false;
    return new Date(t.expires_at).getTime() < Date.now();
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Users} label={t("admin_total_teachers")} value={String(teachers.length)} sub={`${expiringTeachers.length} истекают скоро`} trend={expiringTeachers.length > 0 ? "down" : undefined} color="bg-primary/10 text-primary" />
        <MetricCard icon={Building2} label={t("admin_orgs")} value={String(orgs.length)} sub={`${orgs.filter(o => o.status === "expiring").length} истекают`} color="bg-yellow-500/10 text-yellow-600" />
        <MetricCard icon={DollarSign} label={t("admin_revenue")} value={`$${payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0).toLocaleString()}`} sub="+18% рост" trend="up" color="bg-success/10 text-success" />
        <MetricCard icon={BrainCircuit} label={t("admin_tokens_stat")} value="1.2M" sub="24.5k сегодня" color="bg-violet-500/10 text-violet-600" />
      </div>

      {(expiringTeachers.length > 0 || expiredTeachers.length > 0) && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
          <h3 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Подписки требуют внимания
          </h3>
          <div className="space-y-2">
            {expiringTeachers.length > 0 && (
              <p className="text-sm text-yellow-700 font-sans">
                <span className="font-bold">{expiringTeachers.length}</span> учителей истекают в течение 7 дней
              </p>
            )}
            {expiredTeachers.length > 0 && (
              <p className="text-sm text-destructive font-sans">
                <span className="font-bold">{expiredTeachers.length}</span> учителей имеют истёкшие подписки
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground">{t("admin_recent_payments")}</h3>
            <button className="text-xs font-semibold text-primary hover:underline">{t("admin_all_ops")}</button>
          </div>
          <div className="space-y-4">
            {isLoading ? <TableSkeleton rows={4} columns={3} /> : payments.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.org}</p>
                    <p className="text-xs text-muted-foreground">{p.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">${p.amount}</p>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-5">{t("admin_ai_activity")}</h3>
          <BarChart data={DAILY_TOKENS} />
        </div>
      </div>
    </div>
  );
};
