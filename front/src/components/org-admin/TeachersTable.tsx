import { motion } from "framer-motion";
import { Plus, RefreshCw, Ban, Unlock, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrgTeacher as TeacherRow } from "@/types/api";

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-sans">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Активен
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-sans">
      <span className="w-1.5 h-1.5 rounded-full bg-destructive" /> Заблокирован
    </span>
  );
}

interface TeachersTableProps {
  teachers: TeacherRow[];
  isLoading: boolean;
  onToggleBlock: (id: number) => void;
  onDelete: (id: number) => void;
  onAddClick: () => void;
  onInviteClick: () => void;
  onRefresh: () => void;
}

export function TeachersTable({
  teachers,
  isLoading,
  onToggleBlock,
  onDelete,
  onAddClick,
  onInviteClick,
  onRefresh,
}: TeachersTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground font-sans">Учителя</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 font-sans rounded-xl" onClick={onRefresh}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="gap-2 font-sans rounded-xl" onClick={onInviteClick}>
            <Building2 className="w-3.5 h-3.5" /> Инвайт
          </Button>
          <Button size="sm" className="gap-2 font-sans rounded-xl" onClick={onAddClick}>
            <Plus className="w-3.5 h-3.5" /> Добавить
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Учитель", "Школа", "Лимит токенов", "Статус", "Действия"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground font-sans text-sm">
                    Нет учителей. Добавьте первого учителя или пришлите инвайт-ссылку.
                  </td>
                </tr>
              ) : (
                teachers.map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground font-sans text-sm">{t.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground font-sans">{t.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground font-sans">{t.school || "—"}</td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold font-mono text-foreground">
                        {((t.tokens_limit ?? 30000) / 1000).toFixed(0)}k
                      </span>
                      <span className="text-xs text-muted-foreground font-sans ml-1">/ мес</span>
                    </td>
                    <td className="px-5 py-4"><StatusBadge active={t.is_active} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onToggleBlock(t.id)}
                          className={`p-2 rounded-lg transition-colors ${t.is_active ? "hover:bg-destructive/10" : "hover:bg-emerald-500/10"}`}
                          title={t.is_active ? "Заблокировать" : "Разблокировать"}
                        >
                          {t.is_active
                            ? <Ban className="w-3.5 h-3.5 text-destructive" />
                            : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                        <button
                          onClick={() => onDelete(t.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
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
    </div>
  );
}
