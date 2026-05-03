import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { LogOut, Send, Sparkles, UserCog } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import type { OrgMeResponse as OrgStats, OrgTeacher as TeacherRow, OrgContact } from "@/types/api";
import { OrgStatsCards } from "@/components/org-admin/OrgStatsCards";
import { TeachersTable } from "@/components/org-admin/TeachersTable";
import { AddTeacherModal } from "@/components/org-admin/AddTeacherModal";
import { InviteModal } from "@/components/org-admin/InviteModal";
import { UpgradePlanModal } from "@/components/org-admin/UpgradePlanModal";

export default function OrgAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [adminTelegram, setAdminTelegramState] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, teachersRes, contactRes] = await Promise.all([
        api.get("/org-admin/me"),
        api.get("/org-admin/teachers"),
        api.get("/org-admin/contact").catch(() => ({ data: { admin_telegram: null } })),
      ]);
      setStats(statsRes.data);
      setTeachers(teachersRes.data);
      setAdminTelegramState(contactRes.data.admin_telegram || null);
    } catch {
      toast.error("Ошибка загрузки данных");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleBlock = async (id: number) => {
    try {
      await api.post(`/org-admin/teachers/${id}/toggle-block`);
      fetchData();
    } catch {
      toast.error("Ошибка");
    }
  };

  const deleteTeacher = async (id: number) => {
    if (!confirm("Удалить учителя?")) return;
    try {
      await api.delete(`/org-admin/teachers/${id}`);
      toast.success("Учитель удалён");
      fetchData();
    } catch {
      toast.error("Ошибка удаления");
    }
  };

  const generateInvite = async () => {
    try {
      const res = await api.post("/org-admin/invite");
      const base = window.location.origin;
      setInviteLink(`${base}/register?invite=${res.data.token}`);
      setShowInviteModal(true);
    } catch {
      toast.error("Ошибка создания инвайта");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center p-1.5">
              <img src="/logo_sticker.webp" alt="ClassPlay" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-foreground font-sans">ClassPlay</span>
              {stats && (
                <span className="ml-2 text-sm text-muted-foreground font-sans">— {stats.org_name}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-sans hidden sm:block">{user?.email}</span>
            <Button
              size="sm"
              className="gap-2 font-sans rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white border-0 shadow-sm hover:opacity-90"
              onClick={() => setShowUpgradeModal(true)}
            >
              <Sparkles className="w-3.5 h-3.5" /> Купить план
            </Button>
            {adminTelegram && (
              <a
                href={`https://t.me/${adminTelegram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2 font-sans rounded-xl border-blue-500/30 text-blue-600 hover:bg-blue-500/10">
                  <Send className="w-3.5 h-3.5" /> Написать в Telegram
                </Button>
              </a>
            )}
            <Button variant="ghost" size="sm" className="gap-2 font-sans" onClick={() => navigate("/profile")}>
              <UserCog className="w-4 h-4" /> Настройки
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 font-sans" onClick={logout}>
              <LogOut className="w-4 h-4" /> Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <OrgStatsCards stats={stats} isLoading={isLoading} adminTelegram={adminTelegram} />

        <TeachersTable
          teachers={teachers}
          isLoading={isLoading}
          onToggleBlock={toggleBlock}
          onDelete={deleteTeacher}
          onAddClick={() => setShowAddModal(true)}
          onInviteClick={generateInvite}
          onRefresh={fetchData}
        />
      </main>

      <AnimatePresence>
        {showAddModal && (
          <AddTeacherModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => { setShowAddModal(false); fetchData(); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInviteModal && (
          <InviteModal
            inviteLink={inviteLink}
            onClose={() => setShowInviteModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradePlanModal
            teacherCount={stats?.teachers_count ?? 1}
            adminTelegram={adminTelegram}
            onClose={() => setShowUpgradeModal(false)}
            onCheckout={(plan) => { setShowUpgradeModal(false); navigate(`/checkout?plan=${plan}`); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
