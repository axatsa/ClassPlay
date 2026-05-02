import React from "react";
import { motion } from "framer-motion";
import {
  Clock, LogIn, Settings, Key, Lock, Unlock, X, ShieldCheck, ShieldOff, Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge, PlanBadge } from "../shared/AdminShared";
import { Teacher } from "@/types/admin";
import { TeacherFormData } from "@/components/admin/TeacherModal";

interface UserTableProps {
  filtered: Teacher[];
  isLoading: boolean;
  selectedIds: number[];
  setSelectedIds: (v: number[] | ((prev: number[]) => number[])) => void;
  toggleBlock: (id: number) => void;
  onImpersonate: (id: number) => void;
  onPromote: (id: number) => void;
  onDemote: (id: number) => void;
  onEdit: (data: TeacherFormData) => void;
  onResetPassword: (id: number) => void;
  onDelete: (id: number) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  filtered, isLoading, selectedIds, setSelectedIds,
  toggleBlock, onImpersonate, onPromote, onDemote, onEdit, onResetPassword, onDelete,
}) => {
  const { t } = useTranslation();

  const headers = [
    t("exp_teacher_login"),
    t("exp_school"),
    t("exp_last_login"),
    t("exp_tokens"),
    "Подписка",
    t("exp_status"),
    t("exp_action"),
  ];

  return (
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
                    if (e.target.checked) setSelectedIds(filtered.map((t_) => t_.id));
                    else setSelectedIds([]);
                  }}
                />
              </th>
              {headers.map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans whitespace-nowrap">
                  {h}
                </th>
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
                        if (e.target.checked) setSelectedIds((prev) => [...prev, t_.id]);
                        else setSelectedIds((prev) => prev.filter((id) => id !== t_.id));
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
                      <button
                        onClick={() => onEdit({
                          id: t_.id,
                          full_name: t_.name,
                          email: t_.login,
                          school: t_.school,
                          tokens_limit: t_.tokens_limit,
                          password: "",
                          phone: "",
                          plan: t_.plan,
                        })}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="Редактировать"
                      >
                        <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => onResetPassword(t_.id)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Сбросить пароль">
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
                      <button onClick={() => onDelete(t_.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="Удалить">
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
  );
};
