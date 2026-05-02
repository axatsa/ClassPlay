import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import type {
  StatusFilter, PlanFilter, ExpiryFilter,
} from "./useUserFilters";

interface UserFilterDropdownProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  statusFilter: StatusFilter;
  planFilter: PlanFilter;
  schoolFilter: string;
  expiryFilter: ExpiryFilter;
  setStatusFilter: (v: StatusFilter) => void;
  setPlanFilter: (v: PlanFilter) => void;
  setSchoolFilter: (v: string) => void;
  setExpiryFilter: (v: ExpiryFilter) => void;
  activeFilterCount: number;
}

const STATUS_OPTIONS: ReadonlyArray<StatusFilter> = ["all", "active", "blocked"];
const PLAN_OPTIONS: ReadonlyArray<PlanFilter> = ["all", "FREE", "PRO", "SCHOOL"];
const EXPIRY_OPTIONS: ReadonlyArray<ExpiryFilter> = ["all", "today", "week", "month", "expired"];

const statusLabel = (s: StatusFilter): string =>
  s === "all" ? "Все" : s === "active" ? "Активные" : "Заблокированные";

const expiryLabel = (e: ExpiryFilter): string =>
  e === "all" ? "Все" :
  e === "today" ? "Сегодня" :
  e === "week" ? "На этой неделе" :
  e === "month" ? "В этом месяце" : "Истёкшие";

export const UserFilterDropdown: React.FC<UserFilterDropdownProps> = ({
  open, setOpen,
  statusFilter, planFilter, schoolFilter, expiryFilter,
  setStatusFilter, setPlanFilter, setSchoolFilter, setExpiryFilter,
  activeFilterCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="gap-2 rounded-xl font-sans"
        onClick={() => setOpen(!open)}
      >
        <Filter className="w-4 h-4" /> {t("adminFilter")}
        {activeFilterCount > 0 && (
          <Badge className="ml-1 bg-primary text-background">
            {activeFilterCount}
          </Badge>
        )}
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-10 z-50 bg-card border border-border rounded-xl shadow-lg p-3 min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Статус</p>
                <div className="space-y-1">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors font-sans ${
                        statusFilter === s
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {statusLabel(s)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">План</p>
                <div className="space-y-1">
                  {PLAN_OPTIONS.map((p) => (
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
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="h-8 text-xs rounded-lg font-sans"
                />
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Истечение</p>
                <div className="space-y-1">
                  {EXPIRY_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setExpiryFilter(e)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors font-sans ${
                        expiryFilter === e
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {expiryLabel(e)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
