import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Menu, X, Cpu, Sun, Moon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { toast } from "sonner";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { adminService } from "@/api/adminService";

// Core Components
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { UserManagement } from "@/components/admin/UserManagement";
import { OrgManagement } from "@/components/admin/OrgManagement";
import { AiMonitoring } from "@/components/admin/AiMonitoring";
import { FinancialReporting } from "@/components/admin/FinancialReporting";
import { SystemSettings } from "@/components/admin/SystemSettings";

// Types & Utils
import { 
  Teacher, Org, Payment, FinancialStats, AuditLog, Section,
  ApiTeacher, ApiAnalyticEntry, ApiOrg, ApiPayment, ApiAuditLog 
} from "@/types/admin";

const AdminPanel = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiProvider, setAiProvider] = useState<"gemini" | "openai">("gemini");
  const [systemAlert, setSystemAlert] = useState("");
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [adminTelegram, setAdminTelegram] = useState("");
  const [showResetModal, setShowResetModal] = useState<number | null>(null);

  // Data State
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [financials, setFinancials] = useState<FinancialStats>({ 
    mrr: 0, total_revenue: 0, active_subscriptions: 0, pending_payments: 0 
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const LIMIT = 50;

  const handleImpersonate = async (id: number) => {
    try {
      const data = await adminService.impersonateUser(id);
      login(data.access_token, data.user);
      const role = data.user?.role;
      navigate(role === "super_admin" ? "/admin" : role === "org_admin" ? "/org-admin" : "/teacher");
      toast.success("Вход в аккаунт выполнен");
    } catch {
      toast.error("Ошибка при входе в аккаунт");
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const skip = (page - 1) * LIMIT;
      const [teachersData, analyticsData, orgsData, paymentsData, logsData, alertData, enabledData, providerData, financialsData, telegramData] = await Promise.all([
        adminService.getTeachers(skip, LIMIT, searchQuery),
        adminService.getAnalytics(),
        adminService.getOrganizations(skip, LIMIT),
        adminService.getPayments(skip, LIMIT),
        adminService.getAuditLogs(skip, LIMIT),
        adminService.getSetting("system_alert").catch(() => null),
        adminService.getSetting("alert_enabled").catch(() => null),
        adminService.getSetting("ai_provider").catch(() => null),
        adminService.getFinancials().catch(() => null),
        adminService.getSetting("admin_telegram").catch(() => null),
      ]);

      if (alertData) setSystemAlert(alertData.value);
      if (enabledData) setAlertEnabled(enabledData.value === "true");
      if (providerData) setAiProvider(providerData.value as "gemini" | "openai");
      if (telegramData) setAdminTelegram(telegramData.value || "");
      if (financialsData) setFinancials({
        mrr: financialsData.mrr ?? 0,
        total_revenue: financialsData.total_revenue ?? 0,
        active_subscriptions: financialsData.active_subscriptions ?? 0,
        pending_payments: financialsData.pending_payments ?? 0,
      });

      const analyticsMap = new Map((analyticsData as ApiAnalyticEntry[]).map(a => [a.user_id, a]));
      setTeachers((teachersData as ApiTeacher[]).map(u => {
        const stats = analyticsMap.get(u.id);
        return {
          id: u.id,
          name: u.full_name || "Unknown",
          login: u.email,
          school: u.school || "Online",
          status: u.is_active ? "active" : "blocked",
          lastLogin: stats?.last_active ? new Date(stats.last_active).toLocaleString("ru-RU") : "—",
          plan: u.plan?.toUpperCase() || "FREE",
          tokenUsage: stats?.total_tokens || 0,
          ip: "—",
          is_active: u.is_active,
          tokens_limit: u.tokens_limit || 0,
          expires_at: u.expires_at || null,
          organization_id: u.organization_id ?? null,
          role: u.role || "teacher",
        };
      }));
      setOrgs((orgsData as ApiOrg[]).map(o => ({
        id: o.id, name: o.name, contact: o.contact_person, seats: o.license_seats,
        used: o.used_seats || 0, expires: o.expires_at, status: o.status
      })));
      setPayments((paymentsData as ApiPayment[]).map(p => ({
        id: p.id, org: p.org_name || "Unknown", amount: p.amount, currency: p.currency,
        date: p.date, method: p.method, status: p.status, period: p.period
      })));
      setAuditLogs((logsData as ApiAuditLog[]).map(l => ({
        id: l.id, action: l.action, target: l.target,
        time: new Date(l.timestamp).toLocaleString("ru-RU"), type: l.log_type
      })));
    } catch (e) {
      console.error("Failed to fetch admin data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [page, searchQuery]);

  const toggleBlock = async (id: number) => {
    try {
      await adminService.toggleTeacherStatus(id);
      fetchData();
      toast.success("Статус изменен");
    } catch { toast.error("Ошибка при изменении статуса"); }
  };

  const handleRoleChange = async (id: number, promote: boolean) => {
    try {
      if (promote) await adminService.promoteToOrgAdmin(id);
      else await adminService.demoteFromOrgAdmin(id);
      fetchData();
      toast.success("Роль обновлена. Пользователь должен перезайти.");
    } catch { toast.error("Ошибка при изменении роли"); }
  };

  const sectionTitles: Record<Section, { title: string; sub: string }> = {
    dashboard: { title: t("admin_dash_title"), sub: t("admin_dash_sub") },
    teachers: { title: t("admin_teachers_title"), sub: t("admin_teachers_sub") },
    organizations: { title: t("admin_orgs_title"), sub: t("admin_orgs_sub") },
    "ai-monitor": { title: t("admin_monitor_title"), sub: t("admin_monitor_sub") },
    finances: { title: t("admin_finances_title"), sub: t("admin_finances_sub") },
    system: { title: t("admin_system_title"), sub: t("admin_system_sub") },
  };
  const current = sectionTitles[activeSection];

  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar fixed inset-y-0 left-0 z-30">
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          setSidebarOpen={setSidebarOpen}
          aiProvider={aiProvider}
          counts={{
            expiringTeachers: teachers.filter(t_ => t_.status === "expiring").length,
            pendingPayments: payments.filter(p => p.status === "pending").length
          }}
        />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/80 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 w-64 bg-sidebar z-50 flex flex-col lg:hidden"
            >
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-sidebar-foreground/60"><X className="w-5 h-5"/></button>
              <AdminSidebar
                activeSection={activeSection} setActiveSection={setActiveSection}
                setSidebarOpen={setSidebarOpen} aiProvider={aiProvider}
                counts={{
                  expiringTeachers: teachers.filter(t_ => t_.status === "expiring").length,
                  pendingPayments: payments.filter(p => p.status === "pending").length
                }}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 lg:ml-64">
        {alertEnabled && systemAlert && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-2.5 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-700 font-sans">{systemAlert}</p>
          </div>
        )}

        <header className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu className="w-6 h-6 text-foreground" /></button>
            <div>
              <Breadcrumbs items={[{ label: t("adminPanel"), href: "/admin" }, { label: current.title }]} />
              <h1 className="text-xl font-bold text-foreground">{current.title}</h1>
              <p className="text-xs text-muted-foreground font-sans">{current.sub}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-sans bg-muted px-3 py-1.5 rounded-full">
              <Cpu className="w-3.5 h-3.5" /> {aiProvider === "gemini" ? "Gemini" : "OpenAI"} • Онлайн
            </div>
            <button onClick={toggleTheme} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              {isDark ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button onClick={() => navigate("/profile")} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden"><img src="/logo_sticker.webp" className="w-full h-full object-contain"/></button>
          </div>
        </header>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeSection === "dashboard" && <AdminDashboard teachers={teachers} orgs={orgs} payments={payments} auditLogs={auditLogs} isLoading={isLoading} />}
              {activeSection === "teachers" && (
                <UserManagement
                  teachers={teachers} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                  toggleBlock={toggleBlock} showResetModal={showResetModal} setShowResetModal={setShowResetModal}
                  isLoading={isLoading} onRefresh={fetchData} onImpersonate={handleImpersonate}
                  selectedIds={selectedIds} setSelectedIds={setSelectedIds}
                  onPromote={id => handleRoleChange(id, true)} onDemote={id => handleRoleChange(id, false)}
                />
              )}
              {activeSection === "organizations" && <OrgManagement orgs={orgs} isLoading={isLoading} onRefresh={fetchData} />}
              {activeSection === "ai-monitor" && (
                <AiMonitoring
                  teachers={teachers} aiProvider={aiProvider} setAiProvider={setAiProvider}
                  toggleBlock={toggleBlock} isLoading={isLoading}
                />
              )}
              {activeSection === "finances" && <FinancialReporting payments={payments} financials={financials} isLoading={isLoading} orgs={orgs} teachers={teachers} />}
              {activeSection === "system" && (
                <SystemSettings
                  aiProvider={aiProvider} setAiProvider={setAiProvider}
                  systemAlert={systemAlert} setSystemAlert={setSystemAlert}
                  alertEnabled={alertEnabled} setAlertEnabled={setAlertEnabled}
                  auditLogs={auditLogs} isLoading={isLoading}
                  adminTelegram={adminTelegram} setAdminTelegram={setAdminTelegram}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {["teachers", "organizations", "finances"].includes(activeSection) && !isLoading && (
            <div className="mt-6 flex justify-center gap-2">
              <span className="flex items-center px-4 font-mono text-sm">{t("page")} {page}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}> {t("prev")} </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={teachers.length < LIMIT && orgs.length < LIMIT && payments.length < LIMIT}> {t("next")} </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
