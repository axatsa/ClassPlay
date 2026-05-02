import React from "react";
import { useTranslation } from "react-i18next";
import { 
  TrendingUp, BarChart3, CreditCard, Receipt, Building2, ArrowUpRight, 
  Loader2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { MetricCard, PieChart, MrrChart, ExportMenu } from "./shared/AdminShared";
import { Payment, FinancialStats, Org, Teacher } from "@/types/admin";
import { exportPaymentsCSV, exportPaymentsDOCX } from "@/lib/adminExport";

interface FinancialReportingProps {
  payments: Payment[];
  financials: FinancialStats;
  orgs: Org[];
  teachers: Teacher[];
  isLoading: boolean;
}

export const FinancialReporting: React.FC<FinancialReportingProps> = ({
  payments, financials, orgs, teachers, isLoading
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const totalMRR = financials.mrr;
  const totalPaid = financials.total_revenue;
  const pendingCount = financials.pending_payments;
  const mrrGrowth = 12; // Static for now
  const arr = totalMRR * 12;

  const mrrData = [
    { month: "Янв", mrr: totalMRR * 0.8 },
    { month: "Фев", mrr: totalMRR * 0.85 },
    { month: "Мар", mrr: totalMRR * 0.9 },
    { month: "Апр", mrr: totalMRR * 0.95 },
    { month: "Май", mrr: totalMRR },
  ];

  const payStatusData = [
    { label: "Оплачено", value: payments.filter(p => p.status === "paid").length },
    { label: "Ожидание", value: payments.filter(p => p.status === "pending").length },
    { label: "Ошибка", value: payments.filter(p => p.status === "failed").length },
  ];

  const orgStatusData = [
    { label: "Активно", value: orgs.filter(o => o.status === "active").length },
    { label: "Истекает", value: orgs.filter(o => o.status === "expiring").length },
    { label: "Истёк", value: orgs.filter(o => o.status === "expired").length },
  ];

  const planDistData = [
    { label: "FREE", value: teachers.filter(t_ => t_.plan === "FREE").length },
    { label: "PRO", value: teachers.filter(t_ => t_.plan === "PRO").length },
    { label: "SCHOOL", value: teachers.filter(t_ => t_.plan === "SCHOOL").length },
  ];

  const teacherStatusData = [
    { label: "Активно", value: teachers.filter(t_ => t_.status === "active").length },
    { label: "Скоро", value: teachers.filter(t_ => t_.status === "expiring").length },
    { label: "Истёк", value: teachers.filter(t_ => t_.status === "expired" || t_.status === "blocked").length },
  ];

  const revByPlan = [
    { plan: "FREE", count: teachers.filter(t_ => t_.plan === "FREE").length, mrr: 0 },
    { plan: "PRO", count: teachers.filter(t_ => t_.plan === "PRO").length, mrr: teachers.filter(t_ => t_.plan === "PRO").length * 5 },
    { plan: "SCHOOL", count: teachers.filter(t_ => t_.plan === "SCHOOL").length, mrr: teachers.filter(t_ => t_.plan === "SCHOOL").length * 20 },
  ];

  const payStatusMap: Record<string, { label: string; cls: string }> = {
    paid: { label: `✅ ${t("adminStatusPaid")}`, cls: "bg-success/15 text-success border-0" },
    pending: { label: `⏳ ${t("adminStatusPending")}`, cls: "bg-yellow-500/15 text-yellow-600 border-0" },
    failed: { label: `❌ ${t("adminStatusFailed")}`, cls: "bg-destructive/15 text-destructive border-0" },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={TrendingUp} label={t("adminMetricMRR")} value={`$${totalMRR}`} sub={`+${mrrGrowth}% vs ${lang === "ru" ? "дек" : "dek"}`} trend="up" color="bg-success/10 text-success" />
        <MetricCard icon={BarChart3} label={t("adminMetricARR")} value={`$${arr.toLocaleString()}`} sub={`× 12 ${lang === "ru" ? "от" : "dan"} MRR`} color="bg-primary/10 text-primary" />
        <MetricCard icon={CreditCard} label={t("adminMetricTotal")} value={`$${totalPaid}`} sub={lang === "ru" ? "за все время" : "barcha vaqt davomida"} color="bg-violet-500/10 text-violet-600" />
        <MetricCard icon={Receipt} label={t("adminMetricPending")} value={String(pendingCount)} sub={lang === "ru" ? "требуют звонка" : "qo'ng'iroq kutilmoqda"} trend={pendingCount > 0 ? "down" : undefined} color="bg-yellow-500/10 text-yellow-600" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-foreground">{t("admin_mrr_full")}</h3>
            <p className="text-xs text-muted-foreground font-sans mt-0.5">{t("adminChartSub")}</p>
          </div>
          <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-full">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="text-sm font-semibold font-sans">+{mrrGrowth}%</span>
          </div>
        </div>
        {isLoading ? (
          <div className="h-36 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <MrrChart data={mrrData} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Статус платежей</h3>
          <PieChart data={payStatusData} colors={["#10b981", "#f59e0b", "#ef4444"]} />
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Статус организаций</h3>
          <PieChart data={orgStatusData} colors={["#10b981", "#f59e0b", "#ef4444"]} />
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Распределение планов (учителя)</h3>
          <PieChart data={planDistData} colors={["#94a3b8", "#3b82f6", "#8b5cf6"]} />
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Статус подписок учителей</h3>
          <PieChart data={teacherStatusData} colors={["#10b981", "#f59e0b", "#ef4444"]} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{t("adminPaymentHistory")}</h3>
          <ExportMenu
            onCSV={() => exportPaymentsCSV(payments, t)}
            onPDF={() => exportPaymentsDOCX(payments, t)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {[t("adminOrg"), t("adminAmount"), t("adminDate"), t("adminMethod"), t("adminPeriod"), t("adminStatus"), ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-4">
                    <TableSkeleton rows={5} columns={7} />
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={CreditCard} title={t("adminNoPayments")} description={t("adminPaymentsEmpty")} />
                  </td>
                </tr>
              ) : (
                payments.map((p, i) => {
                  const st = payStatusMap[p.status] ?? { label: p.status, cls: "" };
                  return (
                    <tr key={p.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium text-foreground font-sans">{p.org}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-foreground font-sans">${p.amount}</span>
                        <span className="text-xs text-muted-foreground font-sans ml-1">{p.currency}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground font-sans">
                        {new Date(p.date).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground font-sans">{p.method}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground font-sans">{p.period}</td>
                      <td className="px-5 py-4">
                        <Badge className={`font-sans rounded-full px-3 text-xs ${st.cls}`}>{st.label}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        {p.status === "pending" && (
                          <Button variant="outline" size="sm" className="rounded-xl h-7 text-xs font-sans gap-1">
                            <Receipt className="w-3 h-3" /> {lang === "ru" ? "Счёт" : "Hisob"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
