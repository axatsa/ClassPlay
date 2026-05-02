import { useState, useMemo } from "react";
import { Teacher } from "@/types/admin";

export type StatusFilter = "all" | "active" | "blocked";
export type PlanFilter = "all" | "FREE" | "PRO" | "SCHOOL";
export type ExpiryFilter = "all" | "today" | "week" | "month" | "expired";

export interface UserFiltersState {
  statusFilter: StatusFilter;
  planFilter: PlanFilter;
  schoolFilter: string;
  expiryFilter: ExpiryFilter;
}

export interface UserFiltersActions {
  setStatusFilter: (v: StatusFilter) => void;
  setPlanFilter: (v: PlanFilter) => void;
  setSchoolFilter: (v: string) => void;
  setExpiryFilter: (v: ExpiryFilter) => void;
}

export interface UseUserFiltersResult extends UserFiltersState, UserFiltersActions {
  filtered: Teacher[];
  activeFilterCount: number;
}

const DAY_MS = 86400000;

export function useUserFilters(teachers: Teacher[]): UseUserFiltersResult {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [schoolFilter, setSchoolFilter] = useState<string>("");
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>("all");

  const filtered = useMemo(() => {
    return teachers.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (planFilter !== "all" && t.plan !== planFilter) return false;
      if (schoolFilter && !t.school.toLowerCase().includes(schoolFilter.toLowerCase())) return false;

      if (expiryFilter !== "all" && t.expires_at) {
        const expiryDate = new Date(t.expires_at);
        const now = new Date();
        const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / DAY_MS);

        if (expiryFilter === "expired") {
          if (daysLeft >= 0) return false;
        } else if (expiryFilter === "today") {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (expiryDate < today) return false;
          const tomorrow = new Date(today.getTime() + DAY_MS);
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
  }, [teachers, statusFilter, planFilter, schoolFilter, expiryFilter]);

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    (planFilter !== "all" ? 1 : 0) +
    (schoolFilter ? 1 : 0) +
    (expiryFilter !== "all" ? 1 : 0);

  return {
    statusFilter,
    planFilter,
    schoolFilter,
    expiryFilter,
    setStatusFilter,
    setPlanFilter,
    setSchoolFilter,
    setExpiryFilter,
    filtered,
    activeFilterCount,
  };
}
