import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-index";
import { 
  Search, Filter, Plus, CreditCard, Calendar, Lock, Unlock, X, 
  Clock, LogIn, Settings, Key, Ban, AlertTriangle, ShieldCheck, ShieldOff 
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge, PlanBadge, ExportMenu } from "./shared/AdminShared";
import { Teacher } from "@/types/admin";
import { adminService } from "@/api/adminService";
import { exportTeachersCSV, exportTeachersDOCX } from "@/lib/adminExport";
import TeacherModal, { TeacherFormData } from "@/components/admin/TeacherModal";

interface UserManagementProps {
  teachers: Teacher[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  toggleBlock: (id: number) => void;
  showResetModal: number | null;
  setShowResetModal: (v: number | null) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onImpersonate: (id: number) => void;
  selectedIds: number[];
  setSelectedIds: (v: number[] | ((prev: number[]) => number[])) => void;
  onPromote: (id: number) => void;
  onDemote: (id: number) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  teachers, searchQuery, setSearchQuery, toggleBlock, showResetModal, setShowResetModal, isLoading, onRefresh, onImpersonate,
  selectedIds, setSelectedIds, onPromote, onDemote,
}) => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [planFilter, setPlanFilter] = useState<"all" | "FREE" | "PRO" | "SCHOOL">("all");
  const [schoolFilter, setSchoolFilter] = useState<string>("");
  const [expiryFilter, setExpiryFilter] = useState<"all" | "today" | "week" | "month" | "expired">("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = teachers.filter(t_ => {
    if (statusFilter !== "all" && t_.status !== statusFilter) return false;
    if (planFilter !== "all" && t_.plan !== planFilter) return false;
    if (schoolFilter && !t_.school.toLowerCase().includes(schoolFilter.toLowerCase())) return false;

    if (expiryFilter !== "all" && t_.expires_at) {
      const expiryDate = new Date(t_.expires_at);
      const now = new Date();
      const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / 86400000);

      if (expiryFilter === "expired") {
        if (daysLeft >= 0) return false;
      } else if (expiryFilter === "today") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (expiryDate < today) return false;
        const tomorrow = new Date(today.getTime() + 86400000);
        if (expiryDate >= tomorrow) return false;
      } else if (expiryFilter === "week") {
        if (daysLeft < 0 || daysLeft > 7) return false;
      } else if (expiryFilter === "month") {
        if (daysLeft < 0 || daysLeft > 30) return false;
      }
    } else if (expiryFilter !== "all") {
      return false;
    }

    return true;
  });

  const [tmpPwd] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const [modal, setModal] = useState<{isOpen: boolean, data?: TeacherFormData}>({isOpen: false});

  useEffect(() => {
    const handleClickOutside = () => setFilterOpen(false);
    if (filterOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [filterOpen]);

  const handleSave = async (data: TeacherFormData) => {
    if (data.id) await adminService.updateTeacher(data.id, data);
    else await adminService.createTeacher({ ...data, password: data.password! });
    onRefresh();
    toast.success("Saved successfully");
  };

  const handleDelete = async (id: number) => {
    if (confirm("Вы уверены, что хотите удалить этого учителя?")) {
      await adminService.deleteTeacher(id);
      onRefresh();
      toast.success("Deleted");
    }
  };

  const blockedCount = filtered.filter(t_ => t_.status === "blocked").length;
  const expiringCount = filtered.filter(t_ => {
    if (!t_.expires_at) return false;
    const daysLeft = Math.ceil((new Date(t_.expires_at).getTime() - Date.now()) / 86400000);
    return daysLeft > 0 && daysLeft <= 7;
  }).length;
  const expiredCount = filtered.filter(t_ => {
    if (!t_.expires_at) return false;
    return new Date(t_.expires_at).getTime() < Date.now();
  }).length;

  return (
    <div className="space-y-4">
      {(blockedCount > 0 || expiringCount > 0 || expiredCount > 0) && (
        <div className="bg-card border border-border rounded-xl p-3 flex gap-4 text-xs font-sans">
          {blockedCount > 0 && <div className="flex items-center gap-2"><Ban className="w-3.5 h-3.5 text-destructive" /><span>{blockedCount} заблокировано</span></div>}
          {expiringCount > 0 && <div className="flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-yellow-600" /><span>{expiringCount} истекают скоро</span></div>}
          {expiredCount > 0 && <div className="flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-destructive" /><span>{expiredCount} истёкших</span></div>}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("admin_search_placeholder")}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl font-sans"
          />
        </div>
        <div className="relative">
          <Button
            variant="outline"
            className="gap-2 rounded-xl font-sans"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter className="w-4 h-4" /> {t("adminFilter")}
            {(statusFilter !== "all" || planFilter !== "all" || schoolFilter || expiryFilter !== "all") && (
              <Badge className="ml-1 bg-primary text-background">
                {(statusFilter !== "all" ? 1 : 0) + (planFilter !== "all" ? 1 : 0) + (schoolFilter ? 1 : 0) + (expiryFilter !== "all" ? 1 : 0)}
              </Badge>
            )}
          </Button>
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-10 z-50 bg-card border border-border rounded-xl shadow-lg p-3 min-w-[200px]"
                onClick={e => e.stopPropagation()}
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Статус</p>
                    <div className="space-y-1">
                      {(["all", "active", "blocked"] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors font-sans ${
                            statusFilter === s
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {s === "all" ? "Все" : s === "active" ? "Активные" : "Заблокированные"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">План</p>
                    <div className="space-y-1">
                      {(["all", "FREE", "PRO", "SCHOOL"] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setPlanFilter(p)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors font-sans ${
                            planFilter === p
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {p === "all" ? "Все" : p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Школа</p>
                    <Input
                      placeholder="Поиск по школе..."
                      value={schoolFilter}
                      onChange={e => setSchoolFilter(e.target.value)}
                      className="h-8 text-xs rounded-lg font-sans"
                    />
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Истечение</p>
                    <div className="space-y-1">
                      {(["all", "today", "week", "month", "expired"] as const).map(e => (
                        <button
                          key={e}
                          onClick={() => setExpiryFilter(e)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors font-sans ${
                            expiryFilter === e
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {e === "all" ? "Все" : e === "today" ? "Сегодня" : e === "week" ? "На этой неделе" : e === "month" ? "В этом месяце" : "Истёкшие"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <ExportMenu
          onCSV={() => exportTeachersCSV(teachers, t)}
          onPDF={() => exportTeachersDOCX(teachers, t)}
        />
        <Button className="gap-2 rounded-xl font-sans" onClick={() => setModal({ isOpen: true })}>
          <Plus className="w-4 h-4" /> {t("admin_add_teacher")}
        </Button>
      </div>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 flex-wrap max-w-[90vw]"
          >
            <span className="text-sm font-semibold font-sans">Выбрано: {selectedIds.length}</span>
            <div className="h-4 w-px bg-background/20" />
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-background/10 text-background gap-2 h-8 text-xs font-sans"
                onClick={async () => {
                  const plan = prompt("Введите план (free, pro, school):", "pro");
                  if (plan) {
                    await adminService.bulkChangePlan(selectedIds, plan);
                    setSelectedIds([]);
                    onRefresh();
                    toast.success(`План изменён на ${plan}`);
                  }
                }}
              >
                <CreditCard className="w-3.5 h-3.5" /> План
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-background/10 text-background gap-2 h-8 text-xs font-sans"
                onClick={async () => {
                  const days = prompt("На сколько дней продлить?", "30");
                  if (days && !isNaN(parseInt(days))) {
                    await adminService.bulkExtendSubscription(selectedIds, parseInt(days));
                    setSelectedIds([]);
                    onRefresh();
                    toast.success(`Подписка продлена на ${days} дней`);
                  }
                }}
              >
                <Calendar className="w-3.5 h-3.5" /> Продлить
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-background/10 text-background gap-2 h-8 text-xs font-sans"
                onClick={async () => {
                  await adminService.bulkBlockTeachers(selectedIds);
                  setSelectedIds([]);
                  onRefresh();
                  toast.success("Пользователи заблокированы");
                }}
              >
                <Lock className="w-3.5 h-3.5" /> Блокировать
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-background/10 text-background gap-2 h-8 text-xs font-sans"
                onClick={async () => {
                  await adminService.bulkUnblockTeachers(selectedIds);
                  setSelectedIds([]);
                  onRefresh();
                  toast.success("Пользователи разблокированы");
                }}
              >
                <Unlock className="w-3.5 h-3.5" /> Разблокировать
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-destructive/20 text-destructive gap-2 h-8 text-xs font-sans"
                onClick={async () => {
                  if (confirm(`Вы уверены, что хотите удалить ${selectedIds.length} учителей?`)) {
                    await adminService.bulkDeleteTeachers(selectedIds);
                    setSelectedIds([]);
                    onRefresh();
                    toast.success("Пользователи удалены");
                  }
                }}
              >
                <X className="w-3.5 h-3.5" /> Удалить
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-10 px-5">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(filtered.map(t_ => t_.id));
                      else setSelectedIds([]);
                    }}
                  />
                </th>
                {[t("exp_teacher_login"), t("exp_school"), t("exp_last_login"), t("exp_tokens"), "Подписка", t("exp_status"), t("exp_action")].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-4">
                    <TableSkeleton rows={5} columns={8} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState icon={Users} title={t("admin_teachers_not_found")} description={t("admin_no_teachers")} />
                  </td>
                </tr>
              ) : (
                filtered.map((t_, i) => (
                  <motion.tr
                    key={t_.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={selectedIds.includes(t_.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(prev => [...prev, t_.id]);
                          else setSelectedIds(prev => prev.filter(id => id !== t_.id));
                        }}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground font-sans text-sm">{t_.name}</p>
                        {t_.role === "org_admin" && (
                          <span className="text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded-md font-sans">ORG</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-sans">@{t_.login}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground font-sans">{t_.school}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-sans">{t_.lastLogin}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-sans font-semibold ${t_.tokenUsage > 5000 ? "text-destructive" : "text-foreground"}`}>
                        {t_.tokenUsage.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <PlanBadge plan={t_.plan} expiresAt={t_.expires_at} />
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={t_.status} /></td>
                    <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                        <button onClick={() => onImpersonate(t_.id)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors" title="Войти как пользователь">
                          <LogIn className="w-3.5 h-3.5 text-primary" />
                        </button>
                        <button onClick={() => setModal({ isOpen: true, data: { id: t_.id, full_name: t_.name, email: t_.login, school: t_.school, tokens_limit: t_.tokens_limit, password: "", phone: "", plan: t_.plan } })} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Редактировать">
                          <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => setShowResetModal(t_.id)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Сбросить пароль">
                          <Key className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => toggleBlock(t_.id)}
                          className={`p-2 rounded-lg transition-colors ${t_.status === "blocked" ? "hover:bg-success/10" : "hover:bg-destructive/10"}`}
                          title={t_.status === "blocked" ? "Разблокировать" : "Заблокировать"}
                        >
                          {t_.status === "blocked"
                            ? <Unlock className="w-3.5 h-3.5 text-success" />
                            : <Lock className="w-3.5 h-3.5 text-destructive" />}
                        </button>
                        {t_.organization_id && (
                          t_.role === "org_admin" ? (
                            <button
                              onClick={() => onDemote(t_.id)}
                              className="p-2 rounded-lg hover:bg-yellow-500/10 transition-colors"
                              title="Снять роль адм. орги"
                            >
                              <ShieldOff className="w-3.5 h-3.5 text-yellow-600" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onPromote(t_.id)}
                              className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
                              title="Сделать адм. орги"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                            </button>
                          )
                        )}
                        <button onClick={() => handleDelete(t_.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="Удалить">
                          <X className="w-3.5 h-3.5 text-destructive" />
                        </button>
                        </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetModal !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowResetModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t("admin_reset_pwd_title")}</h3>
                  <p className="text-xs text-muted-foreground font-sans">{teachers.find(t_ => t_.id === showResetModal)?.name}</p>
                </div>
              </div>
              <div className="bg-muted rounded-xl p-4 mb-4">
                <p className="text-xs text-muted-foreground font-sans mb-1">{t("admin_temp_pwd")}</p>
                <p className="text-2xl font-mono font-bold text-foreground tracking-widest">{tmpPwd}</p>
              </div>
              <p className="text-xs text-muted-foreground font-sans mb-4">{t("admin_pwd_hint")}</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl font-sans" onClick={() => setShowResetModal(null)}>Отмена</Button>
                <Button className="flex-1 rounded-xl font-sans" onClick={async () => {
                  try {
                    await adminService.resetTeacherPassword(showResetModal!, tmpPwd);
                    toast.success("Пароль успешно изменён");
                    setShowResetModal(null);
                  } catch (e) {
                    toast.error("Ошибка при сбросе пароля");
                  }
                }}>Подтвердить</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TeacherModal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ isOpen: false })} 
        onSave={handleSave} 
        initialData={modal.data} 
      />
    </div>
  );
};
