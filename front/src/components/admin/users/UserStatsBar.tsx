import React from "react";
import { Ban, AlertTriangle } from "lucide-react";
import { Teacher } from "@/types/admin";

interface UserStatsBarProps {
  teachers: Teacher[];
}

const DAY_MS = 86400000;

export const UserStatsBar: React.FC<UserStatsBarProps> = ({ teachers }) => {
  const blockedCount = teachers.filter((t) => t.status === "blocked").length;
  const expiringCount = teachers.filter((t) => {
    if (!t.expires_at) return false;
    const daysLeft = Math.ceil((new Date(t.expires_at).getTime() - Date.now()) / DAY_MS);
    return daysLeft > 0 && daysLeft <= 7;
  }).length;
  const expiredCount = teachers.filter((t) => {
    if (!t.expires_at) return false;
    return new Date(t.expires_at).getTime() < Date.now();
  }).length;

  if (blockedCount === 0 && expiringCount === 0 && expiredCount === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-3 flex gap-4 text-xs font-sans">
      {blockedCount > 0 && (
        <div className="flex items-center gap-2">
          <Ban className="w-3.5 h-3.5 text-destructive" />
          <span>{blockedCount} заблокировано</span>
        </div>
      )}
      {expiringCount > 0 && (
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />
          <span>{expiringCount} истекают скоро</span>
        </div>
      )}
      {expiredCount > 0 && (
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
          <span>{expiredCount} истёкших</span>
        </div>
      )}
    </div>
  );
};
